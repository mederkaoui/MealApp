import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function MealDetailScreen({ route, navigation }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.meals && data.meals.length > 0) {
          setMeal(data.meals[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [mealId]);

  const getIngredients = (m) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const name = m[`strIngredient${i}`];
      const qty  = m[`strMeasure${i}`];
      if (name && name.trim()) {
        list.push({ name: name.trim(), qty: qty ? qty.trim() : '' });
      }
    }
    return list;
  };

  const getSteps = (text) => {
    if (!text) return [];
    return text
      .split(/\r\n|\r|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Plat introuvable.</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>{'< Go back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = getIngredients(meal);
  const steps = getSteps(meal.strInstructions);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>{'< Go back'}</Text>
        </TouchableOpacity>

        <Image source={{ uri: meal.strMealThumb }} style={styles.mealImage} />

        <Text style={[styles.mealTitle, { color: theme.text }]}>{meal.strMeal}</Text>

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Ingredients</Text>

        {ingredients.map((item, index) => (
          <View key={index} style={[styles.ingredientRow, { borderBottomColor: theme.isDark ? '#333' : '#eee' }]}>
            <Text style={[styles.bullet, { color: theme.text }]}>•</Text>
            <Text style={[styles.ingredientName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.ingredientQty, { color: theme.placeholder }]}>{item.qty}</Text>
          </View>
        ))}

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Instructions</Text>

        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
          </View>
        ))}

        {/* Bottom go back button */}
        <TouchableOpacity style={[styles.goBackBtn, styles.bottomBtn]} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>{'< Go back'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  goBackBtn: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  goBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  mealImage: {
    width: '100%',
    height: 240,
    marginTop: 10,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  bullet: {
    fontSize: 18,
    marginRight: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
  },
  ingredientQty: {
    fontSize: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBtn: {
    alignSelf: 'center',
    marginVertical: 24,
  },
});