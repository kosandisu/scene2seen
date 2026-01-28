//user in app report form 
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function IncidentForm({ onClose }: { onClose: () => void }) {
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [snsLink, setSnsLink] = useState('');
  const [description, setDescription] = useState('');

  //use the incident report types from telegram. 
  const types = ['🔥 Fire', '🚗 Accident', '🌊 Flood', '🏗️ Collapse', '❓ Other'];
  const severities = [
    { label: '🔴 High', value: 'high' },
    { label: '🟠 Medium', value: 'medium' },
    { label: '🟢 Low', value: 'low' }
  ];

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
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="location" size={24} color="#FF4444" />
          <Text style={styles.locationBtnText}>Tap to share current location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit to Network</Text>
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
  submitBtn: { backgroundColor: '#333', padding: 20, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});