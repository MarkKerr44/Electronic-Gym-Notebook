// SettingsScreen.tsx

import React from 'react';
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

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

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
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.optionContainer}>
              <TouchableOpacity style={styles.option}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="account-circle" size={24} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="notifications" size={24} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="palette" size={24} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Appearance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="security" size={24} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Privacy & Security</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
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
    color: '#ffffff',
    fontWeight: 'bold',
  },
  optionContainer: {
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#FF5F6D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
