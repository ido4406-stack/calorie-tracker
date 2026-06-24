import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './screens/AuthScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import { colors } from './theme';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('currentUser').then(data => {
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  async function handleLogin(u) {
    await AsyncStorage.setItem('currentUser', JSON.stringify(u));
    setUser(u);
  }

  async function handleSetupComplete(u) {
    await AsyncStorage.setItem('currentUser', JSON.stringify(u));
    setUser(u);
    setEditingProfile(false);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
    setEditingProfile(false);
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  if (user.isNew || editingProfile) return <SetupScreen user={user} onComplete={handleSetupComplete} />;
  return <HomeScreen user={user} onLogout={handleLogout} onEditProfile={() => setEditingProfile(true)} />;
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
});
