import { useNotifications } from '../../context/NotificationContext';

export function useNotificationService() {
  const { addNotification } = useNotifications();

  const notifyPersonalBest = (exerciseName: string, metric: string) => {
    addNotification({
      title: '🎉 New Personal Best!',
      message: `You've achieved a new personal best in ${exerciseName} (${metric})!`,
      type: 'achievement',
    });
  };

  const notifyWeeklyStreak = (count: number) => {
    addNotification({
      title: '🔥 Workout Streak!',
      message: `Impressive! You've completed all scheduled workouts for ${count} weeks in a row!`,
      type: 'streak',
    });
  };

  const notifyProgressMilestone = (workoutName: string, improvement: string) => {
    addNotification({
      title: '💪 Progress Alert',
      message: `You've improved in ${workoutName} by ${improvement} compared to last time!`,
      type: 'progress',
    });
  };

  const notifyWorkoutReminder = (workoutName: string) => {
    addNotification({
      title: '⏰ Workout Reminder',
      message: `Don't forget your scheduled ${workoutName} workout today!`,
      type: 'reminder',
    });
  };

  return {
    notifyPersonalBest,
    notifyWeeklyStreak,
    notifyProgressMilestone,
    notifyWorkoutReminder,
  };
}