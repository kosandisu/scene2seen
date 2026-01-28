import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import UserDashboard from "../../components/user/UserDashboard"; // 👈 Check path
import IncidentForm from "../../components/user/IncidentForm";

export default function UserHomeScreen() {
  const router = useRouter();
  const [showReportForm, setShowReportForm] = useState(false);

  // 1. If "Report" is clicked, show the form
  if (showReportForm) {
    return <IncidentForm onClose={() => setShowReportForm(false)} />;
  }

  // 2. Default View: The User Dashboard
  return (
    <View style={{ flex: 1 }}>
      <UserDashboard
        onPublicView={() => router.push('/map?source=public')}
        onReportPress={() => setShowReportForm(true)}
      />
    </View>
  );
}