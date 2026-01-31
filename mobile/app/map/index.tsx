import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, StatusBar } from "react-native";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IncidentMarker, IncidentDashboard } from "../../components/incident";
import { IncidentCallout } from "../../components/incident/IncidentCallout";
import type { IncidentReport } from "../../types/incident";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const DEFAULT_REGION = {
  latitude: 37.5665,
  longitude: 126.9780,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const router = useRouter();

  const { source, incidentId } = useLocalSearchParams();

  const isPublicView = source === 'public';
  const targetIncidentId = typeof incidentId === 'string' ? incidentId : undefined;

  const mapRef = useRef<MapView>(null);
  const hasHandledInitialIncident = useRef(false);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as IncidentReport[];
        setReports(data);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const validReports = useMemo(() => reports.filter(r => r.reporter_lat && r.reporter_lng), [reports]);

  const handleIncidentPress = useCallback((incident: IncidentReport) => {
    mapRef.current?.animateToRegion({
      latitude: incident.reporter_lat,
      longitude: incident.reporter_lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
    setSelectedIncident(incident);
  }, []);

  useEffect(() => {
    if (targetIncidentId && validReports.length > 0 && !hasHandledInitialIncident.current) {
      const incident = validReports.find(r => r.id === targetIncidentId);
      if (incident) {
        hasHandledInitialIncident.current = true;
        handleIncidentPress(incident);
      }
    }
  }, [targetIncidentId, validReports, handleIncidentPress]);



  if (isLoading) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        onPress={() => setSelectedIncident(null)}
      >
        {validReports.map((report) => (
          <IncidentMarker
            key={report.id}
            incident={report}
            onPress={() => handleIncidentPress(report)}
          />
        ))}
      </MapView>


      {isPublicView && (
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />

          </TouchableOpacity>
        </View>
      )}

      {selectedIncident ? (
        <IncidentCallout incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      ) : (
        <IncidentDashboard
          incidents={validReports}
          onIncidentPress={handleIncidentPress}
          isLoading={isLoading}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { position: "absolute", top: 50, left: 16, zIndex: 10 },
  backButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    padding: 10, borderRadius: 20, elevation: 5,
  },
  backButtonText: { marginLeft: 5, fontWeight: "bold" }
});