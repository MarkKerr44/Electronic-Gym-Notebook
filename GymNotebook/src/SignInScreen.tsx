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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as EmailValidator from 'email-validator';
import { auth } from '../firebase/firebaseConfig';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { signInWithEmailAndPassword } from 'firebase/auth';

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const emailErrorAnim = useRef(new Animated.Value(0)).current;
  const passwordErrorAnim = useRef(new Animated.Value(0)).current;
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
    setPasswordError('');
    setFirebaseError('');
    resetErrorAnimation(emailErrorAnim);
    resetErrorAnimation(passwordErrorAnim);
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

    if (!password) {
      setPasswordError('Password is required.');
      animateError(passwordErrorAnim);
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigation.navigate('DashboardScreen');
    } catch (error: any) {
      setLoading(false);
      console.log('Firebase Sign In Error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
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
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="email"
                  size={20}
                  color="#ffffff"
                  style={styles.inputIcon}
                />
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
                <Animated.Text style={[styles.errorText, { opacity: emailErrorAnim }]}>
                  {emailError}
                </Animated.Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color="#ffffff"
                  style={styles.inputIcon}
                />
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
                <Animated.Text style={[styles.errorText, { opacity: passwordErrorAnim }]}>
                  {passwordError}
                </Animated.Text>
              ) : null}
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            {firebaseError ? (
              <Animated.Text style={[styles.firebaseErrorText, { opacity: firebaseErrorAnim }]}>
                {firebaseError}
              </Animated.Text>
            ) : null}
            <TouchableOpacity onPress={handleSignIn} style={styles.buttonWrapper} disabled={loading}>
              <LinearGradient
                colors={['#FF5F6D', '#FFC371']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.signUpLinkContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                <Text style={styles.signUpLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  signUpLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpText: {
    fontSize: 16,
    color: '#ffffff',
  },
  signUpLink: {
    fontSize: 16,
    color: '#FFC371',
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFC371',
    fontSize: 14,
  },
});

export default SignInScreen;
