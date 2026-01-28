import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function UserDashboard({ onPublicView, onReportPress }: { onPublicView: () => void, onReportPress: () => void }) {
    const router = useRouter();
    const [userName, setUserName] = useState<string>('Guest User');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                // Try to get name from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().name) {
                    setUserName(userDoc.data().name);
                } else if (user.displayName) {
                    setUserName(user.displayName);
                } else if (user.email) {
                    setUserName(user.email.split('@')[0]);
                }
            }
        };
        fetchUserName();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace('/login');
    };

    const newsSlides = [
        "Emergency Alert: Heavy rainfall expected in Gyeonggi-do area.",
        "Shelter Update: Maetan-dong shelter is now open for residents.",
        "News: Rescue teams are currently active in the Suwon area.",
        "Safety Tip: Avoid low-lying areas during the storm."
    ];

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={['#ff2d22ff', '#e4831cff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Scene2Seen</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            <Ionicons name="notifications-outline" size={26} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={26} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.welcomeText}>Welcome, {userName}</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
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
        paddingTop: 64,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTop: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    headerIcons: { position: 'absolute', right: 8, top: 12, flexDirection: 'row', gap: 15 },
    welcomeText: { color: 'white', opacity: 0.95, marginTop: 8, fontSize: 14, textAlign: 'center' },
    content: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 50, flexGrow: 1 },
    newsSection: { marginBottom: 20 },
    newsCard: { width: '100%', aspectRatio: 2.5 / 1.5, backgroundColor: '#333', borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 20 },
    newsSlideText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
    pagination: { position: 'absolute', bottom: 10, flexDirection: 'row', gap: 5 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
    activeDot: { backgroundColor: 'white' },
    slideLeft: { position: 'absolute', left: 10, top: '45%' },
    slideRight: { position: 'absolute', right: 10, top: '45%' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    buttonStack: { gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', height: 80, borderRadius: 15, paddingHorizontal: 25, elevation: 3 },
    btnText: { color: 'white', fontSize: 17, fontWeight: 'bold', marginLeft: 20 },
});