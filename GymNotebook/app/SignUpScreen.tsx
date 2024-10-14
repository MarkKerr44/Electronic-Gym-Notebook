
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as EmailValidator from 'email-validator';
import { auth } from '../firebase/firebaseConfig'; 
import { MaterialIcons } from '@expo/vector-icons';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const emailErrorAnim = useRef(new Animated.Value(0)).current;
  const usernameErrorAnim = useRef(new Animated.Value(0)).current;
  const passwordErrorAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordErrorAnim = useRef(new Animated.Value(0)).current;
  const firebaseErrorAnim = useRef(new Animated.Value(0)).current;

  const animateError = (animation: Animated.Value) => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const resetErrorAnimation = (animation: Animated.Value) => {
    animation.setValue(0);
  };

  const validateInputs = () => {
    let valid = true;

    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFirebaseError('');
    resetErrorAnimation(emailErrorAnim);
    resetErrorAnimation(usernameErrorAnim);
    resetErrorAnimation(passwordErrorAnim);
    resetErrorAnimation(confirmPasswordErrorAnim);
    resetErrorAnimation(firebaseErrorAnim);

    if (!email) {
      setEmailError('Email is required.');
      animateError(emailErrorAnim);
      valid = false;
    } else if (!EmailValidator.validate(email)) {
      setEmailError('Please enter a valid email address.');
      animateError(emailErrorAnim);
      valid = false;
    }

    if (!username) {
      setUsernameError('Username is required.');
      animateError(usernameErrorAnim);
      valid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      animateError(usernameErrorAnim);
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      animateError(passwordErrorAnim);
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      animateError(passwordErrorAnim);
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      animateError(confirmPasswordErrorAnim);
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      animateError(confirmPasswordErrorAnim);
      valid = false;
    }

    return valid;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
      }

      setLoading(false);
      router.push('DashboardScreen'); 
    } catch (error: any) {
      setLoading(false);

      console.log('Firebase Sign Up Error:', error);

      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      setFirebaseError(errorMessage);
      animateError(firebaseErrorAnim);
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#ffffff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                    resetErrorAnimation(emailErrorAnim);
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? (
                <Animated.Text
                  style={[styles.errorText, { opacity: emailErrorAnim }]}
                >
                  {emailError}
                </Animated.Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#ffffff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setUsernameError('');
                    resetErrorAnimation(usernameErrorAnim);
                  }}
                  placeholder="Enter your username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
              {usernameError ? (
                <Animated.Text
                  style={[styles.errorText, { opacity: usernameErrorAnim }]}
                >
                  {usernameError}
                </Animated.Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#ffffff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                    resetErrorAnimation(passwordErrorAnim);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                />
              </View>
              {passwordError ? (
                <Animated.Text
                  style={[styles.errorText, { opacity: passwordErrorAnim }]}
                >
                  {passwordError}
                </Animated.Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#ffffff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                    resetErrorAnimation(confirmPasswordErrorAnim);
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                />
              </View>
              {confirmPasswordError ? (
                <Animated.Text
                  style={[styles.errorText, { opacity: confirmPasswordErrorAnim }]}
                >
                  {confirmPasswordError}
                </Animated.Text>
              ) : null}
            </View>

            {firebaseError ? (
              <Animated.Text
                style={[
                  styles.firebaseErrorText,
                  { opacity: firebaseErrorAnim },
                ]}
              >
                {firebaseError}
              </Animated.Text>
            ) : null}

            <TouchableOpacity
              onPress={handleSignUp}
              style={styles.buttonWrapper}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF5F6D', '#FFC371']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#FF5F6D',
    fontSize: 14,
    marginTop: 4,
  },
  firebaseErrorText: {
    color: '#FF5F6D',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 24,
  },
  gradientButton: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default SignUpScreen;
