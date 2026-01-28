//user in app report form 
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getCurrentLocation } from '@/utils/location';
import { GOOGLE_MAPS_API_KEY } from '@/constants/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export default function IncidentForm({ onClose }: { onClose: () => void }) {
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [snsLink, setSnsLink] = useState('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //use the incident report types from telegram. 
  const types = ['🔥 Fire', '🚗 Accident', '🌊 Flood', '🏗️ Collapse', '❓ Other'];
  const severities = [
    { label: '🔴 High', value: 'high' },
    { label: '🟠 Medium', value: 'medium' },
    { label: '🟢 Low', value: 'low' }
  ];

  const incidentTypeMap = useMemo(
    () => ({
      '🔥 Fire': 'fire',
      '🚗 Accident': 'accident',
      '🌊 Flood': 'flood',
      '🏗️ Collapse': 'collapse',
      '❓ Other': 'other',
    }),
    []
  );

  const resolveAddressFromGoogle = async (latitude: number, longitude: number) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return '';
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        return data.results[0]?.formatted_address ?? '';
      }
      return '';
    } catch {
      return '';
    }
  };

  const handleShareLocation = async () => {
    if (isFetchingLocation) return;

    setIsFetchingLocation(true);
    try {
      const current = await getCurrentLocation();
      if (!current) return;

      setLocationCoords({ latitude: current.latitude, longitude: current.longitude });

      const address = await resolveAddressFromGoogle(current.latitude, current.longitude);
      if (address) {
        setLocationLabel(address);
      } else {
        setLocationLabel(`${current.latitude.toFixed(6)}, ${current.longitude.toFixed(6)}`);
      }
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!incidentType) {
      Alert.alert('Missing Incident Type', 'Please select an incident type.');
      return;
    }

    if (!severity) {
      Alert.alert('Missing Severity', 'Please assign a severity level.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a brief description.');
      return;
    }

    if (!locationCoords) {
      Alert.alert('Missing Location', 'Please share your current location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      const reporterName =
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        null;

      const incidentTypeValue = incidentTypeMap[incidentType as keyof typeof incidentTypeMap] ?? 'other';

      await addDoc(collection(db, 'reports'), {
        type: incidentTypeValue,
        text: description.trim(),
        source_url: snsLink.trim() || null,
        reporter_lat: locationCoords.latitude,
        reporter_lng: locationCoords.longitude,
        source_platform: 'app',
        created_at: serverTimestamp(),
        reporter_name: reporterName,
        location_name: locationLabel || null,
        priority: severity,
      });

      Alert.alert('Report Submitted', 'Your incident report has been shared.');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Submission Failed', 'Unable to submit your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  {/**not in the center at all */}
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Incident Report</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.label}>1. Select Incident Type</Text>
        <View style={styles.typeGrid}>
          {types.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBtn, incidentType === t && styles.selectedBtn]}
              onPress={() => setIncidentType(t)}
            >
              <Text style={[styles.typeText, incidentType === t && styles.selectedText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Severity Level */}
        <Text style={styles.label}>2. Assign Severity Level</Text>
        <View style={styles.severityRow}>
          {severities.map(s => (
            <TouchableOpacity 
              key={s.value} 
              style={[styles.sevBtn, severity === s.value && styles.selectedBtn]}
              onPress={() => setSeverity(s.value)}
            >
              <Text style={[styles.typeText, severity === s.value && styles.selectedText]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. SNS Link (Bot Requirement) */}
        <Text style={styles.label}>3. SNS Link (Facebook, X, etc.)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Paste social media link here..."
          value={snsLink}
          onChangeText={setSnsLink}
        />

        {/* 4. Description */}
        <Text style={styles.label}>4. Brief Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="e.g. Large fire visible from highway"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* 5. Location Step */}
        <Text style={styles.label}>5. Final Step: Location</Text>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={handleShareLocation}
          disabled={isFetchingLocation}
          accessibilityRole="button"
          accessibilityLabel="Share current location"
          accessibilityHint="Fetches your current location from Google Maps"
          accessibilityState={{ busy: isFetchingLocation }}
        >
          {isFetchingLocation ? (
            <ActivityIndicator size="small" color="#FF4444" />
          ) : (
            <Ionicons name="location" size={24} color="#FF4444" />
          )}
          <Text style={styles.locationBtnText}>
            {locationLabel ? 'Location added' : 'Tap to share current location'}
          </Text>
        </TouchableOpacity>
        {locationLabel ? (
          <Text style={styles.locationPreview}>
            {locationLabel}
            {locationCoords ? ` (${locationCoords.latitude.toFixed(5)}, ${locationCoords.longitude.toFixed(5)})` : ''}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Submit incident report"
          accessibilityState={{ busy: isSubmitting }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit to Network</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#FF4444', flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333', marginTop: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeBtn: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, width: '47%' },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sevBtn: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, width: '31%', alignItems: 'center' },
  selectedBtn: { backgroundColor: '#FF4444' },
  selectedText: { color: 'white', fontWeight: 'bold' },
  typeText: { fontSize: 14, color: '#444' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, marginBottom: 20 },
  textArea: { height: 80, textAlignVertical: 'top' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FF4444', borderRadius: 10, marginBottom: 30 },
  locationBtnText: { marginLeft: 10, color: '#FF4444', fontWeight: '600' },
  locationPreview: { marginTop: -20, marginBottom: 20, color: '#666', fontSize: 12, textAlign: 'center' },
  submitBtn: { backgroundColor: '#333', padding: 20, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});