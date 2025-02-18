import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeProvider';

export default function AppearanceScreen() {
  const navigation = useNavigation();
  const { theme, setTheme } = useContext(ThemeContext);
  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          gradient: ['#ffffff', '#f2f2f2'],
          textColor: '#000000',
        };
      case 'dark':
        return {
          gradient: ['#000000', '#333333'],
          textColor: '#ffffff',
        };
      case 'purple':
      default:
        return {
          gradient: ['#0f0c29', '#302b63', '#24243e'],
          textColor: '#ffffff',
        };
    }
  };

  const { gradient, textColor } = getThemeColors();

  const boxBackgroundColor =
    theme === 'light'
      ? 'rgba(0, 0, 0, 0.05)' 
      : 'rgba(255, 255, 255, 0.1)'; 

  const boxBorderColor =
    theme === 'light'
      ? '#aaa' 
      : 'transparent'; 


  const buttonBackgroundColor =
    theme === 'light'
      ? 'rgba(0,0,0,0.05)'
      : 'rgba(255,255,255,0.2)';

  return (
    <LinearGradient colors={gradient} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Appearance
            </Text>
          </View>

          <View
            style={[
              styles.section,
              {
                backgroundColor: boxBackgroundColor,
                borderColor: boxBorderColor,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Current Theme: {theme}
            </Text>

            <TouchableOpacity
              style={[styles.themeButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => setTheme('light')}
            >
              <Text style={{ color: textColor }}>Light Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => setTheme('dark')}
            >
              <Text style={{ color: textColor }}>Dark Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => setTheme('purple')}
            >
              <Text style={{ color: textColor }}>Purple Mode</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  section: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1, 
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  themeButton: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
});
