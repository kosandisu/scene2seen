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
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { Callout, CalloutSubview } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { formatTimestamp } from '../../utils/date';
import { IncidentImage } from './IncidentImage';
import { DirectionsButton } from './DirectionsButton';

interface IncidentCalloutProps {
  incident: IncidentReport;
  onClose?: () => void;
}

export function IncidentCallout({ incident, onClose }: IncidentCalloutProps) {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate responsive width (max 360px, min 300px, or 90% of screen)
  const calloutWidth = Math.min(Math.max(screenWidth * 0.9, 300), 360);

  const formattedTimestamp = formatTimestamp(incident.created_at);
  const criticalLevel = incident.critical_level || 'unidentified';
  
  // Generate incident ID based on created_at timestamp for sequential ordering
  const getIncidentNumber = () => {
    if (incident.created_at instanceof Date) {
      return incident.created_at.getTime() % 1000;
    } else if (typeof incident.created_at === 'object' && 'seconds' in incident.created_at) {
      return incident.created_at.seconds % 1000;
    }
    return Math.floor(Math.random() * 1000);
  };
  
  const incidentId = `INC-${String(getIncidentNumber()).padStart(3, '0')}`;
  
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

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
            <View style={styles.badgeContainer}>
              <View 
                style={[styles.criticalBadge, { backgroundColor: criticalStyle.backgroundColor }]}
                accessibilityLabel={`Critical level: ${criticalStyle.text}`}
              >
                <Text style={styles.criticalBadgeText}>{criticalStyle.text}</Text>
              </View>
              <CalloutSubview onPress={handleClose}>
                <Pressable onPress={handleClose} hitSlop={8}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </CalloutSubview>
            </View>
          </View>

          {/* Incident Details Grid (3x2 with Source URL) */}
          {/* Incident Details Grid */}
          <View style={styles.detailsGrid}>
            
            {/* Row 1: Type & Reported By (Side by Side) */}
            <View style={styles.gridRow}>
              {/* Type */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {/*later incident.type */}
                    null
                  </Text>
                </View>
              </View>

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
            </View>

            {/* Row 2: Reported Time (Full Width) */}
            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Reported</Text>
                  <Text 
                    style={styles.detailValue}
                    accessibilityLabel={`Reported ${formattedTimestamp}`}
                  >
                    {formattedTimestamp}
                  </Text>
                </View>
              </View>
            </View>

            {/* Row 3: Location (Full Width) */}
            {/* Row 3: Location (Full Width) */}
            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  
                  {/* CHANGE IS HERE: Use location_name, fallback to coordinates */}
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={3} // Allow 3 lines for long addresses
                    accessibilityLabel={`Location: ${incident.location_name || coordinates}`}
                  >
                    {incident.location_name || coordinates}
                  </Text>
                  
                </View>
              </View>
            </View>

            {/* Row 4: Source Context (Rich Preview) */}
            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="link-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Source Context</Text>
                  
                  {incident.og_title ? (
                    /* OPTION A: RICH PREVIEW CARD (Bot found data!) */
                    <Pressable 
                      style={styles.linkCard}
                      onPress={() => incident.source_url && Linking.openURL(incident.source_url)}
                    >
                      {/* Left blue strip for style */}
                      <View style={styles.linkCardStrip} />
                      
                      <View style={styles.linkCardContent}>
                        <Text style={styles.linkTitle} numberOfLines={2}>
                          {incident.og_title}
                        </Text>
                        
                        {incident.og_description && (
                          <Text style={styles.linkDesc} numberOfLines={2}>
                            {incident.og_description}
                          </Text>
                        )}
                        
                        <View style={styles.linkFooter}>
                          <Text style={styles.linkDomain}>
                            {incident.og_site || 'External Link'} ↗
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ) : (
                    /* OPTION B: FALLBACK (Bot found nothing, just show the link) */
                    <Text 
                      style={[styles.detailValue, styles.urlText]}
                      numberOfLines={1}
                      onPress={() => incident.source_url && Linking.openURL(incident.source_url)}
                    >
                      {incident.source_url || 'N/A'}
                    </Text>
                  )}
                </View>
              </View>
            </View>


          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text 
              style={styles.description}
              accessibilityLabel={`Description: ${incident.text && !incident.text.startsWith('http') ? incident.text : 'N/A'}`}
            >
              {incident.text && !incident.text.startsWith('http') ? incident.text : 'N/A'}
            </Text>
          </View>

          {/* Attached Media */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="image-outline" size={16} color="#6B7280" />
              <Text style={styles.sectionLabel}>Attached Media</Text>
            </View>
            <IncidentImage imageUrl={incident.image_url} />
          </View>

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
    maxHeight: 600,
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
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  criticalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '300',
    marginLeft: 8,
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
  urlText: {
    color: '#3B82F6',
  },
  detailsGrid: {
    marginTop: 8,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    marginBottom: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    //flex: 1,
    width: '50%', // Default to half width
    marginBottom: 12, 
    paddingRight: 8,
  },
  fullWidth: {
    width: '100%',
    //flex: 1,
    marginRight: 0,
    marginLeft: 0,
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
  /* --- NEW STYLES FOR LINK PREVIEW --- */
  linkCard: {
    marginTop: 6,
    backgroundColor: '#F9FAFB', // Light grey background
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Subtle border
  },
  linkCardStrip: {
    width: 4,
    backgroundColor: '#3B82F6', // The blue accent line on the left
  },
  linkCardContent: {
    padding: 10,
    flex: 1,
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '700', // Bold title
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  linkDesc: {
    fontSize: 12,
    color: '#6B7280', // Greener text for description
    lineHeight: 16,
    marginBottom: 8,
  },
  linkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkDomain: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6', // Blue link color
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
