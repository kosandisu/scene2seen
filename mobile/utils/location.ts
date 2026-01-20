/**
 * Location Utilities
 */

import * as Location from 'expo-location';
import { Linking, Alert, Platform } from 'react-native';
import type { UserLocation } from '../types/incident';

/**
 * Request location permissions from the user
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Get the user's current location
 * @returns Promise<UserLocation | null> - User's coordinates or null if unavailable
 */
export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services in your device settings to get directions from your current location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          },
        ]
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    Alert.alert(
      'Location Unavailable',
      'Unable to get your current location. Please check your device settings and try again.'
    );
    return null;
  }
}

/**
 * Open Google Maps with directions from user's location to destination
 * @param destinationLat - Destination latitude
 * @param destinationLng - Destination longitude
 * @param userLocation - Optional user location (if already known)
 */
export async function openDirections(
  destinationLat: number,
  destinationLng: number,
  userLocation?: UserLocation | null
): Promise<void> {
  try {
    let origin = '';
    
    // Try to get user location if not provided
    if (userLocation) {
      origin = `${userLocation.latitude},${userLocation.longitude}`;
    } else {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      }
    }

    const destination = `${destinationLat},${destinationLng}`;
    
    // Construct Google Maps URL
    // If origin is available, use it; otherwise, let Google Maps use device location
    let mapsUrl: string;
    
    if (origin) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    } else {
      // Fallback: Open Google Maps with just the destination
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }

    const canOpen = await Linking.canOpenURL(mapsUrl);
    
    if (canOpen) {
      await Linking.openURL(mapsUrl);
    } else {
      // Fallback to web URL
      await Linking.openURL(`https://www.google.com/maps?q=${destination}`);
    }
  } catch (error) {
    console.error('Error opening directions:', error);
    Alert.alert(
      'Navigation Error',
      'Unable to open navigation. Please try again.'
    );
  }
}
