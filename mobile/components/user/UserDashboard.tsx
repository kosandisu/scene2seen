import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
//import { auth } from "../../firebase";

export default function UserDashboard({ onPublicView, onReportPress }: { onPublicView: () => void, onReportPress: () => void }) {
//const userName = auth.currentUser?.displayName || "User";
const userName = "Guest User";
const [currentSlide, setCurrentSlide] = useState(0);

const newsSlides = [
    "Emergency Alert: Heavy rainfall expected in Gyeonggi-do area.",
    "Shelter Update: Maetan-dong shelter is now open for residents.",
    "News: Rescue teams are currently active in the Suwon area.",
    "Safety Tip: Avoid low-lying areas during the storm."
];

return (
    <View style={styles.mainContainer}>
      {/* 1. Header with Red Background */}
    <View style={styles.header}>
        <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Scene2Seen</Text>
        <View style={styles.headerIcons}>
            <TouchableOpacity>
            <Ionicons name="notifications-outline" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
            <Ionicons name="log-out-outline" size={26} color="white" />
            </TouchableOpacity>
        </View>
        </View>
        <Text style={styles.welcomeText}>Welcome, {userName}</Text>
    </View>

    <ScrollView style={styles.content}>
        {/* 2. News Slide (2.5:1 Ratio) */}
        <View style={styles.newsSection}>
        <View style={styles.newsCard}>
            <Text style={styles.newsSlideText}>{newsSlides[currentSlide]}</Text>
            <View style={styles.pagination}>
            {newsSlides.map((_, i) => (
                <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
            ))}
            </View>
            <TouchableOpacity style={styles.slideLeft} onPress={() => setCurrentSlide(prev => (prev > 0 ? prev - 1 : 3))}>
            <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.slideRight} onPress={() => setCurrentSlide(prev => (prev < 3 ? prev + 1 : 0))}>
            <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
        </View>
        </View>

        {/* 3. Stacked Quick Action Buttons */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonStack}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF4444' }]} onPress={onReportPress}>
            <Ionicons name="alert-circle" size={30} color="white" />
            <Text style={styles.btnText}>REPORT INCIDENT</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#4285F4' }]} 
            onPress={onPublicView}
        >
            <Ionicons name="map" size={30} color="white" />
            <Text style={styles.btnText}>PUBLIC VIEW</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFBB33' }]}>
            <Ionicons name="call" size={30} color="white" />
            <Text style={styles.btnText}>EMERGENCY CONTACT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#00C851' }]}>
            <Ionicons name="business" size={30} color="white" />
            <Text style={styles.btnText}>NEARBY SHELTER</Text>
        </TouchableOpacity>
        </View>
    </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
mainContainer: { flex: 1, backgroundColor: '#F8F9FA' },
header: {
    backgroundColor: '#FF4444', // Red Theme
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
},
headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
headerIcons: { flexDirection: 'row', gap: 15 },
welcomeText: { color: 'white', opacity: 0.9, marginTop: 5, fontSize: 14 },
content: { padding: 20 },
newsSection: { marginBottom: 25 },
newsCard: { width: '100%', aspectRatio: 2.5 / 1.5, backgroundColor: '#333', borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 20 },
newsSlideText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
pagination: { position: 'absolute', bottom: 10, flexDirection: 'row', gap: 5 },
dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
activeDot: { backgroundColor: 'white' },
slideLeft: { position: 'absolute', left: 10, top: '45%' },
slideRight: { position: 'absolute', right: 10, top: '45%' },
sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
buttonStack: { gap: 12 },
actionBtn: { flexDirection: 'row', alignItems: 'center', height: 75, borderRadius: 15, paddingHorizontal: 25, elevation: 3 },
btnText: { color: 'white', fontSize: 17, fontWeight: 'bold', marginLeft: 20 },
});