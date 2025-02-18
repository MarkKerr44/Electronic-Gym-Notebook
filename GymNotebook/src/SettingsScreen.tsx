// SettingsScreen.tsx

import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { ThemeContext } from '../context/ThemeProvider';
import { getThemeColors } from '../context/themeHelpers';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const { theme } = useContext(ThemeContext);
  const { gradient, textColor, boxBackground, accent } = getThemeColors(theme);
  

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('OpeningScreen');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
        Alert.alert('Error', 'An error occurred while signing out. Please try again.');
      });
  };

  return (
    <LinearGradient colors={gradient} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
            </View>

            <View style={styles.optionContainer}>
              <TouchableOpacity style={[styles.option, { backgroundColor: boxBackground }]}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="account-circle" size={24} color={textColor} />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.option, { backgroundColor: boxBackground }]}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="notifications" size={24} color={textColor} />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: boxBackground }]}
                onPress={() => navigation.navigate('AppearanceScreen')}
              >
                <View style={styles.optionIcon}>
                  <MaterialIcons name="palette" size={24} color={textColor} />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>Appearance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.option, { backgroundColor: boxBackground }]}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="security" size={24} color={textColor} />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>Privacy & Security</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: accent }]}
              onPress={handleSignOut}
            >
              <Text style={[styles.logoutButtonText, { color: '#ffffff' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  optionContainer: {
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
