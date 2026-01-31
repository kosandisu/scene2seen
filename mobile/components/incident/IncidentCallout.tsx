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
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/IncidentCallout.styles';
import { GOOGLE_MAPS_API_KEY } from '../../constants/config';

import { Ionicons } from '@expo/vector-icons';
import type { IncidentReport } from '../../types/incident';
import { INCIDENT_TYPE_LABELS } from '../../types/incident';
import { formatTimestamp } from '../../utils/date';
import { IncidentImage } from './IncidentImage';
import { IncidentVoice } from './IncidentVoice';
import { DirectionsButton } from './DirectionsButton';

interface IncidentCalloutProps {
  incident: IncidentReport;
  onClose?: () => void;
}

export function IncidentCallout({ incident, onClose }: IncidentCalloutProps) {
  const { height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<any>();

  //location full -> landmark if exists st.
  const [displayLocation, setDisplayLocation] = useState(incident.location_name || 'unknown location');
  const [isFetchingPlace, setIsFetchingPlace] = useState(false);

  useEffect(() => {
    const fetchLandmarkName = async () => {
      if (!incident.reporter_lat || !incident.reporter_lng) return;

      setIsFetchingPlace(true);
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'places.displayName',
          },
          body: JSON.stringify({
            includedTypes: [
              'library',
              'preschool',
              'secondary_school',
              'primary_school',
              'bank',
              'atm',
              'convenience_store',
              'store',
              'hospital',
              'school',
              'government_office',
              'tourist_attraction',
              'restaurant',
              'transit_station',
              'church',
              'parking',
              'city_hall',
              'fire_station',
              'post_office',
              'government_office',
              'apartment_building',
              'apartment_complex',
              'police',
              'bus_stop',
              'bus_station',
            ],

            maxResultCount: 1,
            locationRestriction: {
              circle: {
                center: {
                  latitude: incident.reporter_lat,
                  longitude: incident.reporter_lng,
                },
                radius: 500, //500 metres 
              },
            },
            rankPreference: 'DISTANCE',
          }),
        });

        const data = await response.json();


        if (data.places && data.places.length > 0) {
          setDisplayLocation(data.places[0].displayName.text);
        }
      } catch (error) {
        console.error("Error fetching landmark:", error);
      } finally {
        setIsFetchingPlace(false);
      }
    };

    fetchLandmarkName();
  }, [incident.reporter_lat, incident.reporter_lng]);

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

  //using the user report from telegram
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

  // Helper to handle source click
  const handleSourcePress = () => {
    if (incident.source_url) {
      navigation.navigate('SourceWeb', {
        url: incident.source_url,
        title: incident.og_title || 'Incident Source'
      });
    }
  };

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View
        style={[styles.container, { maxHeight: screenHeight * 0.75 }]}
        accessible
        accessibilityLabel="Incident details popup"
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >

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

              <Pressable onPress={handleClose} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
          </View>

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
                    accessibilityLabel={`Reported by: ${incident.og_title || incident.reporter_name || 'Anonymous'}`}
                  >
                    {incident.og_title || incident.reporter_name || 'Anonymous'}
                  </Text>
                </View>
              </View>
            </View>

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

            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>

                  <Text
                    style={[
                      styles.detailValue,
                      { color: isFetchingPlace ? '#9CA3AF' : '#1F2937' } // Gray while loading
                    ]}
                    numberOfLines={3}
                    accessibilityLabel={`Location: ${displayLocation}`}
                  >
                    {/**pin if loc shi */}
                    {(!isFetchingPlace && displayLocation !== incident.location_name) ? "📍 " : ""}
                    {displayLocation}
                  </Text>


                  {(!isFetchingPlace && displayLocation !== incident.location_name) && (
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }} numberOfLines={1}>
                      {incident.location_name}
                    </Text>
                  )}

                </View>
              </View>
            </View>


            {/* link if from sns app or if report from app then app */}
            <View style={styles.gridRow}>
              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="link-outline" size={16} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Source Context</Text>

                  {incident.source_url ? (
                    // Link Card for ANY global URL (OG data or just raw link)
                    <Pressable
                      style={styles.linkCard}
                      onPress={handleSourcePress}
                    >
                      <View style={[
                        styles.linkCardStrip,
                        incident.source_url?.includes('facebook.com') && styles.facebookStrip,
                        (incident.source_url?.includes('x.com') || incident.source_url?.includes('twitter.com')) && styles.twitterStrip
                      ]} />
                      <View style={styles.linkCardContent}>
                        <Text style={styles.linkTitle} numberOfLines={2}>
                          {incident.og_title || 'Linked Content'}
                        </Text>

                        {incident.og_description && (
                          <Text style={styles.linkDesc} numberOfLines={2}>
                            {incident.og_description}
                          </Text>
                        )}

                        <View style={styles.linkFooter}>
                          <Text style={[
                            styles.linkDomain,
                            (incident.source_url?.includes('x.com') || incident.source_url?.includes('twitter.com')) && styles.twitterText
                          ]}>
                            {incident.og_site || 'See Original Post'} ↗
                          </Text>
                        </View>
                      </View>

                      <View style={[
                        styles.linkCardStrip,
                        incident.source_url?.includes('facebook.com') && styles.facebookStrip,
                        (incident.source_url?.includes('x.com') || incident.source_url?.includes('twitter.com')) && styles.twitterStrip
                      ]} />
                    </Pressable>
                  ) : incident.source_platform === 'app' ? (

                    <View style={styles.appSourceCard}>
                      <View style={styles.appSourceStrip} />
                      <View style={styles.appSourceContent}>
                        <Ionicons name="phone-portrait-outline" size={18} color="#FF6B35" />
                        <Text style={styles.appSourceText}>Reported via Scene2Seen App</Text>
                      </View>
                      <View style={styles.appSourceStrip} />
                    </View>
                  ) : (
                    // Telegram report with NO link (Just voice/image)
                    <View style={styles.telegramBackground}>
                      <View style={styles.telegramStrip} />
                      <View style={styles.appSourceContent}>
                        <Ionicons name="navigate-circle-outline" size={18} color="#0088cc" />
                        <Text style={styles.telegramText}>Reported via Telegram App</Text>
                      </View>
                      <View style={styles.telegramStrip} />
                    </View>
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

          {(incident.evidence_image_url || incident.og_image || incident.evidence_voice_url) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image-outline" size={16} color="#6B7280" />
                <Text style={styles.sectionLabel}>Attached Media</Text>
              </View>

              {/* Priority: Evidence Image > OG Image */}
              <IncidentImage imageUrl={incident.evidence_image_url || incident.og_image} />

              {/* Voice Memo Player */}
              {incident.evidence_voice_url && (
                <IncidentVoice url={incident.evidence_voice_url} />
              )}
            </View>
          )}

          {/**need to add conditional stuff to voice memos stuff */}
          {/* currently gets located to google maps in the browser */}
          <DirectionsButton
            destinationLat={incident.reporter_lat}
            destinationLng={incident.reporter_lng}
            locationName={incident.location_name}
          />
        </ScrollView>
      </View >
    </View >
  );
}