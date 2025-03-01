import { userService } from '../../src/services/userService';
import { auth, db } from '../../firebase/firebaseConfig';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';


const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();


jest.mock('firebase/firestore', () => ({
  __esModule: true, 
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
}));


jest.mock('../../firebase/firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'testUserId123' },
  },
  db: {}, 
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: 'testUserId123' };
  });

  describe('saveUserProfile', () => {
    it('calls setDoc with correct data when user is authenticated', async () => {
      const mockProfile = {
        age: '30',
        sex: 'Male',
        weight: '80',
        height: '180',
        isMetric: true,
      };


      mockSetDoc.mockResolvedValueOnce(undefined);

      mockDoc.mockReturnValueOnce({ path: 'mockDocPath' });

      await userService.saveUserProfile(mockProfile);

      expect(mockDoc).toHaveBeenCalledWith(db, 'userProfiles', 'testUserId123');
      expect(mockSetDoc).toHaveBeenCalledWith(
        { path: 'mockDocPath' },
        expect.objectContaining({
          age: '30',
          sex: 'Male',
          weight: '80',
          height: '180',
          isMetric: true,
          updatedAt: expect.any(Date), 
        })
      );
    });

    it('throws an error if user is not authenticated', async () => {
      (auth as any).currentUser = null;

      await expect(
        userService.saveUserProfile({
          age: '30',
          sex: 'Male',
          weight: '80',
          height: '180',
          isMetric: true,
        })
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('getUserProfile', () => {
    it('returns profile data if docSnap exists', async () => {
      const mockProfile = {
        age: '25',
        sex: 'Female',
        weight: '65',
        height: '170',
        isMetric: true,
      };

      mockDoc.mockReturnValueOnce({ path: 'mockDocPath' });
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockProfile,
      });

      const result = await userService.getUserProfile();

      expect(mockDoc).toHaveBeenCalledWith(db, 'userProfiles', 'testUserId123');
      expect(mockGetDoc).toHaveBeenCalledWith({ path: 'mockDocPath' });
      expect(result).toEqual(mockProfile);
    });

    it('returns null if docSnap does not exist', async () => {
      mockDoc.mockReturnValueOnce({ path: 'mockDocPath' });
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false, 
      });

      const result = await userService.getUserProfile();

      expect(result).toBeNull();
    });

    it('throws an error if user is not authenticated', async () => {
      (auth as any).currentUser = null;

      await expect(userService.getUserProfile()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });
});
