import { weightService } from '../../src/services/weightService';
import { auth, db } from '../../firebase/firebaseConfig';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

const mockAddDoc = jest.fn();
const mockCollection = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  addDoc: (...args: any[]) => mockAddDoc(...args),
  collection: (...args: any[]) => mockCollection(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args)
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'testUserId' } },
  db: {}
}));

describe('weightService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: 'testUserId' };
  });

  describe('saveWeightEntry', () => {
    it('saves entry if authenticated', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'entry123' });
      const id = await weightService.saveWeightEntry({ date: '2023-01-01', weight: 70 });
      expect(id).toBe('entry123');
      expect(mockAddDoc).toHaveBeenCalled();
    });
    it('throws if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(weightService.saveWeightEntry({ date: '', weight: 0 })).rejects.toThrow('User not authenticated');
    });
  });

  describe('getWeightEntries', () => {
    it('gets entries', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { id: 'we1', data: () => ({ weight: 70, date: '2023-01-01', userId: 'testUserId' }) }
        ]
      });
      const entries = await weightService.getWeightEntries();
      expect(entries).toEqual([{ id: 'we1', weight: 70, date: '2023-01-01', userId: 'testUserId' }]);
    });
    it('throws if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(weightService.getWeightEntries()).rejects.toThrow('User not authenticated');
    });
  });

  describe('deleteEntry', () => {
    it('deletes entry', async () => {
      await weightService.deleteEntry('entryId');
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
    it('throws if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(weightService.deleteEntry('entryId')).rejects.toThrow('User not authenticated');
    });
  });

  describe('saveUserPreferences', () => {
    it('saves preferences', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);
      await weightService.saveUserPreferences({ unit: 'kg' });
      expect(mockSetDoc).toHaveBeenCalled();
    });
    it('throws if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(weightService.saveUserPreferences({ unit: 'lbs' })).rejects.toThrow('User not authenticated');
    });
  });

  describe('getUserPreferences', () => {
    it('returns stored unit if exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ unit: 'lbs' })
      });
      const result = await weightService.getUserPreferences();
      expect(result).toBe('lbs');
    });
    it('returns "kg" if docSnap does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({ exists: () => false });
      const result = await weightService.getUserPreferences();
      expect(result).toBe('kg');
    });
    it('throws if not authenticated', async () => {
      (auth as any).currentUser = null;
      await expect(weightService.getUserPreferences()).rejects.toThrow('User not authenticated');
    });
  });
});
