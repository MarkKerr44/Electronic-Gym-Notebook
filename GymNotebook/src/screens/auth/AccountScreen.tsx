import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  updatePassword,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../../firebase/firebaseConfig';

type RootStackParamList = {
  OpeningScreen: undefined;
  DashboardScreen: undefined;
  ActivityLogScreen: undefined;
  LinkAccountScreen: undefined;
  AccountScreen: undefined;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000;
const SESSION_TIMEOUT = 5 * 60 * 1000;

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [reauthPasswordVisible, setReauthPasswordVisible] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthAction, setReauthAction] = useState<'passwordChange' | 'deleteAccount' | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);


  const verifyCurrentPassword = async () => {
    resetSessionTimeout();
    if (!user?.email) return;
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      setIsPasswordVerified(true);
      Alert.alert('Success', 'Password verified. You can now set a new password.');
    } catch (error) {
      Alert.alert('Error', 'Current password is incorrect.');
      setCurrentPassword('');
    }
  };

  const resetSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    sessionTimeoutRef.current = setTimeout(() => {
      if (auth.currentUser) {
        signOut(auth);
        Alert.alert('Session Timed Out', 'You have been logged out due to inactivity.');
        navigation.replace('OpeningScreen');
      }
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedAttemptCount = await AsyncStorage.getItem('reauthAttemptCount');
        const storedLockoutEndTime = await AsyncStorage.getItem('lockoutEndTime');
        if (storedAttemptCount !== null) {
          setAttemptCount(parseInt(storedAttemptCount, 10));
        }
        if (storedLockoutEndTime !== null) {
          setLockoutEndTime(parseInt(storedLockoutEndTime, 10));
        }
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('reauthAttemptCount', attemptCount.toString());
    if (lockoutEndTime !== null) {
      AsyncStorage.setItem('lockoutEndTime', lockoutEndTime.toString());
    } else {
      AsyncStorage.removeItem('lockoutEndTime');
    }
  }, [attemptCount, lockoutEndTime]);

  const isLockedOut = () => {
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      return true;
    }
    return false;
  };

  const handleLockout = () => {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
    setLockoutEndTime(lockoutUntil);
    Alert.alert('Account Temporarily Locked', 'Too many failed attempts. Please wait 5 minutes before trying again.');
  };

  const reauthenticate = async () => {
    if (!user || !user.email) return false;
    if (isLockedOut()) {
      Alert.alert('Locked Out', 'You must wait until the lockout period expires before reauthenticating.');
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      setAttemptCount(0);
      setLockoutEndTime(null);
      return true;
    } catch (error) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      if (newAttemptCount >= MAX_ATTEMPTS) {
        handleLockout();
      } else {
        Alert.alert('Reauthentication Failed', 'Please check your current password.');
      }
      return false;
    }
  };

  const handleChangePassword = () => {
    resetSessionTimeout();
    if (!isPasswordVerified) {
      Alert.alert('Error', 'Please verify your current password first.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters, include uppercase, lowercase, a digit, and a special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    handleConfirmedPasswordChange();
  };
  const handleConfirmedPasswordChange = async () => {
    setLoading(true);
    const reauthSuccess = await reauthenticate();
    if (reauthSuccess && user) {
      try {
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        Alert.alert('Error', 'Failed to update password. Try again later or reauthenticate.');
      }
    }
    setLoading(false);
    setShowReauthModal(false);
    setReauthPassword('');
  };

  const handleUpdateProfile = async () => {
    resetSessionTimeout();
    setLoading(true);
    if (user) {
      try {
        await updateProfile(user, { displayName });
        Alert.alert('Success', 'Profile updated successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile.');
      }
    }
    setLoading(false);
  };

  const handleClearAsyncData = () => {
    resetSessionTimeout();
    Alert.alert('Confirm', 'Are you sure you want to delete all local data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.clear();
            Alert.alert('Success', 'All local data has been deleted.');
          } catch (error) {
            Alert.alert('Error', 'Failed to clear local data.');
          }
        } }
    ]);
  };

  const handleDeleteAccount = () => {
    resetSessionTimeout();
    if (isLockedOut()) {
      Alert.alert('Locked Out', 'Please wait for the lockout period to end before deleting your account.');
      return;
    }
    setReauthAction('deleteAccount');
    setShowReauthModal(true);
  };

  const handleConfirmedDeleteAccount = async () => {
    setLoading(true);
    const reauthSuccess = await reauthenticate();
    if (reauthSuccess && user) {
      try {
        await deleteUser(user);
        Alert.alert('Account Deleted', 'Your account has been deleted.');
        navigation.replace('OpeningScreen');
      } catch (error) {
        Alert.alert('Error', 'Failed to delete account. Try again later.');
      }
    }
    setLoading(false);
    setShowReauthModal(false);
    setReauthPassword('');
  };

  const handleSendPasswordReset = async () => {
    resetSessionTimeout();
    if (!user || !user.email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('Success', 'Password reset email sent.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    resetSessionTimeout();
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem('userProfile');
      Alert.alert('Exported Data', data || 'No data found.');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
    setLoading(false);
  };

return (
    <ErrorBoundary>
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
            <SafeAreaView style={styles.safeArea} onTouchStart={resetSessionTimeout}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Account</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Signed in as:</Text>
                        <Text style={styles.infoText}>{user?.email}</Text>
                        <TouchableOpacity onPress={handleSendPasswordReset} style={styles.miniButton}>
                            <Text style={styles.miniButtonText}>Send Password Reset Email</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Change Password</Text>

                        {/* Current Password Section */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={currentPassword}
                                onChangeText={(text) => {
                                    resetSessionTimeout();
                                    setCurrentPassword(text);
                                    setIsPasswordVerified(false);
                                }}
                                placeholder="Current Password"
                                placeholderTextColor="#cccccc"
                                secureTextEntry={!currentPasswordVisible}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    resetSessionTimeout();
                                    setCurrentPasswordVisible(!currentPasswordVisible);
                                }}
                                style={styles.eyeButton}
                            >
                                <MaterialIcons 
                                    name={currentPasswordVisible ? 'visibility' : 'visibility-off'} 
                                    size={22} 
                                    color="#ffffff" 
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Verify Button */}
                        {!isPasswordVerified && (
                            <TouchableOpacity 
                                onPress={verifyCurrentPassword}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionButtonText}>Verify Password</Text>
                            </TouchableOpacity>
                        )}

                        {isPasswordVerified && (
                            <>
                                <Text style={styles.verifiedText}>✓ Password verified</Text>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={newPassword}
                                        onChangeText={(text) => {
                                            resetSessionTimeout();
                                            setNewPassword(text);
                                        }}
                                        placeholder="New Password"
                                        placeholderTextColor="#cccccc"
                                        secureTextEntry={!passwordVisible}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            resetSessionTimeout();
                                            setPasswordVisible(!passwordVisible);
                                        }}
                                        style={styles.eyeButton}
                                    >
                                        <MaterialIcons name={passwordVisible ? 'visibility' : 'visibility-off'} size={22} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            resetSessionTimeout();
                                            setConfirmPassword(text);
                                        }}
                                        placeholder="Confirm New Password"
                                        placeholderTextColor="#cccccc"
                                        secureTextEntry={!confirmPasswordVisible}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            resetSessionTimeout();
                                            setConfirmPasswordVisible(!confirmPasswordVisible);
                                        }}
                                        style={styles.eyeButton}
                                    >
                                        <MaterialIcons name={confirmPasswordVisible ? 'visibility' : 'visibility-off'} size={22} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={handleChangePassword} style={styles.actionButton}>
                                    <Text style={styles.actionButtonText}>Update Password</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Local Data</Text>
              <TouchableOpacity onPress={handleClearAsyncData} style={[styles.actionButton, { backgroundColor: '#4a90e2' }]}>
                <Text style={styles.actionButtonText}>Delete All Local Data</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Export Your Data</Text>
              <TouchableOpacity onPress={handleExportData} style={[styles.actionButton, { backgroundColor: '#4a90e2' }]}>
                <Text style={styles.actionButtonText}>Export Data</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: '#d40000' }]}>Danger Zone</Text>
              <TouchableOpacity onPress={handleDeleteAccount} style={[styles.actionButton, { backgroundColor: '#d40000' }]}>
                <Text style={styles.actionButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
          </ScrollView>
        </SafeAreaView>
        <Modal transparent visible={showReauthModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reauthenticate</Text>
              <Text style={styles.modalMessage}>Enter your current password to proceed.</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={reauthPassword}
                  onChangeText={(text) => {
                    resetSessionTimeout();
                    setReauthPassword(text);
                  }}
                  placeholder="Current Password"
                  placeholderTextColor="#cccccc"
                  secureTextEntry={!reauthPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => {
                    resetSessionTimeout();
                    setReauthPasswordVisible(!reauthPasswordVisible);
                  }}
                  style={styles.eyeButton}
                >
                  <MaterialIcons name={reauthPasswordVisible ? 'visibility' : 'visibility-off'} size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => { resetSessionTimeout(); setShowReauthModal(false); setReauthPassword(''); }} style={[styles.modalButton, { backgroundColor: '#999' }]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    resetSessionTimeout();
                    if (reauthAction === 'passwordChange') {
                      handleConfirmedPasswordChange();
                    } else if (reauthAction === 'deleteAccount') {
                      handleConfirmedDeleteAccount();
                    }
                  }}
                  style={[styles.modalButton, { backgroundColor: '#d40000' }]}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
              {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { paddingVertical: 20, paddingHorizontal: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerBackButton: { padding: 10 },
  headerTitle: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 10 },
  infoText: { fontSize: 16, color: '#ffffff', marginBottom: 10 },
  miniButton: { backgroundColor: '#FFC371', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 5 },
  miniButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10, fontSize: 16, color: '#ffffff', marginBottom: 10 },
  actionButton: { backgroundColor: '#FFC371', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eyeButton: { paddingHorizontal: 10, paddingVertical: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#333', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, color: '#ffffff', fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, color: '#ffffff', textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  modalButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red' },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 10,
  },
  disabledInput: {
    opacity: 0.5,
  },
});

export default AccountScreen;
