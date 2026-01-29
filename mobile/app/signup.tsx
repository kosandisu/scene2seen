//create user, user signup form
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, StatusBar, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password || !name) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
                role: 'user',
                approved: true,
                createdAt: new Date().toISOString(),
            });

            //sign up -> user -> user interface
            Alert.alert("Welcome!", "Your account has been created.", [
                { text: "OK", onPress: () => router.replace('/(tabs)') }
            ]);

        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#ff2d22ff', '#e4831cff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center' }}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Create Account</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Full Name"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#de190eff" />
                        ) : (
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.footerText}>
                        Already have an account? <Text style={styles.linkText}>Log In</Text>
                    </Text>
                </TouchableOpacity>

            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    headerContainer: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
    formContainer: { width: '100%' },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 14,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#de190eff', fontSize: 16, height: '100%' },
    signupButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    signupButtonText: { color: '#de190eff', fontSize: 18, fontWeight: 'bold' },
    footerText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
    linkText: { fontWeight: 'bold', textDecorationLine: 'underline', color: '#FFF' },
});