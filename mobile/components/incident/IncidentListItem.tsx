/**
 * Incident List Item Component
 * Displays a single incident in the list view
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { PRIORITY_CONFIG, DEFAULT_MARKER_COLOR } from '../../constants/priority';
import { formatTimestamp } from '../../utils/date';

interface IncidentListItemProps {
  incident: IncidentReport;
  onPress: (incident: IncidentReport) => void;
}

export function IncidentListItem({ incident, onPress }: IncidentListItemProps) {
  const priorityConfig = incident.priority ? PRIORITY_CONFIG[incident.priority] : undefined;
  const priorityColor = priorityConfig?.markerColor ?? DEFAULT_MARKER_COLOR;

  const priorityLabel = priorityConfig?.label ?? null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(incident)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Incident report: ${incident.text || 'No description'}. ${priorityLabel ? `Priority: ${priorityLabel}` : ''}`}
      accessibilityHint="Double tap to view on map"
    >
      {/* Priority Indicator */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {incident.image_url ? (
          <Image
            source={{ uri: incident.image_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: priorityColor + '20' }]}>
            <Ionicons name="warning" size={20} color={priorityColor} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {incident.text || 'Incident Report'}
          </Text>
          {priorityLabel && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {priorityLabel}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>{formatTimestamp(incident.created_at)}</Text>
          </View>
          
          {incident.reporter_name && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color="#9CA3AF" />
              <Text style={styles.metaText} numberOfLines={1}>
                {incident.reporter_name}
              </Text>
            </View>
          )}
        </View>

        {incident.location_name && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {incident.location_name}
            </Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  thumbnailContainer: {
    marginRight: 12,
    marginLeft: 4,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});
