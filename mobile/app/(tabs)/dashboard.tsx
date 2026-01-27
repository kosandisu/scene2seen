import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, Responder</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.newsCarousel}>
        <Text style={styles.newsTitle}>Latest Incident Updates</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsText}>Flood Warning: Maetan-dong area. Stay alert.</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#FF4444' }]}>
          <Ionicons name="alert-circle" size={32} color="white" />
          <Text style={styles.cardText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { backgroundColor: '#4285F4' }]}>
          <Ionicons name="map" size={32} color="white" />
          <Text style={styles.cardText}>Public View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { backgroundColor: '#FFBB33' }]}>
          <Ionicons name="call" size={32} color="white" />
          <Text style={styles.cardText}>Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { backgroundColor: '#00C851' }]}>
          <Ionicons name="business" size={32} color="white" />
          <Text style={styles.cardText}>Shelters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#fff', padding: 20 },
header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
welcomeText: { fontSize: 22, fontWeight: 'bold' },
newsCarousel: { marginBottom: 30 },
newsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
newsCard: { height: 150, backgroundColor: '#f0f0f0', borderRadius: 15, justifyContent: 'center', padding: 20 },
newsText: { fontSize: 16, color: '#333' },
grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
card: { width: '48%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
cardText: { color: 'white', fontWeight: 'bold', marginTop: 10, fontSize: 16 }
});