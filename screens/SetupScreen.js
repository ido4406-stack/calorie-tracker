import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const ACTIVITY_LEVELS = [
  { key: 'sedentary',  label: 'יושבני',         desc: 'עבודת משרד, כמעט אין פעילות',     factor: 1.2 },
  { key: 'light',      label: 'קל',              desc: '1–2 אימונים בשבוע',               factor: 1.375 },
  { key: 'moderate',   label: 'בינוני',          desc: '3–4 אימונים בשבוע',               factor: 1.55 },
  { key: 'active',     label: 'פעיל',            desc: '5–6 אימונים בשבוע',               factor: 1.725 },
  { key: 'very_active',label: 'אתלט',            desc: 'אימון כפול / עבודה פיזית כבדה',   factor: 1.9 },
];

const LOSE_RATES = [
  { key: '0.25', label: '0.25 ק"ג / שבוע', deficit: 275,  desc: 'קל מאוד, מתאים לדיאטה עדינה' },
  { key: '0.5',  label: '0.5 ק"ג / שבוע',  deficit: 550,  desc: 'קצב מומלץ ובריא' },
  { key: '0.75', label: '0.75 ק"ג / שבוע', deficit: 825,  desc: 'מהיר, דורש עקביות' },
  { key: '1',    label: '1 ק"ג / שבוע',    deficit: 1100, desc: 'מקסימום מומלץ, דורש הקפדה' },
];

const GAIN_RATES = [
  { key: '0.25', label: '0.25 ק"ג / שבוע', surplus: 275, desc: 'עלייה עדינה, שומר ועוד' },
  { key: '0.5',  label: '0.5 ק"ג / שבוע',  surplus: 550, desc: 'קצב מומלץ לבניית שריר' },
];

export function calcCalories({ gender, age, height, weight, activityKey, goal, rate }) {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const activityFactor = ACTIVITY_LEVELS.find(a => a.key === activityKey)?.factor || 1.4;
  const tdee = bmr * activityFactor;

  if (goal === 'lose') {
    const deficit = LOSE_RATES.find(r => r.key === rate)?.deficit || 550;
    return Math.max(Math.round(tdee - deficit), 1200);
  }
  if (goal === 'gain') {
    const surplus = GAIN_RATES.find(r => r.key === rate)?.surplus || 275;
    return Math.round(tdee + surplus);
  }
  return Math.round(tdee);
}

export default function SetupScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState(user.gender || null);
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [height, setHeight] = useState(user.height ? String(user.height) : '');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '');
  const [activityKey, setActivityKey] = useState(user.activityKey || null);
  const [goal, setGoal] = useState(user.goal || null);
  const [rate, setRate] = useState(user.rate || '0.5');

  async function handleFinish() {
    const dailyGoal = calcCalories({ gender, age: Number(age), height: Number(height), weight: Number(weight), activityKey, goal, rate });
    const updatedUser = { ...user, gender, age: Number(age), height: Number(height), weight: Number(weight), activityKey, goal, rate, dailyGoal, isNew: false };
    const data = await AsyncStorage.getItem('users');
    const users = data ? JSON.parse(data) : {};
    users[user.username] = updatedUser;
    await AsyncStorage.setItem('users', JSON.stringify(users));
    onComplete(updatedUser);
  }

  const TOTAL_STEPS = 4;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.glow} />
      <Text style={styles.title}>{user.isNew ? 'בוא נכיר אותך' : 'עדכון פרופיל'}</Text>
      <Text style={styles.subtitle}>שלב {step} מתוך {TOTAL_STEPS}</Text>

      <View style={styles.stepBar}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View key={i} style={[styles.stepDot, step > i && styles.stepDotActive]} />
        ))}
      </View>

      {/* שלב 1 — פרטים אישיים */}
      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>מין</Text>
          <View style={styles.row}>
            {[['male','👨','גבר'],['female','👩','אישה']].map(([val,icon,label]) => (
              <TouchableOpacity key={val} style={[styles.optionBtn, gender === val && styles.optionActive]} onPress={() => setGender(val)}>
                <Text style={styles.optionIcon}>{icon}</Text>
                <Text style={[styles.optionText, gender === val && styles.optionTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {[['גיל', age, setAge],['גובה (ס"מ)', height, setHeight],['משקל (ק"ג)', weight, setWeight]].map(([label, val, setter]) => (
            <View key={label}>
              <Text style={styles.sectionLabel}>{label}</Text>
              <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.subtext} keyboardType="numeric" value={val} onChangeText={setter} textAlign="right" />
            </View>
          ))}
          <TouchableOpacity style={styles.nextBtn} onPress={() => {
            if (!gender || !age || !height || !weight) return Alert.alert('שגיאה', 'נא למלא את כל הפרטים');
            setStep(2);
          }}>
            <Text style={styles.nextBtnText}>הבא ←</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* שלב 2 — רמת פעילות */}
      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>מה רמת הפעילות השבועית שלך?</Text>
          {ACTIVITY_LEVELS.map(a => (
            <TouchableOpacity key={a.key} style={[styles.listBtn, activityKey === a.key && styles.listBtnActive]} onPress={() => setActivityKey(a.key)}>
              <Text style={[styles.listBtnLabel, activityKey === a.key && styles.listBtnLabelActive]}>{a.label}</Text>
              <Text style={styles.listBtnDesc}>{a.desc}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.row}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}><Text style={styles.backBtnText}>← חזור</Text></TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              if (!activityKey) return Alert.alert('שגיאה', 'נא לבחור רמת פעילות');
              setStep(3);
            }}><Text style={styles.nextBtnText}>הבא ←</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* שלב 3 — מטרה וקצב */}
      {step === 3 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>מה המטרה שלך?</Text>
          {[
            { key: 'lose',     icon: '🔥', label: 'ירידה במשקל' },
            { key: 'maintain', icon: '⚖️', label: 'שמירה על משקל' },
            { key: 'gain',     icon: '💪', label: 'עלייה במסה' },
          ].map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.listBtn, goal === opt.key && styles.listBtnActive]} onPress={() => setGoal(opt.key)}>
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <Text style={[styles.listBtnLabel, goal === opt.key && styles.listBtnLabelActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}

          {goal === 'lose' && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>כמה לרדת בשבוע?</Text>
              {LOSE_RATES.map(r => (
                <TouchableOpacity key={r.key} style={[styles.listBtn, rate === r.key && styles.listBtnActive]} onPress={() => setRate(r.key)}>
                  <Text style={[styles.listBtnLabel, rate === r.key && styles.listBtnLabelActive]}>{r.label}</Text>
                  <Text style={styles.listBtnDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {goal === 'gain' && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>כמה לעלות בשבוע?</Text>
              {GAIN_RATES.map(r => (
                <TouchableOpacity key={r.key} style={[styles.listBtn, rate === r.key && styles.listBtnActive]} onPress={() => setRate(r.key)}>
                  <Text style={[styles.listBtnLabel, rate === r.key && styles.listBtnLabelActive]}>{r.label}</Text>
                  <Text style={styles.listBtnDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.row}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}><Text style={styles.backBtnText}>← חזור</Text></TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              if (!goal) return Alert.alert('שגיאה', 'נא לבחור מטרה');
              setStep(4);
            }}><Text style={styles.nextBtnText}>הבא ←</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* שלב 4 — תוצאה */}
      {step === 4 && (() => {
        const cal = calcCalories({ gender, age: Number(age), height: Number(height), weight: Number(weight), activityKey, goal, rate });
        const activity = ACTIVITY_LEVELS.find(a => a.key === activityKey);
        const goalLabels = { lose: 'ירידה במשקל', maintain: 'שמירה על משקל', gain: 'עלייה במסה' };
        const rateLabel = goal === 'lose' ? LOSE_RATES.find(r => r.key === rate)?.label : goal === 'gain' ? GAIN_RATES.find(r => r.key === rate)?.label : null;
        return (
          <View style={styles.section}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>היעד היומי שלך</Text>
              <Text style={styles.resultCalories}>{cal}</Text>
              <Text style={styles.resultUnit}>קלוריות ליום</Text>
            </View>
            <View style={styles.summaryCard}>
              {[
                ['🎯 מטרה', goalLabels[goal]],
                rateLabel ? ['📉 קצב', rateLabel] : null,
                ['🏃 פעילות', activity?.label],
                ['⚖️ משקל', `${weight} ק"ג`],
              ].filter(Boolean).map(([k, v]) => (
                <View key={k} style={styles.summaryRow}>
                  <Text style={styles.summaryVal}>{v}</Text>
                  <Text style={styles.summaryKey}>{k}</Text>
                </View>
              ))}
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}><Text style={styles.backBtnText}>← חזור</Text></TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={handleFinish}><Text style={styles.nextBtnText}>{user.isNew ? 'התחל! 🚀' : 'שמור ✓'}</Text></TouchableOpacity>
            </View>
          </View>
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  glow: { position: 'absolute', top: 0, alignSelf: 'center', width: 300, height: 200, borderRadius: 150, backgroundColor: colors.tealGlow },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.subtext, marginBottom: 20, marginTop: 4 },
  stepBar: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cardBorder },
  stepDotActive: { backgroundColor: colors.teal },
  section: { gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.subtext, textAlign: 'right', marginTop: 6 },
  row: { flexDirection: 'row', gap: 12 },
  optionBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: colors.cardBorder },
  optionActive: { borderColor: colors.teal, backgroundColor: colors.tealGlow },
  optionIcon: { fontSize: 30, marginBottom: 6 },
  optionText: { fontSize: 15, color: colors.subtext },
  optionTextActive: { color: colors.teal, fontWeight: 'bold' },
  input: { backgroundColor: colors.input, borderRadius: 12, padding: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder },
  listBtn: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: colors.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 12 },
  listBtnActive: { borderColor: colors.teal, backgroundColor: colors.tealGlow },
  listBtnLabel: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'right' },
  listBtnLabelActive: { color: colors.teal },
  listBtnDesc: { fontSize: 12, color: colors.subtext, textAlign: 'right', flex: 2 },
  nextBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: colors.teal, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextBtnText: { color: colors.bg, fontSize: 16, fontWeight: 'bold' },
  backBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  backBtnText: { color: colors.subtext, fontSize: 16 },
  resultCard: { backgroundColor: colors.card, borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: colors.teal, shadowColor: colors.teal, shadowOpacity: 0.2, shadowRadius: 16 },
  resultTitle: { color: colors.subtext, fontSize: 14, marginBottom: 6 },
  resultCalories: { color: colors.teal, fontSize: 70, fontWeight: 'bold' },
  resultUnit: { color: colors.subtext, fontSize: 15 },
  summaryCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKey: { color: colors.subtext, fontSize: 14 },
  summaryVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
