import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMealsByDay, saveMealsByDay } from '../data/storage';
import { FOOD_DB, CATEGORIES } from '../data/foods';
import { colors } from '../theme';
import FoodScanModal from './FoodScanModal';
import BarcodeScanModal from './BarcodeScanModal';

async function searchOpenFoodFacts(query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&fields=product_name,nutriments,brands&page_size=25&json=true`;
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();
    return (data.products || [])
      .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .map(p => ({
        name: p.product_name,
        brand: p.brands || '',
        calories: Math.round(p.nutriments['energy-kcal_100g']),
        protein: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
        category: 'חיפוש אונליין',
        online: true,
      }));
  } finally {
    clearTimeout(timeout);
  }
}

const DAYS_HE = ['א','ב','ג','ד','ה','ו','ש'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
function toDateKey(d) { return d.toISOString().split('T')[0]; }

function CalorieRing({ total, goal }) {
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(total / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const over = total > goal;

  return (
    <View style={ringStyles.container}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke={colors.cardBorder} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={radius}
          stroke={over ? colors.red : colors.teal}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={ringStyles.center}>
        <Text style={[ringStyles.total, over && { color: colors.red }]}>{total}</Text>
        <Text style={ringStyles.label}>מתוך {goal}</Text>
        <Text style={ringStyles.sublabel}>קלוריות</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  center: { position: 'absolute', alignItems: 'center' },
  total: { fontSize: 48, fontWeight: 'bold', color: colors.teal },
  label: { fontSize: 14, color: colors.subtext, marginTop: -4 },
  sublabel: { fontSize: 12, color: colors.subtext },
});

export default function HomeScreen({ user, onLogout, onEditProfile }) {
  const today = new Date();
  const [mealsByDay, setMealsByDay] = useState({});
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tab, setTab] = useState('today');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchMode, setSearchMode] = useState('local'); // 'local' | 'online'
  const [onlineResults, setOnlineResults] = useState([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineSearched, setOnlineSearched] = useState(false);
  const [gramModal, setGramModal] = useState(null);
  const [grams, setGrams] = useState('100');
  const [manualModal, setManualModal] = useState(false);
  const [manualMode, setManualMode] = useState('per100');
  const [manualName, setManualName] = useState('');
  const [manualCalPer100, setManualCalPer100] = useState('');
  const [manualProteinPer100, setManualProteinPer100] = useState('');
  const [manualGrams, setManualGrams] = useState('100');
  const [manualFixedCal, setManualFixedCal] = useState('');
  const [manualFixedProtein, setManualFixedProtein] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const dailyGoal = user.dailyGoal || 2000;
  const proteinGoal = Math.round((dailyGoal * 0.3) / 4);

  useEffect(() => {
    getMealsByDay().then(setMealsByDay);
    AsyncStorage.getItem('favorites').then(data => {
      if (data) setFavorites(new Set(JSON.parse(data)));
    });
  }, []);

  async function toggleFavorite(name) {
    const updated = new Set(favorites);
    if (updated.has(name)) updated.delete(name); else updated.add(name);
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify([...updated]));
  }

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
    addMealEntry({ name: gramModal.name, calories: Math.round((gramModal.calories / 100) * g), protein: Math.round((gramModal.protein / 100) * g * 10) / 10, grams: g });
    setGramModal(null);
  }

  function addManual() {
    if (!manualName) return Alert.alert('שגיאה', 'נא להכניס שם');
    if (manualMode === 'per100') {
      if (!manualCalPer100 || isNaN(manualCalPer100)) return Alert.alert('שגיאה', 'נא להכניס קלוריות');
      const g = Number(manualGrams) || 100;
      addMealEntry({ name: manualName, calories: Math.round((Number(manualCalPer100) / 100) * g), protein: manualProteinPer100 ? Math.round((Number(manualProteinPer100) / 100) * g * 10) / 10 : 0, grams: g });
    } else {
      if (!manualFixedCal || isNaN(manualFixedCal)) return Alert.alert('שגיאה', 'נא להכניס קלוריות');
      addMealEntry({ name: manualName, calories: Number(manualFixedCal), protein: Number(manualFixedProtein) || 0, grams: null });
    }
    setManualModal(false);
    setManualName(''); setManualCalPer100(''); setManualProteinPer100(''); setManualGrams('100'); setManualFixedCal(''); setManualFixedProtein('');
  }

  const selectedMeals = mealsByDay[selectedDate] || [];
  const totalCalories = selectedMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = Math.round(selectedMeals.reduce((s, m) => s + (m.protein || 0), 0));
  const remaining = dailyGoal - totalCalories;
  const proteinProgress = Math.min(totalProtein / proteinGoal, 1);

  async function runOnlineSearch() {
    if (!search.trim()) return Alert.alert('חיפוש', 'נא להכניס שם מאכל לחיפוש');
    setOnlineLoading(true);
    setOnlineSearched(false);
    try {
      const results = await searchOpenFoodFacts(search);
      setOnlineResults(results);
      setOnlineSearched(true);
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'פג תוקף הבקשה — בדוק חיבור אינטרנט' : `שגיאה: ${e.message}`;
      Alert.alert('שגיאת חיבור', msg);
    } finally {
      setOnlineLoading(false);
    }
  }

  const filteredFoods = selectedCategory === '__favorites__'
    ? FOOD_DB.filter(f => favorites.has(f.name) && f.name.includes(search))
    : FOOD_DB.filter(f => f.name.includes(search) && (!selectedCategory || f.category === selectedCategory));

  function getDayColor(dateKey) {
    const meals = mealsByDay[dateKey];
    if (!meals || meals.length === 0) return null;
    const cal = meals.reduce((s, m) => s + m.calories, 0);
    return cal > dailyGoal ? colors.red : cal >= dailyGoal * 0.8 ? colors.teal : colors.orange;
  }

  function buildCalendarDays() {
    const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
    const days = [];
    for (let i = 0; i < new Date(year, month, 1).getDay(); i++) days.push(null);
    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) days.push(d);
    return days;
  }

  function getWeekData() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i));
      const key = toDateKey(d);
      return { key, label: DAYS_HE[d.getDay()], cal: (mealsByDay[key] || []).reduce((s, m) => s + m.calories, 0) };
    });
  }

  const weekData = getWeekData();
  const maxCal = Math.max(...weekData.map(d => d.cal), dailyGoal);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onLogout}><Text style={styles.logout}>יציאה</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>שלום, {user.username} ⚡</Text>
        <TouchableOpacity onPress={onEditProfile}><Text style={styles.editProfile}>פרופיל</Text></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[['today','יומי'],['week','שבועי'],['calendar','לוח שנה']].map(([key,label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'today' && (
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.ringCard}>
            <Text style={styles.dateText}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <CalorieRing total={totalCalories} goal={dailyGoal} />
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, remaining < 0 && { color: colors.red }]}>{Math.abs(remaining)}</Text>
                <Text style={styles.statLabel}>{remaining >= 0 ? 'נותר' : 'חריגה'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: '#4FC3F7' }]}>{totalProtein}g</Text>
                <Text style={styles.statLabel}>חלבון / {proteinGoal}g</Text>
              </View>
            </View>
            <View style={styles.proteinBarRow}>
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
                    <Text style={styles.mealName}>{m.name}{m.grams ? ` · ${m.grams}g` : ''}</Text>
                    <Text style={styles.mealMacros}>{m.calories} קל'  •  {m.protein || 0}g חלבון</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.addRow}>
            <Text style={styles.sectionTitle}>הוסף מאכל</Text>
            <View style={styles.addBtns}>
              <TouchableOpacity style={styles.scanBtn} onPress={() => setScanOpen(true)}>
                <Text style={styles.scanBtnText}>📷 AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barcodeBtn} onPress={() => setBarcodeOpen(true)}>
                <Text style={styles.barcodeBtnText}>🔍 ברקוד</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.manualBtn} onPress={() => setManualModal(true)}>
                <Text style={styles.manualBtnText}>+ ידני</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* טוגל חיפוש מקומי/אונליין */}
          <View style={styles.searchModeRow}>
            {[['local','📦 מקומי'],['online','🌐 אונליין']].map(([mode, label]) => (
              <TouchableOpacity key={mode} style={[styles.modeChip, searchMode === mode && styles.modeChipActive]}
                onPress={() => { setSearchMode(mode); setOnlineResults([]); setOnlineSearched(false); }}>
                <Text style={[styles.modeChipText, searchMode === mode && styles.modeChipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* שדה חיפוש */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchMode === 'local' ? 'חפש במאגר המקומי...' : 'חפש מוצר באינטרנט...'}
              placeholderTextColor={colors.subtext}
              value={search}
              onChangeText={t => { setSearch(t); if (searchMode === 'online') { setOnlineResults([]); setOnlineSearched(false); }}}
              textAlign="right"
              returnKeyType={searchMode === 'online' ? 'search' : 'default'}
              onSubmitEditing={searchMode === 'online' ? runOnlineSearch : undefined}
            />
            {searchMode === 'online' && (
              <TouchableOpacity style={styles.searchBtn} onPress={runOnlineSearch}>
                <Text style={styles.searchBtnText}>חפש</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* פילטר קטגוריות — רק במצב מקומי */}
          {searchMode === 'local' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
              {[null, '__favorites__', ...CATEGORIES].map(cat => (
                <TouchableOpacity key={cat || 'all'} style={[styles.chip, selectedCategory === cat && styles.chipActive, cat === '__favorites__' && styles.chipFav, cat === '__favorites__' && selectedCategory === cat && styles.chipFavActive]} onPress={() => setSelectedCategory(cat)}>
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat === '__favorites__' ? `⭐ מועדפים (${favorites.size})` : cat || 'הכל'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* תוצאות */}
          {searchMode === 'online' ? (
            <View style={styles.foodList}>
              {onlineLoading && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={colors.teal} size="large" />
                  <Text style={styles.loadingText}>מחפש...</Text>
                </View>
              )}
              {!onlineLoading && onlineSearched && onlineResults.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>לא נמצאו תוצאות</Text>
                  <Text style={styles.emptySubtext}>נסה לחפש באנגלית או שנה את המילות החיפוש</Text>
                </View>
              )}
              {!onlineLoading && onlineResults.map((food, i) => (
                <TouchableOpacity key={i} style={styles.foodRow} onPress={() => { setGramModal(food); setGrams('100'); }}>
                  <View style={styles.foodMacros}>
                    <Text style={styles.foodCal}>{food.calories}</Text>
                    <Text style={styles.foodCalUnit}>קל'</Text>
                    <Text style={styles.foodProteinText}>{food.protein}g</Text>
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    {food.brand ? <Text style={styles.foodBrand}>{food.brand}</Text> : null}
                    <Text style={styles.foodPer}>לכל 100g</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {!onlineLoading && !onlineSearched && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>🌐 חיפוש בOpen Food Facts</Text>
                  <Text style={styles.emptySubtext}>מיליוני מוצרים מכל העולם כולל ישראל{'\n'}כתוב שם מוצר ולחץ חפש</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.foodList}>
              {filteredFoods.length === 0 && selectedCategory === '__favorites__' && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>אין מועדפים עדיין</Text>
                  <Text style={styles.emptySubtext}>לחץ על ❤️ ליד מאכל כדי להוסיף למועדפים</Text>
                </View>
              )}
              {filteredFoods.map(food => (
                <View key={food.name} style={styles.foodRow}>
                  <TouchableOpacity onPress={() => toggleFavorite(food.name)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.heartIcon}>{favorites.has(food.name) ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.foodRowInner} onPress={() => { setGramModal(food); setGrams('100'); }}>
                    <View style={styles.foodMacros}>
                      <Text style={styles.foodCal}>{food.calories}</Text>
                      <Text style={styles.foodCalUnit}>קל'</Text>
                      <Text style={styles.foodProteinText}>{food.protein}g</Text>
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodPer}>לכל 100g</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
                  <View style={[styles.bar, { height: `${(d.cal / maxCal) * 100}%` }, d.cal > dailyGoal ? styles.barOver : d.cal > 0 ? styles.barOk : styles.barEmpty]} />
                </View>
                <Text style={[styles.barLabel, d.key === toDateKey(today) && styles.barLabelToday]}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.weekStats}>
            {weekData.map(d => (
              <TouchableOpacity key={d.key} style={styles.weekDayRow} onPress={() => { setSelectedDate(d.key); setTab('today'); }}>
                <Text style={[styles.weekDayCal, d.cal > dailyGoal && { color: colors.red }]}>{d.cal} קל'</Text>
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
                const dotColor = getDayColor(dateKey);
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === toDateKey(today);
                return (
                  <TouchableOpacity key={dateKey} style={[styles.calCell, isSelected && styles.calCellSelected]} onPress={() => { setSelectedDate(dateKey); setTab('today'); }}>
                    <Text style={[styles.calDayNum, isToday && styles.todayText, isSelected && styles.selectedText]}>{day}</Text>
                    {dotColor && <View style={[styles.calDot, { backgroundColor: dotColor }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      <FoodScanModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onAddFoods={foods => { foods.forEach(f => addMealEntry(f)); setScanOpen(false); }}
      />
      <BarcodeScanModal
        visible={barcodeOpen}
        onClose={() => setBarcodeOpen(false)}
        onAddFood={food => { addMealEntry(food); setBarcodeOpen(false); }}
      />

      <Modal visible={!!gramModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setGramModal(null)}><Text style={styles.cancelText}>ביטול</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmGrams}><Text style={styles.confirmText}>הוסף</Text></TouchableOpacity>
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={manualModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>הוסף מאכל ידנית</Text>
              <View style={styles.modeToggle}>
                {[['per100','לפי 100g'],['fixed','מוצר סגור']].map(([val,label]) => (
                  <TouchableOpacity key={val} style={[styles.modeBtn, manualMode === val && styles.modeBtnActive]} onPress={() => setManualMode(val)}>
                    <Text style={[styles.modeBtnText, manualMode === val && styles.modeBtnTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.modalInput} placeholder="שם המאכל" placeholderTextColor={colors.subtext} value={manualName} onChangeText={setManualName} textAlign="right" />
              {manualMode === 'per100' ? (
                <>
                  <TextInput style={styles.modalInput} placeholder="קלוריות ל-100g" placeholderTextColor={colors.subtext} value={manualCalPer100} onChangeText={setManualCalPer100} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="חלבון ל-100g (אופציונלי)" placeholderTextColor={colors.subtext} value={manualProteinPer100} onChangeText={setManualProteinPer100} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="כמה גרם אכלת?" placeholderTextColor={colors.subtext} value={manualGrams} onChangeText={setManualGrams} keyboardType="numeric" textAlign="right" />
                  {manualCalPer100 && manualGrams && (
                    <View style={styles.gramResultBox}>
                      <Text style={styles.gramResultItem}>🔥 {Math.round((Number(manualCalPer100) / 100) * Number(manualGrams))} קלוריות</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <TextInput style={styles.modalInput} placeholder="קלוריות (סה״כ)" placeholderTextColor={colors.subtext} value={manualFixedCal} onChangeText={setManualFixedCal} keyboardType="numeric" textAlign="right" />
                  <TextInput style={styles.modalInput} placeholder="חלבון בגרמים (אופציונלי)" placeholderTextColor={colors.subtext} value={manualFixedProtein} onChangeText={setManualFixedProtein} keyboardType="numeric" textAlign="right" />
                </>
              )}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setManualModal(false)}><Text style={styles.cancelText}>ביטול</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={addManual}><Text style={styles.confirmText}>הוסף</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  kav: { flex: 1 },
  header: { backgroundColor: colors.card, paddingTop: 55, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  logout: { color: colors.subtext, fontSize: 14 },
  editProfile: { color: colors.teal, fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.teal },
  tabText: { color: colors.subtext, fontSize: 14 },
  tabTextActive: { color: colors.teal, fontWeight: 'bold' },
  ringCard: { backgroundColor: colors.card, margin: 14, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  dateText: { color: colors.subtext, fontSize: 13, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 8 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: colors.teal },
  statLabel: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.cardBorder, height: 30, alignSelf: 'center' },
  proteinBarRow: { width: '100%', marginTop: 12 },
  proteinBar: { height: 6, backgroundColor: colors.cardBorder, borderRadius: 3, overflow: 'hidden' },
  proteinFill: { height: '100%', backgroundColor: '#4FC3F7', borderRadius: 3 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.subtext, marginHorizontal: 14, marginTop: 10, marginBottom: 6, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1 },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  addBtns: { flexDirection: 'row', gap: 8 },
  scanBtn: { backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.orange },
  scanBtnText: { color: colors.orange, fontWeight: 'bold', fontSize: 13 },
  barcodeBtn: { backgroundColor: 'rgba(160,120,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#a078ff' },
  barcodeBtnText: { color: '#a078ff', fontWeight: 'bold', fontSize: 13 },
  manualBtn: { backgroundColor: colors.tealGlow, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.teal },
  manualBtnText: { color: colors.teal, fontWeight: 'bold', fontSize: 13 },
  mealRow: { backgroundColor: colors.card, marginHorizontal: 14, marginBottom: 6, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.cardBorder },
  removeHint: { color: colors.subtext, fontSize: 14 },
  mealInfo: { flex: 1, alignItems: 'flex-end' },
  mealName: { fontSize: 15, color: colors.text },
  mealMacros: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  searchInput: { backgroundColor: colors.card, marginHorizontal: 14, marginBottom: 8, padding: 12, borderRadius: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder },
  categoriesRow: { paddingHorizontal: 10, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, marginHorizontal: 4, borderWidth: 1, borderColor: colors.cardBorder },
  chipActive: { backgroundColor: colors.tealGlow, borderColor: colors.teal },
  chipText: { color: colors.subtext, fontSize: 13 },
  chipTextActive: { color: colors.teal },
  searchModeRow: { flexDirection: 'row', marginHorizontal: 14, marginBottom: 10, backgroundColor: colors.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.cardBorder },
  modeChip: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  modeChipActive: { backgroundColor: colors.tealGlow, borderWidth: 1, borderColor: colors.teal },
  modeChipText: { color: colors.subtext, fontSize: 14 },
  modeChipTextActive: { color: colors.teal, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', marginHorizontal: 14, marginBottom: 8, gap: 8 },
  searchBtn: { backgroundColor: colors.teal, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', shadowColor: colors.teal, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  searchBtnText: { color: colors.bg, fontWeight: 'bold', fontSize: 14 },
  loadingBox: { alignItems: 'center', padding: 40, gap: 12 },
  loadingText: { color: colors.subtext, fontSize: 14 },
  emptyBox: { alignItems: 'center', padding: 30, gap: 8 },
  emptyText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: colors.subtext, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  foodBrand: { fontSize: 11, color: colors.subtext, marginTop: 1 },
  foodList: { paddingHorizontal: 14, paddingBottom: 30, gap: 8 },
  foodRow: { backgroundColor: colors.card, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.cardBorder },
  foodRowInner: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heartIcon: { fontSize: 18 },
  chipFav: { borderColor: '#f4a', backgroundColor: 'rgba(255,170,170,0.08)' },
  chipFavActive: { borderColor: '#f88', backgroundColor: 'rgba(255,136,136,0.18)' },
  foodInfo: { alignItems: 'flex-end' },
  foodName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  foodPer: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  foodMacros: { alignItems: 'center' },
  foodCal: { fontSize: 18, fontWeight: 'bold', color: colors.teal },
  foodCalUnit: { fontSize: 10, color: colors.subtext },
  foodProteinText: { fontSize: 12, color: '#4FC3F7', marginTop: 2 },
  weekContainer: { padding: 16, paddingBottom: 40 },
  weekTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: colors.text, marginBottom: 20 },
  chart: { flexDirection: 'row', height: 200, alignItems: 'flex-end', backgroundColor: colors.card, borderRadius: 16, padding: 12, gap: 6, borderWidth: 1, borderColor: colors.cardBorder },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barCalText: { fontSize: 8, color: colors.subtext, marginBottom: 2 },
  barTrack: { width: '70%', height: '85%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barOk: { backgroundColor: colors.teal },
  barOver: { backgroundColor: colors.red },
  barEmpty: { backgroundColor: colors.cardBorder, height: 4 },
  barLabel: { fontSize: 12, color: colors.subtext, marginTop: 4 },
  barLabelToday: { color: colors.teal, fontWeight: 'bold' },
  weekStats: { marginTop: 16, gap: 8 },
  weekDayRow: { backgroundColor: colors.card, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.cardBorder },
  weekDayLabel: { color: colors.subtext, fontSize: 14 },
  weekDayCal: { color: colors.teal, fontWeight: 'bold', fontSize: 14 },
  calendarCard: { backgroundColor: colors.card, margin: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navArrow: { fontSize: 28, color: colors.teal, paddingHorizontal: 8 },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', color: colors.subtext, fontSize: 13 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calCellSelected: { backgroundColor: colors.tealGlow },
  calDayNum: { fontSize: 14, color: colors.text },
  todayText: { color: colors.teal, fontWeight: 'bold' },
  selectedText: { fontWeight: 'bold' },
  calDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: colors.cardBorder },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: colors.text, marginBottom: 4 },
  modalSub: { textAlign: 'center', color: colors.subtext, marginBottom: 20, fontSize: 13 },
  gramInput: { fontSize: 48, fontWeight: 'bold', color: colors.teal, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: colors.teal, marginBottom: 4, paddingBottom: 4 },
  gramLabel: { textAlign: 'center', color: colors.subtext, marginBottom: 12 },
  gramResultBox: { backgroundColor: colors.tealGlow, borderRadius: 12, padding: 14, marginBottom: 16, gap: 6, borderWidth: 1, borderColor: colors.tealDim },
  gramResultItem: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeBtnActive: { backgroundColor: colors.tealGlow, borderWidth: 1, borderColor: colors.teal },
  modeBtnText: { color: colors.subtext, fontSize: 14 },
  modeBtnTextActive: { color: colors.teal, fontWeight: 'bold' },
  modalInput: { backgroundColor: colors.input, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 10, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: colors.input, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  cancelText: { color: colors.subtext, fontSize: 15 },
  confirmBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: colors.teal, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmText: { color: colors.bg, fontSize: 15, fontWeight: 'bold' },
});
