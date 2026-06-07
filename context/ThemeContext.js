import React, { createContext, useContext, useReducer } from 'react';

export const lightTheme = {
  isDark: false,
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#222222',
  subtext: '#666666',
  placeholder: '#AAAAAA',
  primary: '#E53935',
  primaryDark: '#B71C1C',
  header: '#E53935',
  headerText: '#FFFFFF',
  chip: '#FFFFFF',
  chipSelected: '#E53935',
  chipText: '#555555',
  chipTextSelected: '#FFFFFF',
  border: '#E0E0E0',
  shadow: '#000000',
  inputBg: '#FFFFFF',
  stepCircle: '#E53935',
  badgeArea: '#1565C0',
};

export const darkTheme = {
  isDark: true,
  background: '#121212',
  card: '#1E1E1E',
  text: '#F0F0F0',
  subtext: '#AAAAAA',
  placeholder: '#777777',
  primary: '#EF5350',
  primaryDark: '#B71C1C',
  header: '#1A1A1A',
  headerText: '#F0F0F0',
  chip: '#2A2A2A',
  chipSelected: '#EF5350',
  chipText: '#CCCCCC',
  chipTextSelected: '#FFFFFF',
  border: '#333333',
  shadow: '#000000',
  inputBg: '#2A2A2A',
  stepCircle: '#EF5350',
  badgeArea: '#1565C0',
};

function themeReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return state.isDark ? lightTheme : darkTheme;
    default:
      return state;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, dispatch] = useReducer(themeReducer, lightTheme);

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}