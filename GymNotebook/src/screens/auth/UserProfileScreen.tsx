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
  Modal,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { userService } from '../../services/userService';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isMetric, setIsMetric] = useState(true);
  const [showBMI, setShowBMI] = useState(false);
  const [sexModalVisible, setSexModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      const profile = await userService.getUserProfile();
      if (profile) {
        setAge(profile.age);
        setSex(profile.sex);
        setWeight(profile.weight);
        setHeight(profile.height);
        setIsMetric(profile.isMetric);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }

  function validateForm() {
    if (!age || !sex || !weight || !height) {
      setError('Please fill in all fields.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSaveProfile() {
    if (!validateForm()) return;
    
    try {
      await userService.saveUserProfile({
        age,
        sex,
        weight,
        height,
        isMetric
      });
      setSuccessMessage('Your profile has been saved');
      setError('');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
      setSuccessMessage('');
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

  const handleMetricToggle = (value: boolean) => {
    setIsMetric(value);
    if (value) {
      setWeight(String(Math.round(Number(weight) / 2.20462)));
      setHeight(String(Math.round(Number(height) * 2.54)));
    } else {
      setWeight(String(Math.round(Number(weight) * 2.20462)));
      setHeight(String(Math.round(Number(height) / 2.54)));
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>User Profile</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  testID="age-input"
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
                <TouchableOpacity style={styles.input} onPress={() => setSexModalVisible(true)}>
                  <Text style={[styles.inputText, { color: sex ? '#ffffff' : '#999' }]}>
                    {sex ? (sex === 'male' ? 'Male' : 'Female') : 'Select sex'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Body Measurements</Text>
              <View style={styles.metricRow}>
                <Text style={styles.label}>Use Metric Units</Text>
                <Switch
                  testID="metric-switch"
                  value={isMetric}
                  onValueChange={handleMetricToggle}
                  accessibilityLabel="Use Metric Units"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{isMetric ? 'Weight (kg)' : 'Weight (lbs)'}</Text>
                <TextInput
                  testID="weight-value"
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
                  testID="height-value"
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
              <View>
                <Text>Use Metric Units</Text>
                <Switch
                  accessibilityRole="switch"
                  value={isMetric}
                  onValueChange={setIsMetric}
                />
              </View>
              <View>
                <Text>Weight ({isMetric ? 'kg' : 'lbs'})</Text>
                <Text>{isMetric ? `${weight} kg` : `${Math.round(Number(weight) * 2.20462)} lbs`}</Text>
              </View>
              <View>
                <Text>Height ({isMetric ? 'cm' : 'in'})</Text>
                <Text>{isMetric ? `${height} cm` : `${Math.round(Number(height) / 2.54)} in`}</Text>
              </View>
            </View>
            {error ? (
              <Text testID="error-message" style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            {successMessage ? (
              <Text testID="success-message" style={styles.successText}>
                {successMessage}
              </Text>
            ) : null}

            <TouchableOpacity 
              testID="save-button"
              onPress={handleSaveProfile}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
      <Modal transparent visible={sexModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sex</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setSex('male'); setSexModalVisible(false); }}>
              <Text style={styles.modalOptionText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setSex('female'); setSexModalVisible(false); }}>
              <Text style={styles.modalOptionText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonModal} onPress={() => setSexModalVisible(false)}>
              <Text style={styles.cancelButtonModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { padding: 20, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerBackButton: { padding: 10 },
  headerTitle: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
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
  inputText: { fontSize: 16, color: '#ffffff' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#302b63',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 22, color: '#FFC371', marginBottom: 20, fontWeight: 'bold' },
  modalOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: { color: '#ffffff', fontSize: 16 },
  cancelButtonModal: {
    marginTop: 10,
    backgroundColor: '#FF5F6D',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonModalText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
});

