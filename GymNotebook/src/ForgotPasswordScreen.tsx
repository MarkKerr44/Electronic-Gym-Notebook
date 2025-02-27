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
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const emailErrorAnim = useRef(new Animated.Value(0)).current;

  const animateError = () => {
    Animated.timing(emailErrorAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleResetPassword = async () => {
    if (!email || !EmailValidator.validate(email)) {
      setEmailError('Please enter a valid email address');
      animateError();
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      }
      setEmailError(errorMessage);
      animateError();
    } finally {
      setLoading(false);
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Reset Password</Text>
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Password reset email sent! Check your inbox for further instructions.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SignInScreen')}
                  style={styles.backToSignInButton}
                >
                  <Text style={styles.backToSignInText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.description}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
                <View style={styles.inputContainer}>
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
                      onChangeText={setEmail}
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
                <TouchableOpacity
                  onPress={handleResetPassword}
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
                      {loading ? 'Sending...' : 'Reset Password'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
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
  },
  backButton: {
    padding: 20,
  },
  innerContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
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
    marginTop: 8,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
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
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    color: '#4BB543',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToSignInButton: {
    marginTop: 16,
  },
  backToSignInText: {
    color: '#FFC371',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;