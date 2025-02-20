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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isMetric, setIsMetric] = useState(true);
  const [showBMI, setShowBMI] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await AsyncStorage.getItem('userProfile');
      if (data) {
        const parsed = JSON.parse(data);
        setAge(parsed.age || '');
        setSex(parsed.sex || '');
        setWeight(parsed.weight || '');
        setHeight(parsed.height || '');
        setIsMetric(parsed.isMetric !== undefined ? parsed.isMetric : true);
      }
    } catch (error) {}
  }

  function validateForm() {
    if (!age || !sex || !weight || !height) {
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
        JSON.stringify({ age, sex, weight, height, isMetric })
      );
      Alert.alert('Saved', 'Your profile has been saved.');
    } catch (error) {
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

  function handleToggleUnits(newValue) {
    if (newValue !== isMetric) {
      if (newValue === false) {
        if (weight !== '') {
          const weightNum = parseFloat(weight);
          const convertedWeight = weightNum * 2.20462;
          setWeight(convertedWeight.toFixed(1));
        }
        if (height !== '') {
          const heightNum = parseFloat(height);
          const convertedHeight = heightNum * 0.393701;
          setHeight(convertedHeight.toFixed(1));
        }
      } else {
        if (weight !== '') {
          const weightNum = parseFloat(weight);
          const convertedWeight = weightNum * 0.453592;
          setWeight(convertedWeight.toFixed(1));
        }
        if (height !== '') {
          const heightNum = parseFloat(height);
          const convertedHeight = heightNum * 2.54;
          setHeight(convertedHeight.toFixed(1));
        }
      }
      setIsMetric(newValue);
    }
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.pageTitle}>User Profile</Text>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
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
              <Text style={styles.label}>Sex (assigned at birth)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sex}
                  onValueChange={(itemValue) => setSex(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#ffffff"
                >
                  <Picker.Item label="Select sex" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Use Metric Units</Text>
              <Switch value={isMetric} onValueChange={handleToggleUnits} />
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
            <TouchableOpacity onPress={() => setShowBMI(!showBMI)} style={styles.bmiBox}>
              <Text style={styles.bmiText}>{showBMI ? `BMI: ${calculateBMI()}` : 'Show BMI'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardScreen')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  pageTitle: { fontSize: 28, color: '#ffffff', fontWeight: 'bold', marginBottom: 20 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  sectionTitle: { fontSize: 20, color: '#ffffff', fontWeight: 'bold', marginBottom: 15 },
  formGroup: { marginBottom: 15 },
  label: { color: '#ffffff', fontSize: 16, marginBottom: 5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  pickerContainer: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  picker: { color: '#ffffff' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  metricLabel: { color: '#ffffff', fontSize: 16 },
  bmiBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  bmiText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  saveButton: {
    width: '100%',
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  backButton: {
    backgroundColor: '#302b63',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
