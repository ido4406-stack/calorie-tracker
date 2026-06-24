import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { getMealsByDay, saveMealsByDay } from '../data/storage';
import { FOOD_DB, CATEGORIES } from '../data/foods';

const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function toDateKey(d) { return d.toISOString().split('T')[0]; }

export default function HomeScreen({ user, onLogout }) {
  const today = new Date();
  const [mealsByDay, setMealsByDay] = useState({});
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tab, setTab] = useState('today');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gramModal, setGramModal] = useState(null);
  const [grams, setGrams] = useState('100');
  const [manualModal, setManualModal] = useState(false);
  const [manualMode, setManualMode] = useState('per100'); // 'per100' | 'fixed'
  const [manualName, setManualName] = useState('');
  const [manualCalPer100, setManualCalPer100] = useState('');
  const [manualProteinPer100, setManualProteinPer100] = useState('');
  const [manualGrams, setManualGrams] = useState('100');
  const [manualFixedCal, setManualFixedCal] = useState('');
  const [manualFixedProtein, setManualFixedProtein] = useState('');

  const dailyGoal = user.dailyGoal || 2000;
  const proteinGoal = Math.round((dailyGoal * 0.3) / 4); // 30% מהקלוריות מחלבון

  useEffect(() => {
    getMealsByDay().then(setMealsByDay);
  }, []);

  async function updateMeals(updated) {
    setMealsByDay(updated);
    await saveMealsByDay(updated);
  }

  function addMealEntry(entry) {
    const updated = { ...mealsByDay, [selectedDate]: [...(mealsByDay[selectedDate] || []), { ...entry, id: Date.now() }] };
    updateMeals(updated);
  }

  function removeMeal(id) {
    const updated = { ...mealsByDay, [selectedDate]: (mealsByDay[selectedDate] || []).filter(m => m.id !== id) };
    updateMeals(updated);
  }

  function confirmGrams() {
    if (!grams || isNaN(grams) || Number(grams) <= 0) return Alert.alert('שגיאה', 'נא להכניס כמות תקינה');
    const g = Number(grams);
    addMealEntry({
      name: gramModal.name,
      calories: Math.round((gramModal.calories / 100) * g),
      protein: Math.round((gramModal.protein / 100) * g * 10) / 10,
      grams: g,
    });
    setGramModal(null);
  }

  function addManual() {
    if (!manualName) return Alert.alert('שגיאה', 'נא להכניס שם');
    if (manualMode === 'per100') {
      if (!manualCalPer100 || isNaN(manualCalPer100)) return Alert.alert('שגיאה', 'נא להכניס קלוריות');
      const g = Number(manualGrams) || 100;
      addMealEntry({
        name: manualName,
        calories: Math.round((Number(manualCalPer100) / 100) * g),
        protein: manualProteinPer100 ? Math.round((Number(manualProteinPer100) / 100) * g * 10) / 10 : 0,
        grams: g,
      });
    } else {
      if (!manualFixedCal || isNaN(manualFixedCal)) return Alert.alert('שגיאה', 'נא להכניס קלוריות');
      addMealEntry({
        name: manualName,
        calories: Number(manualFixedCal),
        protein: Number(manualFixedProtein) || 0,
        grams: null,
      });
    }
    setManualModal(false);
    setManualName(''); setManualCalPer100(''); setManualProteinPer100('');
    setManualGrams('100'); setManualFixedCal(''); setManualFixedProtein('');
  }

  const selectedMeals = mealsByDay[selectedDate] || [];
  const totalCalories = selectedMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = selectedMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const remaining = dailyGoal - totalCalories;
  const progress = Math.min(totalCalories / dailyGoal, 1);
  const proteinProgress = Math.min(totalProtein / proteinGoal, 1);

  const filteredFoods = FOOD_DB.filter(f =>
    f.name.includes(search) && (!selectedCategory || f.category === selectedCategory)
  );

  function getDayColor(dateKey) {
    const meals = mealsByDay[dateKey];
    if (!meals || meals.length === 0) return null;
    const cal = meals.reduce((s, m) => s + m.calories, 0);
    if (cal > dailyGoal) return '#e53935';
    if (cal >= dailyGoal * 0.8) return '#4CAF50';
    return '#FFA726';
  }

  function buildCalendarDays() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }

  function getWeekData() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = toDateKey(d);
      const cal = (mealsByDay[key] || []).reduce((s, m) => s + m.calories, 0);
      return { key, label: DAYS_HE[d.getDay()], cal };
    });
  }

  const weekData = getWeekData();
  const maxCal = Math.max(...weekData.map(d => d.cal), dailyGoal);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>יציאה</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>שלום, {user.username} 👋</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {[['today','יומי'],['week','שבועי'],['calendar','לוח שנה']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'today' && (
        <ScrollView>
          <View style={styles.summaryCard}>
            <Text style={styles.dateText}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <View style={styles.calorieRow}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieNum}>{totalCalories}</Text>
                <Text style={styles.calorieLabel}>נאכל</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieNum}>{dailyGoal}</Text>
                <Text style={styles.calorieLabel}>יעד</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={[styles.calorieNum, remaining < 0 && styles.red]}>{Math.abs(remaining)}</Text>
                <Text style={styles.calorieLabel}>{remaining >= 0 ? 'נותר' : 'חריגה'}</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }, progress >= 1 && styles.progressOver]} />
            </View>
            <View style={styles.proteinRow}>
              <Text style={styles.proteinLabel}>חלבון: {Math.round(totalProtein)}g / {proteinGoal}g</Text>
              <View style={styles.proteinBar}>
                <View style={[styles.proteinFill, { width: `${proteinProgress * 100}%` }]} />
              </View>
            </View>
          </View>

          {selectedMeals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>ארוחות היום</Text>
              {selectedMeals.map(m => (
                <TouchableOpacity key={m.id} style={styles.mealRow} onPress={() => removeMeal(m.id)}>
                  <Text style={styles.removeHint}>✕</Text>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{m.name}{m.grams ? ` (${m.grams}g)` : ''}</Text>
                    <Text style={styles.mealMacros}>{m.calories} קל'  •  חלבון: {m.protein || 0}g</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.addRow}>
            <Text style={styles.sectionTitle}>הוסף מאכל</Text>
            <TouchableOpacity style={styles.manualBtn} onPress={() => setManualModal(true)}>
              <Text style={styles.manualBtnText}>+ ידני</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.searchInput} placeholder="חפש מאכל..." value={search} onChangeText={setSearch} textAlign="right" />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {[null, ...CATEGORIES].map(cat => (
              <TouchableOpacity key={cat || 'all'} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat || 'הכל'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.foodList}>
            {filteredFoods.map(food => (
              <TouchableOpacity key={food.name} style={styles.foodRow} onPress={() => { setGramModal(food); setGrams('100'); }}>
                <View style={styles.foodMacros}>
                  <Text style={styles.foodCal}>{food.calories} קל'</Text>
                  <Text style={styles.foodProtein}>חלבון {food.protein}g</Text>
                </View>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodPer}>לכל 100g</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {tab === 'week' && (
        <ScrollView contentContainerStyle={styles.weekContainer}>
          <Text style={styles.weekTitle}>7 הימים האחרונים</Text>
          <View style={styles.chart}>
            {weekData.map(d => (
              <View key={d.key} style={styles.barWrapper}>
                <Text style={styles.barCalText}>{d.cal > 0 ? d.cal : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar,
                    { height: `${(d.cal / maxCal) * 100}%` },
                    d.cal > dailyGoal ? styles.barOver : d.cal > 0 ? styles.barOk : styles.barEmpty
                  ]} />
                </View>
                <Text style={[styles.barLabel, d.key === toDateKey(today) && styles.barLabelToday]}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.weekLegend}>
            <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} /><Text style={styles.legendText}>בתוך היעד</Text></View>
            <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: '#e53935' }]} /><Text style={styles.legendText}>מעל היעד</Text></View>
          </View>
          <View style={styles.weekStats}>
            {weekData.map(d => (
              <TouchableOpacity key={d.key} style={styles.weekDayRow} onPress={() => { setSelectedDate(d.key); setTab('today'); }}>
                <Text style={[styles.weekDayCal, d.cal > dailyGoal && styles.red]}>{d.cal} קל'</Text>
                <Text style={styles.weekDayLabel}>{new Date(d.key + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'numeric' })}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {tab === 'calendar' && (
        <ScrollView>
          <View style={styles.calendarCard}>
            <View style={styles.calNav}>
              <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{MONTHS_HE[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</Text>
              <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dayHeaders}>
              {DAYS_HE.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
            </View>
            <View style={styles.calGrid}>
              {buildCalendarDays().map((day, i) => {
                if (!day) return <View key={`e${i}`} style={styles.calCell} />;
                const dateKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const color = getDayColor(dateKey);
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === toDateKey(today);
                return (
                  <TouchableOpacity key={dateKey} style={[styles.calCell, isSelected && styles.calCellSelected]} onPress={() => { setSelectedDate(dateKey); setTab('today'); }}>
                    <Text style={[styles.calDayNum, isToday && styles.todayText, isSelected && styles.selectedText]}>{day}</Text>
                    {color && <View style={[styles.calDot, { backgroundColor: color }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.calLegend}>
            {[['#4CAF50','80–100% מהיעד'],['#FFA726','מתחת ל-80%'],['#e53935','חריגה מהיעד']].map(([c,l]) => (
              <View key={l} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: c }]} />
                <Text style={styles.legendText}>{l}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* מודל גרמים */}
      <Modal visible={!!gramModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{gramModal?.name}</Text>
            <Text style={styles.modalSub}>לכל 100g: {gramModal?.calories} קל'  •  {gramModal?.protein}g חלבון</Text>
            <TextInput style={styles.gramInput} value={grams} onChangeText={setGrams} keyboardType="numeric" textAlign="center" />
            <Text style={styles.gramLabel}>גרמים</Text>
            {grams && !isNaN(grams) && Number(grams) > 0 && (
              <View style={styles.gramResultBox}>
                <Text style={styles.gramResultItem}>🔥 {Math.round((gramModal?.calories / 100) * Number(grams))} קלוריות</Text>
                <Text style={styles.gramResultItem}>💪 {Math.round((gramModal?.protein / 100) * Number(grams) * 10) / 10}g חלבון</Text>
              </View>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setGramModal(null)}>
                <Text style={styles.cancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmGrams}>
                <Text style={styles.confirmText}>הוסף</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* מודל ידני */}
      <Modal visible={manualModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>הוסף מאכל ידנית</Text>

              <View style={styles.modeToggle}>
                <TouchableOpacity style={[styles.modeBtn, manualMode === 'per100' && styles.modeBtnActive]} onPress={() => setManualMode('per100')}>
                  <Text style={[styles.modeBtnText, manualMode === 'per100' && styles.modeBtnTextActive]}>לפי 100g</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modeBtn, manualMode === 'fixed' && styles.modeBtnActive]} onPress={() => setManualMode('fixed')}>
                  <Text style={[styles.modeBtnText, manualMode === 'fixed' && styles.modeBtnTextActive]}>מוצר סגור</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.modalInput} placeholder="שם המאכל" value={manualName} onChangeText={setManualName} textAlign="right" />

              {manualMode === 'per100' ? (
                <>
                  <Text style={styles.modeHint}>הכנס ערכים לכל 100 גרם</Text>
                  <TextInput style={styles.modalInput} placeholder="קלוריות ל-100g" value={manualCalPer100} onChangeText={setManualCalPer100} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="חלבון ל-100g (אופציונלי)" value={manualProteinPer100} onChangeText={setManualProteinPer100} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="כמה גרם אכלת?" value={manualGrams} onChangeText={setManualGrams} keyboardType="numeric" textAlign="right" />
                  {manualCalPer100 && manualGrams && (
                    <View style={styles.gramResultBox}>
                      <Text style={styles.gramResultItem}>🔥 {Math.round((Number(manualCalPer100) / 100) * Number(manualGrams))} קלוריות</Text>
                      {manualProteinPer100 ? <Text style={styles.gramResultItem}>💪 {Math.round((Number(manualProteinPer100) / 100) * Number(manualGrams) * 10) / 10}g חלבון</Text> : null}
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.modeHint}>הכנס את הערכים המדויקים של המוצר</Text>
                  <TextInput style={styles.modalInput} placeholder="קלוריות (סה״כ)" value={manualFixedCal} onChangeText={setManualFixedCal} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="חלבון בגרמים (אופציונלי)" value={manualFixedProtein} onChangeText={setManualFixedProtein} keyboardType="numeric" textAlign="right" />
                </>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setManualModal(false)}>
                  <Text style={styles.cancelText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={addManual}>
                  <Text style={styles.confirmText}>הוסף</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', paddingTop: 55, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logout: { color: '#c8e6c9', fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  tabText: { color: '#888', fontSize: 14 },
  tabTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#fff', margin: 14, borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 },
  dateText: { textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 14 },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  calorieStat: { alignItems: 'center' },
  calorieNum: { fontSize: 30, fontWeight: 'bold', color: '#222' },
  calorieLabel: { color: '#999', marginTop: 2, fontSize: 13 },
  red: { color: '#e53935' },
  progressBar: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  progressOver: { backgroundColor: '#e53935' },
  proteinRow: { gap: 4 },
  proteinLabel: { textAlign: 'right', color: '#555', fontSize: 13 },
  proteinBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  proteinFill: { height: '100%', backgroundColor: '#2196F3', borderRadius: 3 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#555', marginHorizontal: 14, marginTop: 10, marginBottom: 6, textAlign: 'right' },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  manualBtn: { backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  manualBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  mealRow: { backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 6, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  removeHint: { color: '#ccc', fontSize: 16 },
  mealInfo: { flex: 1, alignItems: 'flex-end' },
  mealName: { fontSize: 15, color: '#333' },
  mealMacros: { fontSize: 12, color: '#888', marginTop: 2 },
  searchInput: { backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 8, padding: 12, borderRadius: 12, fontSize: 15, elevation: 1 },
  categoriesRow: { paddingHorizontal: 10, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', marginHorizontal: 4, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipText: { color: '#555', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  foodList: { paddingHorizontal: 14, paddingBottom: 30, gap: 8 },
  foodRow: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  foodInfo: { alignItems: 'flex-end' },
  foodName: { fontSize: 15, color: '#222', fontWeight: '500' },
  foodPer: { fontSize: 11, color: '#bbb', marginTop: 2 },
  foodMacros: { alignItems: 'flex-start', gap: 2 },
  foodCal: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  foodProtein: { fontSize: 12, color: '#2196F3' },
  weekContainer: { padding: 16, paddingBottom: 40 },
  weekTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 20 },
  chart: { flexDirection: 'row', height: 200, alignItems: 'flex-end', backgroundColor: '#fff', borderRadius: 16, padding: 12, gap: 6, elevation: 2 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barCalText: { fontSize: 9, color: '#888', marginBottom: 2 },
  barTrack: { width: '70%', height: '85%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barOk: { backgroundColor: '#4CAF50' },
  barOver: { backgroundColor: '#e53935' },
  barEmpty: { backgroundColor: '#eee', height: 4 },
  barLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  barLabelToday: { color: '#4CAF50', fontWeight: 'bold' },
  weekLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  weekStats: { marginTop: 16, gap: 8 },
  weekDayRow: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  weekDayLabel: { color: '#555', fontSize: 14 },
  weekDayCal: { color: '#4CAF50', fontWeight: 'bold', fontSize: 14 },
  calendarCard: { backgroundColor: '#fff', margin: 14, borderRadius: 16, padding: 16, elevation: 2 },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navArrow: { fontSize: 28, color: '#4CAF50', paddingHorizontal: 8 },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', color: '#999', fontSize: 13, fontWeight: 'bold' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calCellSelected: { backgroundColor: '#e8f5e9' },
  calDayNum: { fontSize: 14, color: '#333' },
  todayText: { color: '#4CAF50', fontWeight: 'bold' },
  selectedText: { fontWeight: 'bold' },
  calDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  calLegend: { marginHorizontal: 14, marginBottom: 30, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#555', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#222', marginBottom: 4 },
  modalSub: { textAlign: 'center', color: '#888', marginBottom: 20, fontSize: 13 },
  gramInput: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#4CAF50', marginBottom: 4, paddingBottom: 4 },
  gramLabel: { textAlign: 'center', color: '#888', marginBottom: 12 },
  gramResultBox: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 16, gap: 6 },
  gramResultItem: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333' },
  modeToggle: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  modeBtnText: { color: '#888', fontSize: 14 },
  modeBtnTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  modeHint: { textAlign: 'right', color: '#888', fontSize: 13, marginBottom: 8 },
  modalInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 10 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#555', fontSize: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 12, padding: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
