import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
      <View style={styles.card}>
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.title}>מעקב קלוריות</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'התחברות' : 'הרשמה'}</Text>

        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          value={username}
          onChangeText={setUsername}
          textAlign="right"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
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
  container: { flex: 1, backgroundColor: '#f0fdf4', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  logo: { fontSize: 50, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#888', marginBottom: 24 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  switchText: { textAlign: 'center', color: '#4CAF50', marginTop: 16, fontSize: 14 },
});
