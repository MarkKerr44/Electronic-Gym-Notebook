import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const PoseEstimatorScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [loadingCamera, setLoadingCamera] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('squats');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera permission not granted', 'Please update your settings to use the camera.');
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
      setLoadingCamera(false);
    })();
  }, []);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const renderCameraView = () => {
    if (loadingCamera) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera access not granted. Please enable it in settings.
          </Text>
        </View>
      );
    }
    return (
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayHeaderText}>Live Posture Analysis</Text>
            <View style={styles.statusIndicatorGreen}>
              <MaterialIcons name="check-circle" size={24} color="#27ae60" />
            </View>
          </View>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraFacing}>
            <Text style={styles.toggleText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Pose Estimator</Text>
        <Text style={styles.headerSubtitle}>
          Select an exercise and track your posture in real time
        </Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Exercise:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedExercise}
                onValueChange={(itemValue) => setSelectedExercise(itemValue)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="Squats" value="squats" />
                <Picker.Item label="Bench Press" value="bench_press" />
              </Picker>
            </View>
          </View>
          <View style={styles.cameraContainer}>{renderCameraView()}</View>
        </View>
      </ScrollView>
      <BottomNavBar index={index} setIndex={setIndex} />
    </SafeAreaView>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#333333' },
  headerContainer: { paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' },
  headerTitle: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 18, color: '#FFD700', marginTop: 10 },
  scrollContainer: { flexGrow: 1, paddingBottom: 80 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  dropdownContainer: { marginBottom: 20 },
  dropdownLabel: { fontSize: 18, color: '#FFFFFF', marginBottom: 10, fontWeight: 'bold' },
  pickerWrapper: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  picker: { color: '#FFFFFF', height: 50 },
  cameraContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  camera: { width: '100%', height: height * 0.5, justifyContent: 'space-between' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  overlayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overlayHeaderText: { fontSize: 20, color: '#ffffff', fontWeight: 'bold' },
  statusIndicatorGreen: { backgroundColor: 'rgba(39, 174, 96, 0.2)', borderRadius: 20, padding: 5 },
  toggleButton: { backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 10, alignItems: 'center' },
  toggleText: { color: '#000', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
});

export default PoseEstimatorScreen;
