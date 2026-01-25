/**
 * Incident Image Component
 * Fix: Uses dynamic aspect ratio to prevent cropping
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IncidentImageProps {
  imageUrl: string | null | undefined;
  onPress?: () => void;
}

export function IncidentImage({ imageUrl, onPress }: IncidentImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Default to 16:9 ratio (approx 1.77) to prevent layout jump
  const [aspectRatio, setAspectRatio] = useState(1.77); 

  useEffect(() => {
    if (!imageUrl) return;
    Image.getSize(
      imageUrl,
      (width, height) => {
        setAspectRatio(width / height);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to get image size:", error);
        setHasError(true);
        setIsLoading(false);
      }
    );
  }, [imageUrl]);

  if (!imageUrl) {
    return null;
  }

  if (hasError) {
    return (
      <View 
        style={styles.errorContainer}
        accessibilityLabel="Image failed to load"
      >
        <Ionicons name="image-outline" size={24} color="#9CA3AF" />
        <Text style={styles.errorText}>Image unavailable</Text>
      </View>
    );
  }

  const ImageWrapper = onPress ? TouchableOpacity : View;

  return (
    <ImageWrapper
      style={styles.container}
      onPress={onPress}
      accessibilityRole={onPress ? 'imagebutton' : 'image'}
      accessibilityLabel="Incident photo"
    >
      {isLoading && (
        <View style={[styles.loadingOverlay, { aspectRatio }]}>
          <ActivityIndicator 
            size="small" 
            color="#3B82F6"
          />
        </View>
      )}
      
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { aspectRatio }]} 
        resizeMode="contain" 
      />
    </ImageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    width: '100%', 
  },
  image: {
    width: '100%',
  },
  loadingOverlay: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  errorContainer: {
    height: 150, 
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
});