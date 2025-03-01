import { workoutService } from '../../src/services/workoutService'
import { auth, db } from '../../firebase/firebaseConfig'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

const mockAddDoc = jest.fn()
const mockCollection = jest.fn()
const mockGetDocs = jest.fn()
const mockQuery = jest.fn()
const mockWhere = jest.fn()
const mockDeleteDoc = jest.fn()
const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockOrderBy = jest.fn()
const mockLimit = jest.fn()
const mockBatchDelete = jest.fn()
const mockBatchCommit = jest.fn()

const mockTimestamp = {
  now: () => ({
    seconds: 1234567890,
    nanoseconds: 0,
    toDate: () => new Date(1234567890 * 1000)
  }),
  fromDate: (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date
  })
}

jest.mock('../../firebase/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'testUserId' } },
  db: {}
}))

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: any[]) => mockAddDoc(...args),
  collection: (...args: any[]) => mockCollection(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  writeBatch: () => ({
    delete: mockBatchDelete,
    commit: mockBatchCommit
  }),
  Timestamp: mockTimestamp
}))

describe('workoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as any).currentUser = { uid: 'testUserId' }
    
    mockAddDoc.mockReset()
    mockCollection.mockReturnValue('collection-ref')
  })


  describe('deleteWorkout', () => {
    it('deletes workout', async () => {
      await workoutService.deleteWorkout('w123')
      expect(mockDeleteDoc).toHaveBeenCalled()
    })
    it('throws if not authenticated', async () => {
      ;(auth as any).currentUser = null
      await expect(workoutService.deleteWorkout('w123')).rejects.toThrow()
    })
  })

  describe('getUserWorkouts', () => {
    it('returns workouts', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ id: 'w1', data: () => ({ name: 'Workout1', userId: 'testUserId' }) }]
      })
      const workouts = await workoutService.getUserWorkouts()
      expect(workouts).toEqual([{ id: 'w1', name: 'Workout1', userId: 'testUserId' }])
    })
    it('throws if not authenticated', async () => {
      ;(auth as any).currentUser = null
      await expect(workoutService.getUserWorkouts()).rejects.toThrow()
    })
  })

  describe('getWorkoutById', () => {
    it('returns workout if exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'w123',
        data: () => ({ name: 'TestWorkout' })
      })
      const result = await workoutService.getWorkoutById('w123')
      expect(result).toEqual({ id: 'w123', name: 'TestWorkout' })
    })
    it('returns null if docSnap not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({ exists: () => false })
      const result = await workoutService.getWorkoutById('w123')
      expect(result).toBeNull()
    })
  })

  describe('updateWorkout', () => {
    it('updates workout', async () => {
      await workoutService.updateWorkout('w123', { name: 'Updated' } as any)
      expect(mockUpdateDoc).toHaveBeenCalled()
    })
  })

  describe('saveWorkoutLog', () => {
    it('saves log if authenticated', async () => {
      const mockDocRef = { id: 'log123' }
      mockAddDoc.mockResolvedValueOnce(mockDocRef)

      const result = await workoutService.saveWorkoutLog({
        workoutId: 'w123',
        workoutName: 'Test Workout',
        date: '2024-03-01',
        exercises: []
      })

      expect(mockCollection).toHaveBeenCalledWith(db, 'workoutLogs')
      expect(mockAddDoc).toHaveBeenCalledWith(
        'collection-ref',
        expect.objectContaining({
          userId: 'testUserId',
          workoutId: 'w123',
          workoutName: 'Test Workout',
          exercises: []
        })
      )
      expect(result).toBe('log123')
    })

  })


  describe('updateCalendarWorkout', () => {
    it('updates calendar if authenticated', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'cal123' })
      const result = await workoutService.updateCalendarWorkout('2023-01-01', { some: 'workout' })
      expect(result).toBe('cal123')
    })
    it('throws if not authenticated', async () => {
      ;(auth as any).currentUser = null
      await expect(workoutService.updateCalendarWorkout('', {})).rejects.toThrow()
    })
  })

  describe('clearWorkoutHistory', () => {
    it('clears logs and calendar docs', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [{ ref: 'r1' }, { ref: 'r2' }] })
      mockGetDocs.mockResolvedValueOnce({ docs: [{ ref: 'c1' }] })
      await workoutService.clearWorkoutHistory()
      expect(mockBatchDelete).toHaveBeenCalledTimes(3)
      expect(mockBatchCommit).toHaveBeenCalledTimes(2)
    })
    it('throws if not authenticated', async () => {
      ;(auth as any).currentUser = null
      await expect(workoutService.clearWorkoutHistory()).rejects.toThrow()
    })
  })


})
