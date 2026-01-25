/**
 * Directions Button Component
 * Opens Google Maps with directions to the incident location
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import { styles } from '../styles/DirectionsButton.styles';
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


