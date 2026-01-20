import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { collection, onSnapshot, FirestoreError } from "firebase/firestore";
import { db } from "../../firebase";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IncidentMarker, IncidentDashboard } from "../../components/incident";
import type { IncidentReport } from "../../types/incident";

// Default map region (Yangon, Myanmar)
const DEFAULT_REGION = {
  latitude: 16.8409,
  longitude: 96.1735,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function HomeScreen() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Subscribe to Firestore updates
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IncidentReport[];

        setReports(data);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Firestore subscription error:", err);
        setError("Unable to load incident reports. Please try again.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter valid reports with coordinates
  const validReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          typeof report.reporter_lat === "number" &&
          typeof report.reporter_lng === "number" &&
          !isNaN(report.reporter_lat) &&
          !isNaN(report.reporter_lng)
      ),
    [reports]
  );

  // Handle incident selection from dashboard
  const handleIncidentPress = useCallback((incident: IncidentReport) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: incident.reporter_lat,
          longitude: incident.reporter_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500 // Animation duration in ms
      );
    }
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer} accessibilityRole="progressbar">
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          accessibilityLabel="Loading incident reports"
        />
        <Text style={styles.loadingText}>Loading incidents...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View
        style={styles.centerContainer}
        accessibilityRole="alert"
        accessibilityLabel={error}
      >
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
        rotateEnabled
        accessibilityLabel="Map showing incident reports"
        accessibilityHint="Tap on markers to view incident details"
      >
        {validReports.map((report) => (
          <IncidentMarker key={report.id} incident={report} />
        ))}
      </MapView>

      {/* Report count badge */}
      {validReports.length > 0 && (
        <View
          style={styles.countBadge}
          accessibilityLabel={`${validReports.length} incident${validReports.length === 1 ? "" : "s"} on map`}
        >
          <Text style={styles.countText}>{validReports.length}</Text>
          <Text style={styles.countLabel}>
            {validReports.length === 1 ? "Incident" : "Incidents"}
          </Text>
        </View>
      )}

      {/* Bottom Sheet Dashboard */}
      <IncidentDashboard
        incidents={validReports}
        onIncidentPress={handleIncidentPress}
        isLoading={isLoading}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 24,
  },
  countBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  countText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  countLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
