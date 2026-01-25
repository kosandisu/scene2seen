/**
 * Incident Marker Component
 * Custom map marker with priority-based coloring
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { PRIORITY_CONFIG, DEFAULT_MARKER_COLOR } from '../../constants/priority';
import { IncidentCallout } from './IncidentCallout';

interface IncidentMarkerProps {
  incident: IncidentReport;
}

export function IncidentMarker({ incident }: IncidentMarkerProps) {
  const markerRef = useRef<any>(null);
  const priorityConfig = incident.priority ? PRIORITY_CONFIG[incident.priority] : undefined;
  const markerColor = priorityConfig?.markerColor ?? DEFAULT_MARKER_COLOR;

  const priorityLabel = priorityConfig
    ? `${priorityConfig.label} priority`
    : 'No priority set';

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: incident.reporter_lat,
        longitude: incident.reporter_lng,
      }}
      tracksViewChanges={false}
      accessibilityLabel={`Incident marker. ${priorityLabel}. ${incident.text || 'No description'}`}
      accessibilityHint="Tap to view incident details"
    >
      {/* Custom Marker View */}
      <View 
        style={styles.markerContainer}
        accessibilityRole="button"
      >
        <View style={[styles.markerOuter, { backgroundColor: markerColor }]}>
          <View style={styles.markerInner}>
            <Ionicons 
              name="warning" 
              size={16} 
              color={markerColor}
            />
          </View>
        </View>
        
        <View 
          style={[styles.markerPoint, { borderTopColor: markerColor }]} 
        />
        
        {/* Priority indicator ring
        removed for now
        {incident.priority && (
          <View 
            style={[
              styles.priorityRing,
              { borderColor: markerColor },
            ]} 
          />
        )}
        
        */}
        
      </View>

      {/* Callout Popup */}
      <IncidentCallout
        incident={incident}
        onClose={() => markerRef.current?.hideCallout()}
      />
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  priorityRing: {
    position: 'absolute',
    top: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
});
