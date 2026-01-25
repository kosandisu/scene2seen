import React, { useRef } from 'react';
import { View } from 'react-native';
import { styles } from '../styles/IncidentMarker.styles';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { PRIORITY_CONFIG, DEFAULT_MARKER_COLOR } from '../../constants/priority';

interface IncidentMarkerProps {
  incident: IncidentReport;
  onPress: () => void;
}

export function IncidentMarker({ incident, onPress }: IncidentMarkerProps) {
  const priorityConfig = incident.priority ? PRIORITY_CONFIG[incident.priority] : undefined;
  const markerColor = priorityConfig?.markerColor ?? DEFAULT_MARKER_COLOR;

  const priorityLabel = priorityConfig
    ? `${priorityConfig.label} priority`
    : 'No priority set';

  return (
    <Marker
      coordinate={{
        latitude: incident.reporter_lat,
        longitude: incident.reporter_lng,
      }}
      onPress={(e) => {
        e.stopPropagation();
        onPress();
      }}
      tracksViewChanges={false}
      accessibilityLabel={`Incident marker. ${priorityLabel}. ${incident.text || 'No description'}`}
      accessibilityHint="Tap to view incident details"
    >
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
      </View>
    </Marker>
  );
}
