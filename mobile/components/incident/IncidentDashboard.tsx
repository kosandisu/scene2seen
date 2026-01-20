/**
 * Incident Dashboard (Bottom Sheet)
 * Draggable bottom sheet showing list of all incidents
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { IncidentListItem } from './IncidentListItem';

interface IncidentDashboardProps {
  incidents: IncidentReport[];
  onIncidentPress: (incident: IncidentReport) => void;
  isLoading?: boolean;
}

// Spring configuration for smooth animations
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 0.5,
};

// Snap points as percentages of screen height
const SNAP_POINTS = {
  COLLAPSED: 0.12, // Just shows handle and title
  HALF: 0.5,       // Half screen
  EXPANDED: 0.85,  // Almost full screen
};

export function IncidentDashboard({
  incidents,
  onIncidentPress,
  isLoading = false,
}: IncidentDashboardProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Calculate actual heights
  const collapsedHeight = screenHeight * SNAP_POINTS.COLLAPSED;
  const halfHeight = screenHeight * SNAP_POINTS.HALF;
  const expandedHeight = screenHeight * SNAP_POINTS.EXPANDED;
  
  // Shared values for animation
  const translateY = useSharedValue(screenHeight - collapsedHeight);
  const context = useSharedValue({ y: 0 });
  const isExpanded = useSharedValue(false);
  
  // Initialize position
  useEffect(() => {
    translateY.value = screenHeight - collapsedHeight;
  }, [screenHeight, collapsedHeight]);

  // Snap to nearest point
  const snapToPoint = useCallback((velocityY: number) => {
    'worklet';
    const currentY = translateY.value;
    const positions = [
      screenHeight - expandedHeight,
      screenHeight - halfHeight,
      screenHeight - collapsedHeight,
    ];
    
    // If velocity is significant, snap in velocity direction
    if (Math.abs(velocityY) > 500) {
      if (velocityY < 0) {
        // Swiping up - expand
        const currentIndex = positions.findIndex(p => currentY <= p + 50);
        const targetIndex = Math.max(0, currentIndex - 1);
        translateY.value = withSpring(positions[targetIndex], SPRING_CONFIG);
        isExpanded.value = targetIndex < 2;
      } else {
        // Swiping down - collapse
        const currentIndex = positions.findIndex(p => currentY <= p + 50);
        const targetIndex = Math.min(positions.length - 1, currentIndex + 1);
        translateY.value = withSpring(positions[targetIndex], SPRING_CONFIG);
        isExpanded.value = targetIndex < 2;
      }
      return;
    }
    
    // Find nearest snap point
    let nearestPoint = positions[0];
    let minDistance = Math.abs(currentY - positions[0]);
    
    for (const point of positions) {
      const distance = Math.abs(currentY - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
    
    translateY.value = withSpring(nearestPoint, SPRING_CONFIG);
    isExpanded.value = nearestPoint !== screenHeight - collapsedHeight;
  }, [screenHeight, expandedHeight, halfHeight, collapsedHeight]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      // Clamp between expanded and collapsed positions
      translateY.value = Math.max(
        screenHeight - expandedHeight,
        Math.min(screenHeight - collapsedHeight + 20, newY)
      );
    })
    .onEnd((event) => {
      snapToPoint(event.velocityY);
    });

  // Tap gesture for quick expand/collapse
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (isExpanded.value) {
        translateY.value = withSpring(screenHeight - collapsedHeight, SPRING_CONFIG);
        isExpanded.value = false;
      } else {
        translateY.value = withSpring(screenHeight - halfHeight, SPRING_CONFIG);
        isExpanded.value = true;
      }
    });

  // Combined gesture
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Animated styles
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleIndicatorStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [screenHeight - expandedHeight, screenHeight - collapsedHeight],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      width: interpolate(progress, [0, 1], [40, 60]),
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [screenHeight - expandedHeight, screenHeight - collapsedHeight],
      [0.3, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: opacity > 0 ? 'auto' : 'none',
    };
  });

  const headerOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [screenHeight - halfHeight, screenHeight - collapsedHeight],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const renderItem = useCallback(
    ({ item }: { item: IncidentReport }) => (
      <IncidentListItem incident={item} onPress={onIncidentPress} />
    ),
    [onIncidentPress]
  );

  const keyExtractor = useCallback((item: IncidentReport) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Incidents</Text>
        <Text style={styles.emptyText}>
          Incident reports will appear here when submitted.
        </Text>
      </View>
    ),
    []
  );

  return (
    <>
      {/* Background overlay */}
      <Animated.View 
        style={[styles.overlay, overlayStyle]} 
        pointerEvents="none"
      />

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle Area */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={styles.handleContainer}>
            <Animated.View style={[styles.handle, handleIndicatorStyle]} />
            
            {/* Collapsed Header */}
            <Animated.View style={[styles.collapsedHeader, headerOpacity]}>
              <View style={styles.titleRow}>
                <Ionicons name="list" size={18} color="#3B82F6" />
                <Text style={styles.title}>Incidents</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incidents.length}</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Tap to view all reports</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Expanded Header */}
        <View style={styles.expandedHeader}>
          <View style={styles.expandedTitleRow}>
            <Text style={styles.expandedTitle}>All Incidents</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{incidents.length} reports</Text>
            </View>
          </View>
        </View>

        {/* List Content */}
        <FlatList
          data={incidents}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
          bounces={true}
          overScrollMode="always"
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  collapsedHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  expandedHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  countPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  listContent: {
    paddingTop: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
