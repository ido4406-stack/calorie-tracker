import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

async function callVisionAI(base64Image, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1024,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            {
              type: 'text',
              text: `זהה את כל המאכלים שאתה רואה בתמונה.
עבור כל מאכל ספק:
- שם בעברית
- משקל משוער בגרמים (לפי הגודל הנראה)
- קלוריות ל-100 גרם
- חלבון ל-100 גרם

השב רק ב-JSON תקין ללא שום טקסט נוסף:
[{"name": "שם", "grams": 150, "calories": 200, "protein": 10.0}]

אם אין מאכלים בתמונה השב: []`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `שגיאת שרת ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
  } finally {
    clearTimeout(timeout);
  }
}

export default function FoodScanModal({ visible, onClose, onAddFoods }) {
  const [step, setStep] = useState('idle');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [items, setItems] = useState([]);

  async function handleScan() {
    const apiKey = await AsyncStorage.getItem('groqApiKey');
    if (!apiKey) { setStep('apikey'); return; }

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('הרשאה נדרשת', 'נא לאשר גישה למצלמה בהגדרות');
      return;
    }

    const pic = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });
    if (pic.canceled || !pic.assets?.[0]?.base64) return;

    setStep('loading');
    try {
      const foods = await callVisionAI(pic.assets[0].base64, apiKey);
      if (!foods.length) {
        Alert.alert('לא זוהו מאכלים', 'נסה לצלם מקרוב יותר או בתאורה טובה יותר');
        setStep('idle');
        return;
      }
      setItems(foods.map(f => ({ ...f, selected: true, gramsStr: String(f.grams) })));
      setStep('results');
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'הבקשה לקחה יותר מדי זמן — בדוק חיבור אינטרנט' : e.message;
      Alert.alert('שגיאה', msg);
      setStep('idle');
    }
  }

  async function saveKey() {
    const key = apiKeyInput.trim();
    if (key.length < 10) {
      Alert.alert('מפתח לא תקין', 'המפתח קצר מדי — בדוק שהעתקת נכון');
      return;
    }
    await AsyncStorage.setItem('groqApiKey', key);
    setApiKeyInput('');
    setStep('idle');
    handleScan();
  }

  function updateGrams(i, v) {
    setItems(prev => prev.map((f, idx) => idx === i ? { ...f, gramsStr: v, grams: Number(v) || f.grams } : f));
  }

  function toggleItem(i) {
    setItems(prev => prev.map((f, idx) => idx === i ? { ...f, selected: !f.selected } : f));
  }

  function confirmAdd() {
    const chosen = items.filter(f => f.selected && f.grams > 0);
    if (!chosen.length) { Alert.alert('', 'לא נבחרו מאכלים'); return; }
    onAddFoods(chosen.map(f => ({
      name: f.name,
      calories: Math.round((f.calories / 100) * f.grams),
      protein: Math.round((f.protein / 100) * f.grams * 10) / 10,
      grams: f.grams,
    })));
    reset();
  }

  function reset() { setStep('idle'); setItems([]); onClose(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.overlay}>

          {step === 'idle' && (
            <View style={s.card}>
              <Text style={s.title}>📷 סריקת אוכל</Text>
              <Text style={s.sub}>צלם את הצלחת שלך{'\n'}ה-AI יזהה את המאכלים ויעריך קלוריות</Text>
              <TouchableOpacity style={s.mainBtn} onPress={handleScan}>
                <Text style={s.mainBtnTxt}>📷  צלם עכשיו</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtn} onPress={reset}>
                <Text style={s.closeTxt}>סגור</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'apikey' && (
            <View style={s.card}>
              <Text style={s.title}>🔑 הגדרת AI (חינם)</Text>
              <Text style={s.sub}>
                משתמשים ב-Groq — חינם לגמרי, ללא כרטיס אשראי{'\n\n'}
                {'איך מקבלים מפתח (דקה אחת):\n'}
                {'1. כנס ל: console.groq.com\n'}
                {'2. לחץ "Sign up" → הירשם עם Google\n'}
                {'3. לחץ "API Keys" → "Create API Key"\n'}
                {'4. העתק והדבק כאן\n\n'}
                המפתח נראה כך: gsk_...
              </Text>
              <TextInput
                style={s.apiInput}
                placeholder="gsk_..."
                placeholderTextColor={colors.subtext}
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity style={s.mainBtn} onPress={saveKey}>
                <Text style={s.mainBtnTxt}>שמור והמשך →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtn} onPress={reset}>
                <Text style={s.closeTxt}>ביטול</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'loading' && (
            <View style={s.card}>
              <ActivityIndicator size="large" color={colors.teal} style={{ marginBottom: 20 }} />
              <Text style={s.sub}>Groq AI מנתח את התמונה...</Text>
              <Text style={[s.sub, { fontSize: 12, marginTop: 6 }]}>לוקח כ-3–5 שניות</Text>
            </View>
          )}

          {step === 'results' && (
            <View style={[s.card, { maxHeight: '80%' }]}>
              <Text style={s.title}>✅ זוהו מאכלים</Text>
              <Text style={s.sub}>לחץ על מאכל להסרה · ערוך גרמים לפי הצורך</Text>
              <ScrollView style={{ marginVertical: 12 }} keyboardShouldPersistTaps="handled">
                {items.map((f, i) => (
                  <TouchableOpacity key={i} style={[s.foodRow, !f.selected && s.foodRowOff]} onPress={() => toggleItem(i)}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.foodName, !f.selected && s.strikethrough]}>{f.name}</Text>
                      <Text style={s.foodMacros}>
                        ~{Math.round((f.calories / 100) * (Number(f.gramsStr) || f.grams))} קל'  ·  {Math.round((f.protein / 100) * (Number(f.gramsStr) || f.grams) * 10) / 10}g חלבון
                      </Text>
                    </View>
                    <View style={s.gramsBox}>
                      <TextInput
                        style={s.gramsInput}
                        value={f.gramsStr}
                        onChangeText={v => updateGrams(i, v)}
                        keyboardType="numeric"
                        textAlign="center"
                      />
                      <Text style={s.gramsLabel}>g</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.closeBtn, s.flex1]} onPress={() => setStep('idle')}>
                  <Text style={s.closeTxt}>חזור</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.mainBtn, s.flex1, { marginBottom: 0, marginTop: 0 }]} onPress={confirmAdd}>
                  <Text style={s.mainBtnTxt}>הוסף ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  card: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44, borderTopWidth: 1, borderColor: colors.cardBorder },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 14, color: colors.subtext, textAlign: 'center', lineHeight: 22 },
  mainBtn: { backgroundColor: colors.teal, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  mainBtnTxt: { color: colors.bg, fontWeight: 'bold', fontSize: 16 },
  closeBtn: { padding: 14, alignItems: 'center' },
  closeTxt: { color: colors.subtext, fontSize: 15 },
  apiInput: { backgroundColor: colors.input, borderRadius: 12, padding: 14, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder, marginTop: 16 },
  foodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder },
  foodRowOff: { opacity: 0.35 },
  foodName: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'right' },
  foodMacros: { color: colors.subtext, fontSize: 12, marginTop: 3, textAlign: 'right' },
  strikethrough: { textDecorationLine: 'line-through' },
  gramsBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 10 },
  gramsInput: { backgroundColor: colors.card, borderRadius: 8, padding: 8, width: 56, fontSize: 16, color: colors.teal, fontWeight: 'bold', borderWidth: 1, borderColor: colors.teal },
  gramsLabel: { color: colors.subtext, fontSize: 12 },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flex1: { flex: 1 },
});
