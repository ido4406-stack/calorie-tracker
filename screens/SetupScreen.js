import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function calcCalories(gender, age, height, weight, goal) {
  // Mifflin-St Jeor
  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmr * 1.4; // פעילות בינונית
  if (goal === 'lose') return Math.round(tdee - 500);
  if (goal === 'gain') return Math.round(tdee + 400);
  return Math.round(tdee);
}

export default function SetupScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState(null);

  async function handleFinish() {
    if (!gender || !age || !height || !weight || !goal)
      return Alert.alert('שגיאה', 'נא למלא את כל הפרטים');

    const dailyGoal = calcCalories(gender, Number(age), Number(height), Number(weight), goal);
    const updatedUser = { ...user, gender, age: Number(age), height: Number(height), weight: Number(weight), goal, dailyGoal, isNew: false };

    const data = await AsyncStorage.getItem('users');
    const users = data ? JSON.parse(data) : {};
    users[user.username] = updatedUser;
    await AsyncStorage.setItem('users', JSON.stringify(users));
    onComplete(updatedUser);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>בוא נכיר אותך 👋</Text>
      <Text style={styles.subtitle}>כדי לחשב את הצריכה האידיאלית שלך</Text>

      <View style={styles.stepBar}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
        ))}
      </View>

      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.question}>מה המין שלך?</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.optionBtn, gender === 'male' && styles.optionActive]} onPress={() => setGender('male')}>
              <Text style={styles.optionIcon}>👨</Text>
              <Text style={[styles.optionText, gender === 'male' && styles.optionTextActive]}>גבר</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBtn, gender === 'female' && styles.optionActive]} onPress={() => setGender('female')}>
              <Text style={styles.optionIcon}>👩</Text>
              <Text style={[styles.optionText, gender === 'female' && styles.optionTextActive]}>אישה</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.question}>גיל</Text>
          <TextInput style={styles.input} placeholder="למשל: 25" keyboardType="numeric" value={age} onChangeText={setAge} textAlign="right" />

          <Text style={styles.question}>גובה (ס"מ)</Text>
          <TextInput style={styles.input} placeholder="למשל: 175" keyboardType="numeric" value={height} onChangeText={setHeight} textAlign="right" />

          <Text style={styles.question}>משקל (ק"ג)</Text>
          <TextInput style={styles.input} placeholder="למשל: 75" keyboardType="numeric" value={weight} onChangeText={setWeight} textAlign="right" />

          <TouchableOpacity style={styles.nextBtn} onPress={() => { if (!gender || !age || !height || !weight) return Alert.alert('שגיאה', 'נא למלא את כל הפרטים'); setStep(2); }}>
            <Text style={styles.nextBtnText}>הבא ←</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.question}>מה המטרה שלך?</Text>
          {[
            { key: 'lose', icon: '🔥', label: 'ירידה במשקל', desc: 'גירעון של 500 קל׳ ביום' },
            { key: 'maintain', icon: '⚖️', label: 'שמירה על משקל', desc: 'צריכה מאוזנת' },
            { key: 'gain', icon: '💪', label: 'עלייה במסה', desc: 'עודף של 400 קל׳ ביום' },
          ].map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.goalBtn, goal === opt.key && styles.goalBtnActive]} onPress={() => setGoal(opt.key)}>
              <Text style={styles.goalIcon}>{opt.icon}</Text>
              <View>
                <Text style={[styles.goalLabel, goal === opt.key && styles.goalLabelActive]}>{opt.label}</Text>
                <Text style={styles.goalDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.row}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← חזור</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => { if (!goal) return Alert.alert('שגיאה', 'נא לבחור מטרה'); setStep(3); }}>
              <Text style={styles.nextBtnText}>הבא ←</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.section}>
          {(() => {
            const cal = calcCalories(gender, Number(age), Number(height), Number(weight), goal);
            const goalLabels = { lose: 'ירידה במשקל', maintain: 'שמירה על משקל', gain: 'עלייה במסה' };
            return (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>היעד היומי שלך</Text>
                  <Text style={styles.resultCalories}>{cal}</Text>
                  <Text style={styles.resultUnit}>קלוריות ליום</Text>
                  <Text style={styles.resultGoal}>מטרה: {goalLabels[goal]}</Text>
                </View>
                <Text style={styles.resultExplain}>
                  החישוב מבוסס על BMR + רמת פעילות בינונית{'\n'}
                  {goal === 'lose' ? 'הפחתנו 500 קל׳ לירידה בריאה של ~0.5 ק"ג בשבוע' :
                   goal === 'gain' ? 'הוספנו 400 קל׳ לעלייה איכותית במסה' :
                   'זו הצריכה לשמירה על משקלך הנוכחי'}
                </Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                    <Text style={styles.backBtnText}>← חזור</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextBtn} onPress={handleFinish}>
                    <Text style={styles.nextBtnText}>התחל! 🚀</Text>
                  </TouchableOpacity>
                </View>
              </>
            );
          })()}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 24, paddingTop: 70 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  subtitle: { fontSize: 15, textAlign: 'center', color: '#888', marginBottom: 24 },
  stepBar: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: '#4CAF50' },
  section: { gap: 8 },
  question: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'right', marginTop: 12 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 8 },
  optionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#eee' },
  optionActive: { borderColor: '#4CAF50', backgroundColor: '#f0fdf4' },
  optionIcon: { fontSize: 32, marginBottom: 6 },
  optionText: { fontSize: 16, color: '#555' },
  optionTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  nextBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, alignItems: 'center' },
  backBtnText: { color: '#555', fontSize: 16 },
  goalBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#eee' },
  goalBtnActive: { borderColor: '#4CAF50', backgroundColor: '#f0fdf4' },
  goalIcon: { fontSize: 28 },
  goalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  goalLabelActive: { color: '#4CAF50' },
  goalDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  resultCard: { backgroundColor: '#4CAF50', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 16 },
  resultTitle: { color: '#fff', fontSize: 16, marginBottom: 8 },
  resultCalories: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  resultUnit: { color: '#c8e6c9', fontSize: 18 },
  resultGoal: { color: '#fff', marginTop: 8, fontSize: 14 },
  resultExplain: { backgroundColor: '#fff', borderRadius: 12, padding: 16, color: '#555', fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
