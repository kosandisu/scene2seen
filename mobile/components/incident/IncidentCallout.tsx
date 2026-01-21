/**
 * Incident Callout Component
 * Interactive popup displayed when a map marker is clicked
 */

import React from 'react';
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
import type { IncidentReport } from '../../types/incident';
import { formatTimestamp } from '../../utils/date';
import { IncidentImage } from './IncidentImage';
import { DirectionsButton } from './DirectionsButton';

interface IncidentCalloutProps {
  incident: IncidentReport;
}

export function IncidentCallout({ incident }: IncidentCalloutProps) {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate responsive width (max 320px, min 280px, or 85% of screen)
  const calloutWidth = Math.min(Math.max(screenWidth * 0.85, 280), 320);

  const formattedTimestamp = formatTimestamp(incident.created_at);
  const criticalLevel = incident.critical_level || 'unidentified';
  
  // Generate incident ID (you can later implement proper logic based on created_at ordering)
  const incidentId = `INC-${incident.id.substring(0, 3).toUpperCase()}`;
  
  // Format coordinates in one line
  const coordinates = `${incident.reporter_lat.toFixed(4)}, ${incident.reporter_lng.toFixed(4)}`;

  // Get critical level style
  const getCriticalLevelStyle = () => {
    switch (criticalLevel) {
      case 'high':
        return { backgroundColor: '#EF4444', text: 'Critical' };
      case 'medium':
        return { backgroundColor: '#F97316', text: 'Medium' };
      case 'low':
        return { backgroundColor: '#22C55E', text: 'Low' };
      default:
        return { backgroundColor: '#9CA3AF', text: 'Unidentified' };
    }
  };

  const criticalStyle = getCriticalLevelStyle();

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
          {/* Header Section with ID and Critical Level */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text 
                style={styles.title}
                accessibilityRole="header"
              >
                Incident Details
              </Text>
              <Text style={styles.incidentId}>{incidentId}</Text>
            </View>
            <View 
              style={[styles.criticalBadge, { backgroundColor: criticalStyle.backgroundColor }]}
              accessibilityLabel={`Critical level: ${criticalStyle.text}`}
            >
              <Text style={styles.criticalBadgeText}>{criticalStyle.text}</Text>
            </View>
          </View>

          {/* Incident Details Grid (2x2) */}
          <View style={styles.detailsGrid}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              {/* Type */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    null
                  </Text>
                </View>
              </View>

              {/* Reported */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Reported</Text>
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={1}
                    accessibilityLabel={`Reported ${formattedTimestamp}`}
                  >
                    {formattedTimestamp}
                  </Text>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              {/* Reported By */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Reported By</Text>
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={1}
                    accessibilityLabel={`Reported by: ${incident.reporter_name || 'Anonymous'}`}
                  >
                    {incident.reporter_name || 'Anonymous'}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={1}
                    accessibilityLabel={`Location: ${coordinates}`}
                  >
                    {coordinates}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          {incident.text && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text 
                style={styles.description}
                accessibilityLabel={`Description: ${incident.text}`}
              >
                {incident.text}
              </Text>
            </View>
          )}

          {/* Attached Media */}
          {incident.image_url && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image-outline" size={16} color="#6B7280" />
                <Text style={styles.sectionLabel}>Attached Media</Text>
              </View>
              <IncidentImage imageUrl={incident.image_url} />
            </View>
          )}

          {/* Source URL */}
          {incident.source_url && (
            <View style={styles.sourceUrlContainer}>
              <View style={styles.detailIcon}>
                <Ionicons name="link-outline" size={16} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Source URL</Text>
                <Text 
                  style={[styles.detailValue, styles.urlText]}
                  numberOfLines={1}
                  accessibilityLabel={`Source URL: ${incident.source_url}`}
                >
                  {incident.source_url}
                </Text>
              </View>
            </View>
          )}

          {/* Directions Button */}
          <DirectionsButton
            destinationLat={incident.reporter_lat}
            destinationLng={incident.reporter_lng}
            locationName={incident.location_name}
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  incidentId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  criticalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  criticalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  sourceUrlContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  urlText: {
    color: '#3B82F6',
  },
  detailsGrid: {
    marginTop: 8,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginHorizontal: 4,
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 18,
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
