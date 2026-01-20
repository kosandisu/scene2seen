/**
 * Directions Button Component
 * Opens Google Maps with directions to the incident location
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openDirections } from '../../utils/location';

interface DirectionsButtonProps {
  destinationLat: number;
  destinationLng: number;
  locationName?: string | null;
}

export function DirectionsButton({
  destinationLat,
  destinationLng,
  locationName,
}: DirectionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await openDirections(destinationLat, destinationLng);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`Get directions to ${locationName || 'incident location'}`}
      accessibilityHint="Opens Google Maps with directions from your current location"
      accessibilityState={{ busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color="#FFFFFF"
          accessibilityLabel="Loading directions"
        />
      ) : (
        <View style={styles.content}>
          <Ionicons 
            name="navigate" 
            size={18} 
            color="#FFFFFF" 
            style={styles.icon}
          />
          <Text style={styles.text}>Get Directions</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    minHeight: 48, // Accessibility minimum touch target
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
