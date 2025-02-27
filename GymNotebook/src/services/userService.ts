import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

export interface UserProfile {
  age: string;
  sex: string;
  weight: string;
  height: string;
  isMetric: boolean;
}

export const userService = {
  async saveUserProfile(profile: UserProfile) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await setDoc(doc(db, 'userProfiles', userId), {
        ...profile,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};