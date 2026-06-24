import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';

const DAILY_GOAL = 2000;

const FOOD_DB = [
  { name: 'תפוח', calories: 80, category: 'פירות' },
  { name: 'בננה', calories: 90, category: 'פירות' },
  { name: 'תפוז', calories: 60, category: 'פירות' },
  { name: 'אבטיח 200g', calories: 60, category: 'פירות' },
  { name: 'ענבים 100g', calories: 70, category: 'פירות' },
  { name: 'אגס', calories: 100, category: 'פירות' },
  { name: 'מנגו 100g', calories: 65, category: 'פירות' },
  { name: 'תות שדה 100g', calories: 33, category: 'פירות' },
  { name: 'אפרסק', calories: 58, category: 'פירות' },
  { name: 'קלמנטינה', calories: 35, category: 'פירות' },
  { name: 'עגבנייה', calories: 20, category: 'ירקות' },
  { name: 'מלפפון', calories: 15, category: 'ירקות' },
  { name: 'גזר', calories: 35, category: 'ירקות' },
  { name: 'פלפל', calories: 30, category: 'ירקות' },
  { name: 'חסה 100g', calories: 15, category: 'ירקות' },
  { name: 'ברוקולי 100g', calories: 34, category: 'ירקות' },
  { name: 'תירס 100g', calories: 86, category: 'ירקות' },
  { name: 'בצל', calories: 45, category: 'ירקות' },
  { name: 'תפוח אדמה', calories: 130, category: 'ירקות' },
  { name: 'בטטה', calories: 115, category: 'ירקות' },
  { name: 'חציל', calories: 35, category: 'ירקות' },
  { name: 'קישוא', calories: 20, category: 'ירקות' },
  { name: 'פרוסת לחם לבן', calories: 80, category: 'לחם ודגנים' },
  { name: 'פרוסת לחם מחיטה מלאה', calories: 70, category: 'לחם ודגנים' },
  { name: 'פיתה', calories: 170, category: 'לחם ודגנים' },
  { name: 'לחמנייה', calories: 145, category: 'לחם ודגנים' },
  { name: 'אורז מבושל 100g', calories: 130, category: 'לחם ודגנים' },
  { name: 'פסטה מבושלת 100g', calories: 158, category: 'לחם ודגנים' },
  { name: 'קוסקוס מבושל 100g', calories: 112, category: 'לחם ודגנים' },
  { name: 'שיבולת שועל 40g', calories: 150, category: 'לחם ודגנים' },
  { name: 'קרקר', calories: 40, category: 'לחם ודגנים' },
  { name: 'בייגלה קטן', calories: 25, category: 'לחם ודגנים' },
  { name: 'חלב 200ml', calories: 100, category: 'חלב וגבינות' },
  { name: 'יוגורט 150g', calories: 90, category: 'חלב וגבינות' },
  { name: 'יוגורט 0% 150g', calories: 60, category: 'חלב וגבינות' },
  { name: 'גבינה לבנה 5% 100g', calories: 90, category: 'חלב וגבינות' },
  { name: 'גבינה צהובה פרוסה', calories: 80, category: 'חלב וגבינות' },
  { name: 'קוטג׳ 200g', calories: 140, category: 'חלב וגבינות' },
  { name: 'שמנת חמוצה 15% כף', calories: 30, category: 'חלב וגבינות' },
  { name: 'גבינת בולגרית 30g', calories: 75, category: 'חלב וגבינות' },
  { name: 'ביצה קשה', calories: 70, category: 'ביצים' },
  { name: 'ביצה מטוגנת', calories: 90, category: 'ביצים' },
  { name: 'חביתה (2 ביצים)', calories: 180, category: 'ביצים' },
  { name: 'שקשוקה מנה', calories: 250, category: 'ביצים' },
  { name: 'חזה עוף 100g', calories: 165, category: 'בשר ועוף' },
  { name: 'שוק עוף 100g', calories: 215, category: 'בשר ועוף' },
  { name: 'המבורגר בקר 100g', calories: 250, category: 'בשר ועוף' },
  { name: 'סטייק בקר 100g', calories: 270, category: 'בשר ועוף' },
  { name: 'קציצות עוף (2)', calories: 200, category: 'בשר ועוף' },
  { name: 'שניצל עוף', calories: 280, category: 'בשר ועוף' },
  { name: 'נקניקיות (2)', calories: 180, category: 'בשר ועוף' },
  { name: 'טונה בפחית 100g', calories: 100, category: 'בשר ועוף' },
  { name: 'סלמון 100g', calories: 208, category: 'בשר ועוף' },
  { name: 'חומוס מבושל 100g', calories: 164, category: 'קטניות' },
  { name: 'עדשים מבושלות 100g', calories: 116, category: 'קטניות' },
  { name: 'שעועית מבושלת 100g', calories: 127, category: 'קטניות' },
  { name: 'טופו 100g', calories: 76, category: 'קטניות' },
  { name: 'ממרח חומוס כף', calories: 50, category: 'קטניות' },
  { name: 'שמן זית כף', calories: 120, category: 'שומנים' },
  { name: 'חמאה כף', calories: 100, category: 'שומנים' },
  { name: 'אבוקדו חצי', calories: 160, category: 'שומנים' },
  { name: 'טחינה גולמית כף', calories: 90, category: 'שומנים' },
  { name: 'שקדים 10 יח׳', calories: 70, category: 'שומנים' },
  { name: 'אגוזי מלך 5 יח׳', calories: 130, category: 'שומנים' },
  { name: 'בוטנים 30g', calories: 170, category: 'שומנים' },
  { name: 'שוקולד מריר 20g', calories: 110, category: 'חטיפים' },
  { name: 'שוקולד חלב 20g', calories: 105, category: 'חטיפים' },
  { name: 'ביסקוויט (2)', calories: 100, category: 'חטיפים' },
  { name: 'עוגיית אוריאו (2)', calories: 106, category: 'חטיפים' },
  { name: 'צ׳יפס 30g', calories: 160, category: 'חטיפים' },
  { name: 'פופקורן 30g', calories: 110, category: 'חטיפים' },
  { name: 'גלידת וניל כדור', calories: 130, category: 'חטיפים' },
  { name: 'עוגה פרוסה', calories: 280, category: 'חטיפים' },
  { name: 'דונאט', calories: 250, category: 'חטיפים' },
  { name: 'קפה שחור', calories: 5, category: 'שתייה' },
  { name: 'קפה עם חלב', calories: 50, category: 'שתייה' },
  { name: 'לאטה', calories: 150, category: 'שתייה' },
  { name: 'מיץ תפוזים 200ml', calories: 90, category: 'שתייה' },
  { name: 'קולה 330ml', calories: 140, category: 'שתייה' },
  { name: 'קולה זירו 330ml', calories: 1, category: 'שתייה' },
  { name: 'בירה 330ml', calories: 150, category: 'שתייה' },
  { name: 'מיץ ענבים 200ml', calories: 130, category: 'שתייה' },
  { name: 'פיצה פרוסה', calories: 285, category: 'ארוחות מוכנות' },
  { name: 'בורגר עם לחמנייה', calories: 500, category: 'ארוחות מוכנות' },
  { name: 'שווארמה בפיתה', calories: 450, category: 'ארוחות מוכנות' },
  { name: 'פלאפל בפיתה', calories: 400, category: 'ארוחות מוכנות' },
  { name: 'סלט ירקות מנה', calories: 80, category: 'ארוחות מוכנות' },
  { name: 'סושי מגש (8 יח׳)', calories: 320, category: 'ארוחות מוכנות' },
  { name: 'פסטה ברוטב עגבניות', calories: 350, category: 'ארוחות מוכנות' },
  { name: 'אורז עם עוף', calories: 400, category: 'ארוחות מוכנות' },
];

const CATEGORIES = [...new Set(FOOD_DB.map(f => f.category))];
const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

export default function App() {
  const today = new Date();
  const [mealsByDay, setMealsByDay] = useState({});
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tab, setTab] = useState('today'); // 'today' | 'calendar'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const selectedMeals = mealsByDay[selectedDate] || [];
  const totalCalories = selectedMeals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = DAILY_GOAL - totalCalories;
  const progress = Math.min(totalCalories / DAILY_GOAL, 1);

  function addMeal(food) {
    const key = selectedDate;
    setMealsByDay(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { ...food, id: Date.now() }],
    }));
  }

  function removeMeal(id) {
    setMealsByDay(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(m => m.id !== id),
    }));
  }

  function getDayColor(dateKey) {
    const meals = mealsByDay[dateKey];
    if (!meals || meals.length === 0) return null;
    const cal = meals.reduce((s, m) => s + m.calories, 0);
    if (cal > DAILY_GOAL) return '#e53935';
    if (cal >= DAILY_GOAL * 0.8) return '#4CAF50';
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

  const filteredFoods = FOOD_DB.filter(food => {
    const matchSearch = food.name.includes(search);
    const matchCategory = !selectedCategory || food.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const calendarDays = buildCalendarDays();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>מעקב קלוריות</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'today' && styles.tabActive]} onPress={() => setTab('today')}>
          <Text style={[styles.tabText, tab === 'today' && styles.tabTextActive]}>יומי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'calendar' && styles.tabActive]} onPress={() => setTab('calendar')}>
          <Text style={[styles.tabText, tab === 'calendar' && styles.tabTextActive]}>לוח שנה</Text>
        </TouchableOpacity>
      </View>

      {tab === 'today' ? (
        <ScrollView>
          <View style={styles.summaryCard}>
            <Text style={styles.selectedDateText}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <View style={styles.calorieRow}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieNumber}>{totalCalories}</Text>
                <Text style={styles.calorieLabel}>נאכל</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieNumber}>{DAILY_GOAL}</Text>
                <Text style={styles.calorieLabel}>יעד</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={[styles.calorieNumber, remaining < 0 && styles.overGoal]}>
                  {Math.abs(remaining)}
                </Text>
                <Text style={styles.calorieLabel}>{remaining >= 0 ? 'נותר' : 'חריגה'}</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }, progress >= 1 && styles.progressOver]} />
            </View>
          </View>

          {selectedMeals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>ארוחות</Text>
              {selectedMeals.map(meal => (
                <TouchableOpacity key={meal.id} style={styles.mealRow} onPress={() => removeMeal(meal.id)}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealCalories}>{meal.calories} קל'  ✕</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>הוסף מאכל</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="חפש מאכל..."
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>הכל</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.foodList}>
            {filteredFoods.map(food => (
              <TouchableOpacity key={food.name} style={styles.foodButton} onPress={() => addMeal(food)}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodCalories}>{food.calories} קל'</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={styles.calendarCard}>
            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS_HE[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dayHeaders}>
              {DAYS_HE.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, i) => {
                if (!day) return <View key={`empty-${i}`} style={styles.calendarCell} />;
                const dateKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const color = getDayColor(dateKey);
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === toDateKey(today);
                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                    onPress={() => { setSelectedDate(dateKey); setTab('today'); }}
                  >
                    <Text style={[styles.calendarDayNum, isToday && styles.todayText, isSelected && styles.selectedDayText]}>
                      {day}
                    </Text>
                    {color && <View style={[styles.calendarDot, { backgroundColor: color }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>80–100% מהיעד</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#FFA726' }]} />
              <Text style={styles.legendText}>מתחת ל-80%</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#e53935' }]} />
              <Text style={styles.legendText}>חריגה מהיעד</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  tabText: { color: '#888', fontSize: 15 },
  tabTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateText: { textAlign: 'center', color: '#888', marginBottom: 12, fontSize: 13 },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  calorieStat: { alignItems: 'center' },
  calorieNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  calorieLabel: { color: '#888', marginTop: 4 },
  overGoal: { color: '#e53935' },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  progressOver: { backgroundColor: '#e53935' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginHorizontal: 16, marginTop: 12, marginBottom: 8, textAlign: 'right' },
  mealRow: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 6, padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  mealName: { fontSize: 15, color: '#333' },
  mealCalories: { fontSize: 15, color: '#4CAF50', fontWeight: 'bold' },
  searchInput: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: 10, fontSize: 15, elevation: 1 },
  categoriesRow: { paddingHorizontal: 12, marginBottom: 10 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', marginHorizontal: 4, borderWidth: 1, borderColor: '#ddd' },
  categoryChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  categoryText: { color: '#555', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  foodList: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, paddingBottom: 30 },
  foodButton: { backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', width: '30%', elevation: 1 },
  foodName: { fontSize: 12, color: '#333', textAlign: 'center' },
  foodCalories: { fontSize: 12, color: '#4CAF50', marginTop: 4 },
  calendarCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, elevation: 2 },
  calendarNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navArrow: { fontSize: 28, color: '#4CAF50', paddingHorizontal: 8 },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', color: '#888', fontSize: 13, fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calendarCellSelected: { backgroundColor: '#e8f5e9' },
  calendarDayNum: { fontSize: 14, color: '#333' },
  todayText: { color: '#4CAF50', fontWeight: 'bold' },
  selectedDayText: { fontWeight: 'bold' },
  calendarDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  legend: { marginHorizontal: 16, marginBottom: 30 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 8 },
  legendText: { color: '#555', fontSize: 13 },
});
