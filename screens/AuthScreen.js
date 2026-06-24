import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!username || !password) return Alert.alert('שגיאה', 'נא למלא שם משתמש וסיסמה');
    const data = await AsyncStorage.getItem('users');
    const users = data ? JSON.parse(data) : {};
    const user = users[username];
    if (!user) return Alert.alert('שגיאה', 'שם משתמש לא קיים');
    if (user.password !== password) return Alert.alert('שגיאה', 'סיסמה שגויה');
    onLogin(user);
  }

  async function handleRegister() {
    if (!username || !password) return Alert.alert('שגיאה', 'נא למלא שם משתמש וסיסמה');
    if (password.length < 4) return Alert.alert('שגיאה', 'הסיסמה חייבת להיות לפחות 4 תווים');
    const data = await AsyncStorage.getItem('users');
    const users = data ? JSON.parse(data) : {};
    if (users[username]) return Alert.alert('שגיאה', 'שם המשתמש כבר קיים');
    const newUser = { username, password, isNew: true };
    users[username] = newUser;
    await AsyncStorage.setItem('users', JSON.stringify(users));
    onLogin(newUser);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glow} />
      <View style={styles.card}>
        <Text style={styles.logo}>⚡</Text>
        <Text style={styles.title}>CalTrack</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'התחברות' : 'הרשמה'}</Text>

        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor={colors.subtext}
          value={username}
          onChangeText={setUsername}
          textAlign="right"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor={colors.subtext}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />

        <TouchableOpacity style={styles.button} onPress={mode === 'login' ? handleLogin : handleRegister}>
          <Text style={styles.buttonText}>{mode === 'login' ? 'התחבר' : 'הירשם'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  glow: {
    position: 'absolute', top: -100, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: colors.tealGlow,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logo: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: colors.teal, letterSpacing: 2 },
  subtitle: { fontSize: 15, textAlign: 'center', color: colors.subtext, marginBottom: 28, marginTop: 4 },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  button: {
    backgroundColor: colors.teal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.teal,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: { color: colors.bg, fontSize: 17, fontWeight: 'bold' },
  switchText: { textAlign: 'center', color: colors.tealDim, marginTop: 18, fontSize: 14 },
});
