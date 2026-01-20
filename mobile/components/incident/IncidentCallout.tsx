/**
 * Incident Callout Component
 * Interactive popup displayed when a map marker is clicked
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { IncidentReport, PriorityLevel } from '../../types/incident';
import { formatTimestamp } from '../../utils/date';
import { IncidentImage } from './IncidentImage';
import { DirectionsButton } from './DirectionsButton';
import { PrioritySelector } from './PrioritySelector';

interface IncidentCalloutProps {
  incident: IncidentReport;
}

export function IncidentCallout({ incident }: IncidentCalloutProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<PriorityLevel>(
    incident.priority ?? null
  );

  // Calculate responsive width (max 320px, min 280px, or 85% of screen)
  const calloutWidth = Math.min(Math.max(screenWidth * 0.85, 280), 320);

  const handlePriorityChange = useCallback(async (newPriority: PriorityLevel) => {
    setIsUpdatingPriority(true);
    
    try {
      const reportRef = doc(db, 'reports', incident.id);
      await updateDoc(reportRef, {
        priority: newPriority,
        priority_updated_at: new Date(),
      });
      
      setCurrentPriority(newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
      throw error; // Re-throw to let PrioritySelector handle the error
    } finally {
      setIsUpdatingPriority(false);
    }
  }, [incident.id]);

  const formattedTimestamp = formatTimestamp(incident.created_at);

  return (
    <Callout tooltip style={[styles.callout, { width: calloutWidth }]}>
      <View 
        style={styles.container}
        accessible
        accessibilityLabel="Incident details popup"
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* Image Section */}
          <IncidentImage imageUrl={incident.image_url} />

          {/* Header Section */}
          <View style={styles.header}>
            <Text 
              style={styles.title}
              accessibilityRole="header"
              numberOfLines={2}
            >
              Incident Report
            </Text>
            
            {/* Priority Badge */}
            {currentPriority && (
              <View 
                style={[
                  styles.priorityBadge,
                  currentPriority === 'high' && styles.priorityHigh,
                  currentPriority === 'medium' && styles.priorityMedium,
                  currentPriority === 'low' && styles.priorityLow,
                ]}
                accessibilityLabel={`Priority: ${currentPriority}`}
              >
                <Text style={styles.priorityBadgeText}>
                  {currentPriority.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {incident.text && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                <Text style={styles.sectionLabel}>Description</Text>
              </View>
              <Text 
                style={styles.description}
                accessibilityLabel={`Description: ${incident.text}`}
              >
                {incident.text}
              </Text>
            </View>
          )}

          {/* Metadata Grid */}
          <View style={styles.metadataGrid}>
            {/* Timestamp */}
            <View style={styles.metadataItem}>
              <View style={styles.metadataIcon}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
              </View>
              <View style={styles.metadataContent}>
                <Text style={styles.metadataLabel}>Reported</Text>
                <Text 
                  style={styles.metadataValue}
                  accessibilityLabel={`Reported ${formattedTimestamp}`}
                >
                  {formattedTimestamp}
                </Text>
              </View>
            </View>

            {/* Reporter */}
            {incident.reporter_name && (
              <View style={styles.metadataItem}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>Reporter</Text>
                  <Text 
                    style={styles.metadataValue}
                    numberOfLines={1}
                    accessibilityLabel={`Reporter: ${incident.reporter_name}`}
                  >
                    {incident.reporter_name}
                  </Text>
                </View>
              </View>
            )}

            {/* Location */}
            {incident.location_name && (
              <View style={[styles.metadataItem, styles.fullWidth]}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>Location</Text>
                  <Text 
                    style={styles.metadataValue}
                    numberOfLines={2}
                    accessibilityLabel={`Location: ${incident.location_name}`}
                  >
                    {incident.location_name}
                  </Text>
                </View>
              </View>
            )}

            {/* Coordinates (always show) */}
            <View style={[styles.metadataItem, styles.fullWidth]}>
              <View style={styles.metadataIcon}>
                <Ionicons name="compass-outline" size={14} color="#6B7280" />
              </View>
              <View style={styles.metadataContent}>
                <Text style={styles.metadataLabel}>Coordinates</Text>
                <Text 
                  style={styles.metadataValue}
                  accessibilityLabel={`Coordinates: ${incident.reporter_lat.toFixed(6)}, ${incident.reporter_lng.toFixed(6)}`}
                >
                  {incident.reporter_lat.toFixed(6)}, {incident.reporter_lng.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>

          {/* Directions Button */}
          <DirectionsButton
            destinationLat={incident.reporter_lat}
            destinationLng={incident.reporter_lng}
            locationName={incident.location_name}
          />

          {/* Priority Selector */}
          <PrioritySelector
            currentPriority={currentPriority}
            onPriorityChange={handlePriorityChange}
            isUpdating={isUpdatingPriority}
          />
        </ScrollView>

        {/* Callout Arrow */}
        <View style={styles.arrow} />
      </View>
    </Callout>
  );
}

const styles = StyleSheet.create({
  callout: {
    // Width is set dynamically
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 450,
  },
  scrollView: {
    flexGrow: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityLow: {
    backgroundColor: '#D1FAE5',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  fullWidth: {
    width: '100%',
  },
  metadataIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  arrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
