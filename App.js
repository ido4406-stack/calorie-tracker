import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

const DAILY_GOAL = 2000;

const QUICK_FOODS = [
  { name: 'בננה', calories: 90 },
  { name: 'ביצה', calories: 70 },
  { name: 'פרוסת לחם', calories: 80 },
  { name: 'חזה עוף 100g', calories: 165 },
  { name: 'אורז מבושל 100g', calories: 130 },
  { name: 'תפוח', calories: 80 },
];

export default function App() {
  const [meals, setMeals] = useState([]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remaining = DAILY_GOAL - totalCalories;
  const progress = Math.min(totalCalories / DAILY_GOAL, 1);

  function addMeal(food) {
    setMeals([...meals, { ...food, id: Date.now() }]);
  }

  function resetDay() {
    setMeals([]);
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

      <Text style={styles.sectionTitle}>הוסף ארוחה מהירה</Text>
      <View style={styles.quickFoods}>
        {QUICK_FOODS.map((food) => (
          <TouchableOpacity key={food.name} style={styles.foodButton} onPress={() => addMeal(food)}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCalories}>{food.calories} קל'</Text>
          </TouchableOpacity>
        ))}
      </View>

      {meals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>ארוחות היום</Text>
          {meals.map((meal) => (
            <View key={meal.id} style={styles.mealRow}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealCalories}>{meal.calories} קל'</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.resetButton} onPress={resetDay}>
            <Text style={styles.resetText}>אפס יום</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 50,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: '#c8e6c9',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieLabel: {
    color: '#888',
    marginTop: 4,
  },
  overGoal: {
    color: '#e53935',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressOver: {
    backgroundColor: '#e53935',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'right',
  },
  quickFoods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  foodButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  foodName: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  foodCalories: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  mealRow: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealName: {
    fontSize: 15,
    color: '#333',
  },
  mealCalories: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resetButton: {
    margin: 16,
    padding: 14,
    backgroundColor: '#ffebee',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
});
