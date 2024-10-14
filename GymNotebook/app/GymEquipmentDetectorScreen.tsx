import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

interface PastDetection {
  id: string;
  equipmentName: string;
  detectionDate: string;
  imageUri: string;
}

const GymEquipmentDetectorScreen: React.FC = () => {
  const [pastDetections, setPastDetections] = useState<PastDetection[]>([
    {
      id: '1',
      equipmentName: 'Dumbbell',
      detectionDate: '2024-09-10',
      imageUri: 'https://example.com/dumbbell.jpg',
    },
    {
      id: '2',
      equipmentName: 'Treadmill',
      detectionDate: '2024-09-15',
      imageUri: 'https://example.com/treadmill.jpg',
    },
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleOpenLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleDetection = () => {
    console.log('Detecting equipment from image:', selectedImage);
    setModalVisible(false);
  };

  const renderPastDetectionItem = ({ item }: { item: PastDetection }) => (
    <View style={styles.pastDetectionItem}>
      <Image source={{ uri: item.imageUri }} style={styles.detectionImage} />
      <View style={styles.detectionInfo}>
        <Text style={styles.equipmentName}>{item.equipmentName}</Text>
        <Text style={styles.detectionDate}>{item.detectionDate}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient colors={['#3498db', '#2ecc71']} style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Gym Equipment Detector</Text>
          <Text style={styles.headerSubtitle}>Detect Equipment or Review Past Detections</Text>
        </LinearGradient>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={handleOpenCamera}>
            <LinearGradient colors={['#2980b9', '#27ae60']} style={styles.optionGradient}>
              <MaterialIcons name="camera-alt" size={32} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>Take a Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleOpenLibrary}>
            <LinearGradient colors={['#2980b9', '#27ae60']} style={styles.optionGradient}>
              <MaterialIcons name="photo-library" size={32} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>Choose from Library</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Past Detections</Text>
        <ScrollView horizontal contentContainerStyle={styles.pastDetectionsList} showsHorizontalScrollIndicator={false}>
          {pastDetections.map(detection => (
            <View key={detection.id} style={styles.pastDetectionItemWrapper}>
              {renderPastDetectionItem({ item: detection })}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Detection</Text>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} />}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleDetection}>
                <Text style={styles.modalButtonText}>Detect Equipment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#333333',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 10,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: Dimensions.get('window').width / 2.5,
  },
  optionGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonIcon: {
    marginBottom: 10,
  },
  optionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 20,
    marginVertical: 10,
  },
  pastDetectionsList: {
    paddingHorizontal: 20,
  },
  pastDetectionItemWrapper: {
    marginRight: 15,
  },
  pastDetectionItem: {
    backgroundColor: '#4C4C4C',
    borderRadius: 16,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  detectionImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
  },
  detectionInfo: {
    marginTop: 10,
  },
  equipmentName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  detectionDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#2980b9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default GymEquipmentDetectorScreen;