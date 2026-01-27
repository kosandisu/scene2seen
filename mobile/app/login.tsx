import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    router.replace('/(tabs)'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.logoPlaceholder} />
        <Text style={styles.title}>Scene2Seen</Text>
        <Text style={styles.subtitle}>Disaster Response Network</Text>
      </View>

      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          By signing in, you agree to help our community.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-around',
  },
  headerArea: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#FF4444',
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
    fontSize: 12,
  },
});