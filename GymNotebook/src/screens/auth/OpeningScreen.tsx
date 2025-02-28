import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import bicepAnimation from '../../../assets/animations/bicep_animation.json';

const { width, height } = Dimensions.get('window');

const OpeningScreen: React.FC = () => {
  const navigation = useNavigation();
  const [titleAnim] = React.useState(new Animated.Value(0));
  const [subtitleAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_CLIENT_ID',
    });
  }, []);

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <LottieView
        source={bicepAnimation}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Notebook
        </Animated.Text>
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Welcome to your new Gym Notebook!
        </Animated.Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
            <View style={styles.buttonContentWrapper}>
              <Image
                style={styles.googleIcon}
                source={{
                  uri:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
                }}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => navigation.navigate('SignUpScreen')}
          >
            <LinearGradient
              colors={['#FF5F6D', '#FFC371']}
              style={styles.emailButtonGradient}
            >
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('SignInScreen')}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  lottieAnimation: {
    position: 'absolute',
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '85%',
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    color: '#555555',
    fontWeight: '600',
    textAlign: 'center',
  },
  emailButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
  },
  emailButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  emailButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
});

export default OpeningScreen;
