import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';

const DAILY_GOAL = 2000;

const FOOD_DB = [
  // פירות
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

  // ירקות
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

  // לחם ופחמימות
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

  // חלב וגבינות
  { name: 'חלב 200ml', calories: 100, category: 'חלב וגבינות' },
  { name: 'יוגורט 150g', calories: 90, category: 'חלב וגבינות' },
  { name: 'יוגורט 0% 150g', calories: 60, category: 'חלב וגבינות' },
  { name: 'גבינה לבנה 5% 100g', calories: 90, category: 'חלב וגבינות' },
  { name: 'גבינה צהובה פרוסה', calories: 80, category: 'חלב וגבינות' },
  { name: 'קוטג׳ 200g', calories: 140, category: 'חלב וגבינות' },
  { name: 'שמנת חמוצה 15% כף', calories: 30, category: 'חלב וגבינות' },
  { name: 'גבינת בולגרית 30g', calories: 75, category: 'חלב וגבינות' },
  { name: 'ריקוטה 100g', calories: 130, category: 'חלב וגבינות' },

  // ביצים
  { name: 'ביצה קשה', calories: 70, category: 'ביצים' },
  { name: 'ביצה מטוגנת', calories: 90, category: 'ביצים' },
  { name: 'חביתה (2 ביצים)', calories: 180, category: 'ביצים' },
  { name: 'שקשוקה מנה', calories: 250, category: 'ביצים' },

  // בשר ועוף
  { name: 'חזה עוף 100g', calories: 165, category: 'בשר ועוף' },
  { name: 'שוק עוף 100g', calories: 215, category: 'בשר ועוף' },
  { name: 'המבורגר בקר 100g', calories: 250, category: 'בשר ועוף' },
  { name: 'סטייק בקר 100g', calories: 270, category: 'בשר ועוף' },
  { name: 'קציצות עוף (2)', calories: 200, category: 'בשר ועוף' },
  { name: 'שניצל עוף', calories: 280, category: 'בשר ועוף' },
  { name: 'נקניקיות (2)', calories: 180, category: 'בשר ועוף' },
  { name: 'טונה בפחית 100g', calories: 100, category: 'בשר ועוף' },
  { name: 'סלמון 100g', calories: 208, category: 'בשר ועוף' },

  // קטניות
  { name: 'חומוס מבושל 100g', calories: 164, category: 'קטניות' },
  { name: 'עדשים מבושלות 100g', calories: 116, category: 'קטניות' },
  { name: 'שעועית מבושלת 100g', calories: 127, category: 'קטניות' },
  { name: 'טופו 100g', calories: 76, category: 'קטניות' },
  { name: 'ממרח חומוס כף', calories: 50, category: 'קטניות' },

  // שומנים
  { name: 'שמן זית כף', calories: 120, category: 'שומנים' },
  { name: 'חמאה כף', calories: 100, category: 'שומנים' },
  { name: 'אבוקדו חצי', calories: 160, category: 'שומנים' },
  { name: 'טחינה גולמית כף', calories: 90, category: 'שומנים' },
  { name: 'שקדים 10 יח׳', calories: 70, category: 'שומנים' },
  { name: 'אגוזי מלך 5 יח׳', calories: 130, category: 'שומנים' },
  { name: 'בוטנים 30g', calories: 170, category: 'שומנים' },

  // חטיפים ומתוקים
  { name: 'שוקולד מריר 20g', calories: 110, category: 'חטיפים' },
  { name: 'שוקולד חלב 20g', calories: 105, category: 'חטיפים' },
  { name: 'ביסקוויט (2)', calories: 100, category: 'חטיפים' },
  { name: 'עוגיית אוריאו (2)', calories: 106, category: 'חטיפים' },
  { name: 'צ׳יפס 30g', calories: 160, category: 'חטיפים' },
  { name: 'פופקורן 30g', calories: 110, category: 'חטיפים' },
  { name: 'גלידת וניל כדור', calories: 130, category: 'חטיפים' },
  { name: 'עוגה פרוסה', calories: 280, category: 'חטיפים' },
  { name: 'דונאט', calories: 250, category: 'חטיפים' },

  // שתייה
  { name: 'קפה שחור', calories: 5, category: 'שתייה' },
  { name: 'קפה עם חלב', calories: 50, category: 'שתייה' },
  { name: 'לאטה', calories: 150, category: 'שתייה' },
  { name: 'מיץ תפוזים 200ml', calories: 90, category: 'שתייה' },
  { name: 'קולה 330ml', calories: 140, category: 'שתייה' },
  { name: 'קולה זירו 330ml', calories: 1, category: 'שתייה' },
  { name: 'בירה 330ml', calories: 150, category: 'שתייה' },
  { name: 'מיץ ענבים 200ml', calories: 130, category: 'שתייה' },

  // ארוחות מוכנות
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

export default function App() {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remaining = DAILY_GOAL - totalCalories;
  const progress = Math.min(totalCalories / DAILY_GOAL, 1);

  const filteredFoods = FOOD_DB.filter(food => {
    const matchSearch = food.name.includes(search);
    const matchCategory = !selectedCategory || food.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  function addMeal(food) {
    setMeals([...meals, { ...food, id: Date.now() }]);
  }

  function removeMeal(id) {
    setMeals(meals.filter(m => m.id !== id));
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>מעקב קלוריות</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('he-IL')}</Text>
      </View>

      <View style={styles.summaryCard}>
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

      {meals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>ארוחות היום</Text>
          {meals.map((meal) => (
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
        {filteredFoods.map((food) => (
          <TouchableOpacity key={food.name} style={styles.foodButton} onPress={() => addMeal(food)}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCalories}>{food.calories} קל'</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#4CAF50',
    padding: 50,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  date: { color: '#c8e6c9', marginTop: 4 },
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
  calorieRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  calorieStat: { alignItems: 'center' },
  calorieNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  calorieLabel: { color: '#888', marginTop: 4 },
  overGoal: { color: '#e53935' },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  progressOver: { backgroundColor: '#e53935' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'right',
  },
  mealRow: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealName: { fontSize: 15, color: '#333' },
  mealCalories: { fontSize: 15, color: '#4CAF50', fontWeight: 'bold' },
  searchInput: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoriesRow: { paddingHorizontal: 12, marginBottom: 10 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  categoryText: { color: '#555', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 30,
  },
  foodButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodName: { fontSize: 12, color: '#333', textAlign: 'center' },
  foodCalories: { fontSize: 12, color: '#4CAF50', marginTop: 4 },
});
