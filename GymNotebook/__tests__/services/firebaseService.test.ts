import { firebaseService } from '../../src/services/firebaseService';
import { auth, db } from '../../firebase/firebaseConfig';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

const mockCollection = jest.fn();
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockTimestamp = {
  now: jest.fn(() => ({
    seconds: 111111,
    nanoseconds: 0,
    toDate: () => new Date(111111 * 1000)
  })),
  fromDate: jest.fn(date => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date
  }))
};

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  Timestamp: mockTimestamp
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'testUserId' } },
  db: {}
}));

describe('FirebaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: 'testUserId' };
  });


  describe('getUserWorkouts', () => {
    it('returns workouts', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'w1',
            data: () => ({ userId: 'testUserId', name: 'Push Day' })
          }
        ]
      });
      const workouts = await firebaseService.getUserWorkouts();
      expect(workouts).toEqual([{ id: 'w1', userId: 'testUserId', name: 'Push Day' }]);
    });
    it('throws error if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(firebaseService.getUserWorkouts()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('getExerciseHistory', () => {
    it('returns history', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'eh1', data: () => ({ exerciseId: 'ex1', sets: [1, 2] }) }
        ]
      });
      const history = await firebaseService.getExerciseHistory('ex1');
      expect(history).toEqual([{ id: 'eh1', exerciseId: 'ex1', sets: [1, 2] }]);
    });
    it('throws error if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(firebaseService.getExerciseHistory('ex1')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });


  describe('getLastWorkoutOfType', () => {
    it('returns null if empty', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
      const result = await firebaseService.getLastWorkoutOfType('w1');
      expect(result).toBeNull();
    });
    it('returns last workout if exists', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'docX', data: () => ({ name: 'testWorkout' }) }]
      });
      const result = await firebaseService.getLastWorkoutOfType('w1');
      expect(result).toEqual({ id: 'docX', name: 'testWorkout' });
    });
    it('throws error if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(firebaseService.getLastWorkoutOfType('w1')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('getPreviousBest', () => {
    it('returns best', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            data: () => ({
              exercises: [
                { exerciseId: 'ex1', sets: [{ weight: 50, actualReps: 5 }, { weight: 60, actualReps: 3 }] },
                { exerciseId: 'ex2', sets: [{ weight: 75, actualReps: 2 }] }
              ]
            })
          }
        ]
      });
      const result = await firebaseService.getPreviousBest('ex1');
      expect(result).toEqual({ weight: 60, reps: 3 });
    });
    it('throws error if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(firebaseService.getPreviousBest('ex1')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('updateCalendarWorkout', () => {
    it('adds doc if empty', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
      mockAddDoc.mockResolvedValue({ id: 'c123' });
      await firebaseService.updateCalendarWorkout('2023-01-01', { name: 'myWk' });
      expect(mockAddDoc).toHaveBeenCalled();
    });
    it('updates doc if exists', async () => {
      const mockRef = { update: jest.fn() };
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ workouts: [{ name: 'wk1' }] }),
            ref: mockRef
          }
        ]
      });
      await firebaseService.updateCalendarWorkout('2023-01-01', { name: 'wk2' });
      expect(mockRef.update).toHaveBeenCalledWith({
        workouts: [{ name: 'wk1' }, { name: 'wk2' }]
      });
    });
    it('throws error if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(
        firebaseService.updateCalendarWorkout('2023-01-01', {})
      ).rejects.toThrow('User not authenticated');
    });
  });
});
