import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import type { IncidentReport } from '../../types/incident';
import { formatTimestamp } from '../../utils/date';

export default function UserDashboard({ onPublicView, onReportPress }: { onPublicView: () => void, onReportPress: () => void }) {
    const router = useRouter();
    const [userName, setUserName] = useState<string>('Guest User');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [notifications, setNotifications] = useState<IncidentReport[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [unseenCount, setUnseenCount] = useState(0);
    const initializedRef = useRef(false);
    const seenIdsRef = useRef<Set<string>>(new Set());
    const unseenIdsRef = useRef<Set<string>>(new Set());

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

    useEffect(() => {
        const reportsQuery = query(
            collection(db, 'reports'),
            orderBy('created_at', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(
            reportsQuery,
            (snapshot) => {
                const data = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                })) as IncidentReport[];

                if (!initializedRef.current) {
                    data.forEach((incident) => seenIdsRef.current.add(incident.id));
                    setNotifications(data);
                    initializedRef.current = true;
                    return;
                }

                setNotifications(data);

                const newItems = data.filter(
                    (incident) =>
                        !seenIdsRef.current.has(incident.id) &&
                        !unseenIdsRef.current.has(incident.id)
                );

                if (newItems.length > 0) {
                    newItems.forEach((incident) => unseenIdsRef.current.add(incident.id));
                    setUnseenCount(unseenIdsRef.current.size);
                }
            },
            (error) => {
                console.error('Notification listener error:', error);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace('/login');
    };

    const handleOpenNotifications = () => {
        setIsNotiOpen(true);
        unseenIdsRef.current.forEach((id) => seenIdsRef.current.add(id));
        unseenIdsRef.current.clear();
        setUnseenCount(0);
    };

    const handleCloseNotifications = () => {
        setIsNotiOpen(false);
    };

    const handleClearNotifications = () => {
        setNotifications([]);
        seenIdsRef.current.clear();
        unseenIdsRef.current.clear();
        setUnseenCount(0);
    };

    const handleNotificationPress = (incident: IncidentReport) => {
        setIsNotiOpen(false);
        router.push(`/map?source=public&incidentId=${incident.id}`);
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
                        <TouchableOpacity onPress={handleOpenNotifications} style={styles.notiIconButton}>
                            <Ionicons name="notifications-outline" size={26} color="white" />
                            {unseenCount > 0 && (
                                <View style={styles.notiBadge}>
                                    <Text style={styles.notiBadgeText} numberOfLines={1}>
                                        {unseenCount > 99 ? '99+' : unseenCount}
                                    </Text>
                                </View>
                            )}
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

            <Modal
                visible={isNotiOpen}
                transparent
                animationType="fade"
                onRequestClose={handleCloseNotifications}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.notiOverlay}
                    onPress={handleCloseNotifications}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.notiPanel}>
                        <View style={styles.notiHeader}>
                            <Text style={styles.notiTitle}>Notifications</Text>
                            <View style={styles.notiHeaderActions}>
                                {notifications.length > 0 && (
                                    <TouchableOpacity onPress={handleClearNotifications} style={styles.clearButton}>
                                        <Ionicons name="trash-outline" size={18} color="#6B7280" />
                                        <Text style={styles.clearButtonText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={handleCloseNotifications}>
                                    <Ionicons name="close" size={22} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {notifications.length === 0 ? (
                            <View style={styles.notiEmptyState}>
                                <Ionicons name="notifications-off-outline" size={28} color="#9CA3AF" />
                                <Text style={styles.notiEmptyText}>No notifications yet</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.notiList}
                                contentContainerStyle={styles.notiListContent}
                                showsVerticalScrollIndicator={true}
                                bounces={true}
                            >
                                {notifications.map((incident) => (
                                    <TouchableOpacity
                                        key={incident.id}
                                        style={styles.notiItem}
                                        onPress={() => handleNotificationPress(incident)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.notiItemHeader}>
                                            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                                            <Text style={styles.notiItemTitle} numberOfLines={1}>
                                                {incident.text || 'Incident Report'}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                                        </View>
                                        <Text style={styles.notiItemMeta} numberOfLines={1}>
                                            {formatTimestamp(incident.created_at)}
                                            {incident.location_name ? ` • ${incident.location_name}` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    notiIconButton: { position: 'relative' },
    notiBadge: {
        position: 'absolute',
        right: -6,
        top: -6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.9)',
    },
    notiBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
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
    notiOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notiPanel: {
        width: '100%',
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.88)',
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        maxHeight: Dimensions.get('window').height * 0.65,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.95)',
    },
    notiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17,24,39,0.08)',
    },
    notiHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    clearButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    clearButtonText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    notiTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    notiEmptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
    notiEmptyText: { color: '#6B7280', fontSize: 14 },
    notiList: { flexGrow: 0, maxHeight: Dimensions.get('window').height * 0.45 },
    notiListContent: { paddingBottom: 10 },
    notiItem: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17,24,39,0.06)',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        marginBottom: 6,
    },
    notiItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    notiItemTitle: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
    notiItemMeta: { marginTop: 4, fontSize: 12, color: '#6B7280', marginLeft: 24 },
});