import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {db } from '../../firebase';
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reports"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(data);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 16.8409,
          longitude: 96.1735,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {reports.map((r) =>
          r.reporter_lat && r.reporter_lng ? (
            <Marker
              key={r.id}
              coordinate={{
                latitude: r.reporter_lat,
                longitude: r.reporter_lng,
              }}
              title="Incident Report"
              description={r.text || "Tap to view source"}
            />
          ) : null,
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
