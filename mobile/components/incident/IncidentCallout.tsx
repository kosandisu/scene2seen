/**
 * Incident Callout Component
 * Interactive popup displayed when a map marker is clicked
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Linking,
} from 'react-native';
import { styles } from './IncidentCallout.styles';

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
  const { height: screenHeight } = useWindowDimensions();

  // REMOVED: calloutWidth calculation (Overlay uses 100% width)

  const formattedTimestamp = formatTimestamp(incident.created_at);
  const criticalLevel = incident.priority;
  
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
  
  // no fallback for now
  //const coordinates = `${incident.reporter_lat.toFixed(4)}, ${incident.reporter_lng.toFixed(4)}`;

  // critical level tag at the top 
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
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={handleClose} />
      
      <View 
        style={[styles.container, { maxHeight: screenHeight * 0.7 }]}
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
              
              {/* Removed CalloutSubview wrapper */}
              <Pressable onPress={handleClose} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Incident Details Grid (3x2 with Source URL) */}
          {/* Incident Details Grid */}
          <View style={styles.detailsGrid}>
            
            
            <View style={styles.gridRow}>
              {/* Type */}
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {incident.type}
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
                    
                    accessibilityLabel={`Reported by: ${incident.og_title || 'Anonymous'}`}
                  >
                    {incident.og_title || 'Anonymous'}
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
            
            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  
                  {/* used to have coordinates as fallback but rmv-ed em */}
                  <Text 
                    style={styles.detailValue}
                    numberOfLines={3} 
                    accessibilityLabel={`Location: ${incident.location_name}`}
                  >
                    {incident.location_name}
                  </Text>
                  
                </View>
              </View>
            </View>

            {/* Source context htr pee embedded preview */}
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
                          {/**external link aint pressable because the og_site doesn't appear in the firebase save */}
                          <Text style={styles.linkDomain}>
                            {incident.og_site || 'External Link'} ↗
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ) : (
                    /* the fallback link also isn't showing */
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

          {/* need to change the image size*/}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="image-outline" size={16} color="#6B7280" />
              <Text style={styles.sectionLabel}>Attached Media</Text>
            </View>
            <IncidentImage imageUrl={incident.og_image} />
          </View>

          {/* Directions Button */}
          <DirectionsButton
            destinationLat={incident.reporter_lat}
            destinationLng={incident.reporter_lng}
            locationName={incident.location_name}
          />
        </ScrollView>
      </View>
    </View>
  );
}