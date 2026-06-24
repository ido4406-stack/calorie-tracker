import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUser() {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

export async function saveUser(user) {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

export async function getMealsByDay() {
  const data = await AsyncStorage.getItem('mealsByDay');
  return data ? JSON.parse(data) : {};
}

export async function saveMealsByDay(meals) {
  await AsyncStorage.setItem('mealsByDay', JSON.stringify(meals));
}
