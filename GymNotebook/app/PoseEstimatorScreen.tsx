import React, { useState, useEffect, useCallback } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'react-native-vision-camera';
import { MediaPipeCamera, PipelineType } from 'react-native-mediapipe';
import BottomNavBar from '../components/BottomNavBar';

const { height } = Dimensions.get('window');

export default function PoseEstimatorScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [loadingCamera, setLoadingCamera] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('squats');
  const [index, setIndex] = useState(0);
  const [postureColor, setPostureColor] = useState('#27ae60');

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      if (cameraPermission !== 'authorized') {
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

  // Simple helper for angle between three points A-B-C (angle at B)
  function angleBetweenPoints(A: any, B: any, C: any) {
    const BAx = A.x - B.x;
    const BAy = A.y - B.y;
    const BCx = C.x - B.x;
    const BCy = C.y - B.y;
    const dot = BAx * BCx + BAy * BCy;
    const magA = Math.sqrt(BAx * BAx + BAy * BAy);
    const magC = Math.sqrt(BCx * BCx + BCy * BCy);
    if (magA === 0 || magC === 0) return 0;
    const cosineAngle = dot / (magA * magC);
    let angleDeg = Math.acos(Math.min(Math.max(cosineAngle, -1), 1));
    angleDeg = (angleDeg * 180.0) / Math.PI;
    return angleDeg;
  }

  // Example posture check for squats (very rough demonstration)
  function checkSquatPose(landmarks: any[]) {
    // Some common indices in MediaPipe:
    // 24: leftHip, 26: leftKnee, 28: leftAnkle
    // 23: rightHip, 25: rightKnee, 27: rightAnkle
    // We'll just do a super simple left-knee angle check here for demonstration
    const leftHip = landmarks[24];
    const leftKnee = landmarks[26];
    const leftAnkle = landmarks[28];
    if (!leftHip || !leftKnee || !leftAnkle) return '#27ae60'; // default color

    // angle at the knee
    const kneeAngle = angleBetweenPoints(leftHip, leftKnee, leftAnkle);
    // As an example, we assume "ideal" squat angle is around 90–110 degrees at the knee
    if (kneeAngle < 80 || kneeAngle > 120) {
      return '#e74c3c'; // red
    }
    return '#27ae60'; // green
  }

  const onPoseResults = useCallback((results: any) => {
    // results.poseLandmarks will contain array of 33 landmarks
    // We'll do a different check if bench press is selected
    if (!results?.poseLandmarks) return;

    if (selectedExercise === 'squats') {
      const color = checkSquatPose(results.poseLandmarks);
      setPostureColor(color);
    } else if (selectedExercise === 'bench_press') {
      // Placeholder for bench press logic
      // We might want to check elbow angles, back arch, etc.
      // For now, just set it green to show it's recognized
      setPostureColor('#27ae60');
    }
  }, [selectedExercise]);

  const renderMediaPipeCamera = () => {
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
      <MediaPipeCamera
        style={styles.camera}
        cameraType={facing} // 'front' or 'back'
        pipeline={PipelineType.POSE}
        onResults={onPoseResults}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayHeaderText}>Live Posture Analysis</Text>
            <View style={[styles.statusIndicator, { backgroundColor: postureColor }]}>
              <MaterialIcons
                name={postureColor === '#e74c3c' ? 'error' : 'check-circle'}
                size={24}
                color={postureColor === '#e74c3c' ? '#e74c3c' : '#27ae60'}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraFacing}>
            <Text style={styles.toggleText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </MediaPipeCamera>
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

          <View style={styles.cameraContainer}>{renderMediaPipeCamera()}</View>
        </View>
      </ScrollView>

      <BottomNavBar index={index} setIndex={setIndex} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#333333',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: height * 0.5,
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayHeaderText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statusIndicator: {
    borderRadius: 20,
    padding: 5,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
