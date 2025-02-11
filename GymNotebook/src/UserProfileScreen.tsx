// UserProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isMetric, setIsMetric] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await AsyncStorage.getItem('userProfile');
      if (data) {
        const parsed = JSON.parse(data);
        setAge(parsed.age || '');
        setGender(parsed.gender || '');
        setWeight(parsed.weight || '');
        setHeight(parsed.height || '');
        setIsMetric(parsed.isMetric !== undefined ? parsed.isMetric : true);
      }
    } catch {}
  }

  function validateForm() {
    if (!age || !gender || !weight || !height) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return false;
    }
    if (parseInt(age) < 13 || parseInt(age) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 13 and 120.');
      return false;
    }
    if (parseFloat(weight) <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return false;
    }
    if (parseFloat(height) <= 0) {
      Alert.alert('Invalid Height', 'Please enter a valid height.');
      return false;
    }
    return true;
  }

  async function handleSaveProfile() {
    if (!validateForm()) return;
    try {
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({
          age,
          gender,
          weight,
          height,
          isMetric,
        })
      );
      Alert.alert('Saved', 'Your profile has been saved.');
    } catch {
      Alert.alert('Error', 'Failed to save profile.');
    }
  }

  function calculateBMI() {
    if (!weight || !height) return '';
    const w = isMetric ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const h = isMetric ? parseFloat(height) / 100 : parseFloat(height) * 0.0254;
    const bmi = w / (h * h);
    return bmi ? bmi.toFixed(1) : '';
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardScreen')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender (assigned at birth)</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="E.g. Male / Female"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Use Metric Units</Text>
            <Switch value={isMetric} onValueChange={setIsMetric} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{isMetric ? 'Weight (kg)' : 'Weight (lbs)'}</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder={`Enter weight in ${isMetric ? 'kg' : 'lbs'}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{isMetric ? 'Height (cm)' : 'Height (in)'}</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder={`Enter height in ${isMetric ? 'cm' : 'inches'}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          {calculateBMI() !== '' && (
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiText}>BMI: {calculateBMI()}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FF5F6D',
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  toggleLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  bmiContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  bmiText: {
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

