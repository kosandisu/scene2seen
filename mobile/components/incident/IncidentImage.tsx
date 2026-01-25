/**
 * Incident Image Component
 * Displays incident image with loading and error states
 */

import React, { useState } from 'react';
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

  if (!imageUrl) {
    return null; // Gracefully handle missing images
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
      accessibilityHint={onPress ? 'Double tap to view full image' : undefined}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator 
            size="small" 
            color="#3B82F6"
            accessibilityLabel="Loading image"
          />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
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
  },
  image: {
    width: '100%',
    height: 225,
    borderRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  errorContainer: {
    height: 80,
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
