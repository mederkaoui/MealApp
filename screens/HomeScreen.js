import React, { useEffect, useReducer, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const initialState = {
  categories: [],
  selectedCategory: '',
  meals: [],
  loading: false,
  searchText: '',
  searchResults: null, // null = not searched yet
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        selectedCategory: action.payload[0]?.strCategory || '',
      };
    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        meals: [],
        searchResults: null,
        searchText: '',
        loading: true,
      };
    case 'SET_MEALS':
      return { ...state, meals: action.payload, loading: false };
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, searchText: '', searchResults: null };
    default:
      return state;
  }
}

export default function HomeScreen({ navigation }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef(null);

  const { categories, selectedCategory, meals, loading, searchText, searchResults } = state;

  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'SET_CATEGORIES', payload: data.categories || [] }))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'SET_MEALS', payload: data.meals || [] }))
      .catch((err) => console.error(err));
  }, [selectedCategory]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchText.trim()}`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'SET_SEARCH_RESULTS', payload: data.meals || [] }))
      .catch((err) => console.error(err));
  };

  const handleClearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
    searchRef.current?.focus();
  };

  const displayedMeals = searchResults !== null ? searchResults : meals;

  const renderCategory = ({ item }) => {
    const isSelected = item.strCategory === selectedCategory;
    return (
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={() => dispatch({ type: 'SELECT_CATEGORY', payload: item.strCategory })}
      >
        <Image source={{ uri: item.strCategoryThumb }} style={styles.categoryImage} />
        <Text style={[styles.categoryName, { color: isSelected ? '#fff' : theme.text }, isSelected && styles.categoryNameSelected]}>
          {item.strCategory}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMeal = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: item.idMeal })}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
      <Text style={styles.mealName} numberOfLines={2}>
        {item.strMeal}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Categories</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={styles.themeIcon}>{theme.isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.length === 0 ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.idCategory}
            renderItem={renderCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        )}
      </View>

      <View style={[styles.searchRow, { backgroundColor: theme.card }]}>
        <TextInput
          ref={searchRef}
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un plat..."
          placeholderTextColor={theme.placeholder}
          value={searchText}
          onChangeText={(t) => dispatch({ type: 'SET_SEARCH_TEXT', payload: t })}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchResults !== null ? (
          <TouchableOpacity onPress={handleClearSearch}>
            <Text style={styles.searchIcon}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchResults !== null ? (
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Résultats ({displayedMeals.length})
        </Text>
      ) : (
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Plats de la catégorie: {selectedCategory}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : displayedMeals.length === 0 && searchResults !== null ? (
        <Text style={[styles.emptyText, { color: theme.placeholder }]}>Aucun résultat trouvé.</Text>
      ) : (
        <FlatList
          data={displayedMeals}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderMeal}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.mealsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  themeIcon: {
    fontSize: 22,
  },
  categoriesContainer: {
    height: 100,
    justifyContent: 'center',
  },
  categoriesList: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 10,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 12,
    backgroundColor: '#cdcdcd',
    width: 82,
    height: 82,
  },
  categoryCardSelected: {
    backgroundColor: '#e53935',
  },
  categoryImage: {
    width: 58,
    height: 58,
    borderRadius: 8,
  },
  categoryName: {
    marginTop: 20,
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  categoryNameSelected: {
    color: '#e53935',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14,
  },
  searchIcon: {
    fontSize: 16,
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  mealsList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mealCard: {
    width: '48%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealImage: {
    width: '100%',
    height: 130,
  },
  mealName: {
    padding: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});