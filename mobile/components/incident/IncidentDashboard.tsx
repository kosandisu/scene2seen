/**
 * Incident Dashboard (Bottom Sheet)
 * Draggable bottom sheet showing list of all incidents
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { styles } from '../styles/IncidentDashboard.styles';
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
import type { IncidentReport, PriorityLevel, IncidentType } from '../../types/incident';
import { IncidentListItem } from './IncidentListItem';
import { PRIORITY_CONFIG } from '../../constants/priority';
import  {INCIDENT_TYPE_LABELS}  from '../../types/incident';
import { TouchableOpacity, SectionList } from 'react-native';

interface IncidentDashboardProps {
  incidents: IncidentReport[];
  onIncidentPress: (incident: IncidentReport) => void;
  isLoading?: boolean;
}

type GroupByOption = 'location' | 'type' | 'priority' | 'date';

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
  const [groupBy, setGroupBy] = useState<GroupByOption>('location');
  
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

  const classifyIncidentType = useCallback((incident: IncidentReport): IncidentType => {
    const text = [
      incident.text,
      incident.og_title,
      incident.og_description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matches = (keywords: string[]) =>
      keywords.some((word) => text.includes(word));

    if (matches(['fire', 'wildfire', 'smoke', 'blaze', 'burning'])) return 'fire';
    if (matches(['flood', 'inundation', 'flash flood', 'overflow'])) return 'flood';
    if (matches(['accident', 'crash', 'collision', 'vehicle', 'car', 'truck', 'bus']))
      return 'accident';
    if (matches(['collapse', 'collapsed', 'building collapse', 'bridge collapse', 'structural']))
      return 'collapse';

    return 'other';
  }, []);

  const getIncidentDate = useCallback((incident: IncidentReport): Date | null => {
    const timestamp = incident.created_at;
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }
    return null;
  }, []);

  const getIncidentDateKey = useCallback((incident: IncidentReport): string => {
    const date = getIncidentDate(incident);
    if (!date || isNaN(date.getTime())) return 'unknown';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [getIncidentDate]);

  const formatDateLabel = useCallback((dateKey: string): string => {
    if (dateKey === 'unknown') return 'Unknown date';
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }, []);

  const getGroupKey = useCallback((incident: IncidentReport, option: GroupByOption) => {
    switch (option) {
      case 'type':
        return (incident.type ?? classifyIncidentType(incident)) as IncidentType;
      case 'priority':
        return incident.priority || 'unset';
      case 'date':
        return getIncidentDateKey(incident);
      case 'location':
      default:
        return incident.location_name || 'Unknown location';
    }
  }, [classifyIncidentType, getIncidentDateKey]);

  const sections = useMemo(() => {
    const map = new Map<string, IncidentReport[]>();
    incidents.forEach((incident) => {
      const key = getGroupKey(incident, groupBy);
      const list = map.get(key);
      if (list) {
        list.push(incident);
      } else {
        map.set(key, [incident]);
      }
    });

    const entries = Array.from(map.entries()).map(([key, data]) => {
      if (groupBy === 'priority') {
        // Only 'high', 'medium', 'low' are valid keys for PRIORITY_CONFIG
        let priorityKey: 'high' | 'medium' | 'low' | 'unset';
        if (key === 'high' || key === 'medium' || key === 'low') {
          priorityKey = key;
        } else {
          priorityKey = 'unset';
        }
        const priorityConfig =
          priorityKey !== 'unset' ? PRIORITY_CONFIG[priorityKey] : undefined;
        return {
          title: priorityConfig?.label ?? 'Unspecified',
          data,
          priorityColor: priorityConfig?.markerColor ?? '#9CA3AF',
          priorityKey,
        };
      }

      if (groupBy === 'type') {
        const typeKey: IncidentType =
          key === 'fire' || key === 'flood' || key === 'accident' || key === 'collapse'
            ? key
            : 'other';
        return {
          title: INCIDENT_TYPE_LABELS[typeKey],
          data,
          typeKey,
        };
      }
      if (groupBy === 'date') {
        return {
          title: formatDateLabel(key),
          data,
          dateKey: key,
        };
      }
      return { title: key, data };
    });

    if (groupBy === 'priority') {
      return entries.sort((a, b) => {
        const order = ['high', 'medium', 'low', 'unset'];
        const valid = (k: any): 'high' | 'medium' | 'low' | 'unset' =>
          k === 'high' || k === 'medium' || k === 'low' ? k : 'unset';
        const aKey = 'priorityKey' in a ? valid(a.priorityKey) : 'unset';
        const bKey = 'priorityKey' in b ? valid(b.priorityKey) : 'unset';
        return order.indexOf(aKey) - order.indexOf(bKey);
      });
    }

    if (groupBy === 'date') {
      return entries.sort((a, b) => {
        const aKey = 'dateKey' in a ? a.dateKey : 'unknown';
        const bKey = 'dateKey' in b ? b.dateKey : 'unknown';
        if (aKey === 'unknown' && bKey === 'unknown') return 0;
        if (aKey === 'unknown') return 1;
        if (bKey === 'unknown') return -1;
        return bKey.localeCompare(aKey);
      });
    }

    return entries.sort((a, b) => a.title.localeCompare(b.title));
  }, [groupBy, incidents, getGroupKey]);

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
          <View style={styles.groupByRow}>
            <Text style={styles.groupByLabel}>Sort by</Text>
            <View style={styles.groupToggleContainer}>
              {([
                { key: 'location', label: 'Location' },
                { key: 'type', label: 'Type' },
                { key: 'priority', label: 'Severity' },
                { key: 'date', label: 'Date' },
              ] as const).map((option) => {
                const isActive = groupBy === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.groupToggleButton, isActive && styles.groupToggleButtonActive]}
                    onPress={() => setGroupBy(option.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sort by ${option.label}`}
                  >
                    <Text
                      style={[
                        styles.groupToggleText,
                        isActive && styles.groupToggleTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* List Content */}
        <SectionList
          sections={sections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                {'priorityColor' in section && (
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: section.priorityColor },
                    ]}
                  />
                )}
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
          bounces={true}
          overScrollMode="always"
          stickySectionHeadersEnabled={true}
        />
      </Animated.View>
    </>
  );
}

