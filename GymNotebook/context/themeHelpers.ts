// themeHelpers.ts
import { ThemeType } from './ThemeProvider';

export function getThemeColors(theme: ThemeType) {
  switch (theme) {
    case 'light':
      return {
        gradient: ['#ffffff', '#f2f2f2'],
        textColor: '#000000',
        boxBackground: 'rgba(0,0,0,0.05)',
        boxBorderColor: '#aaa',
        buttonBackground: 'rgba(0,0,0,0.05)',
        accent: '#007AFF',
      };
    case 'dark':
      return {
        gradient: ['#000000', '#333333'],
        textColor: '#ffffff',
        boxBackground: 'rgba(255,255,255,0.1)',
        boxBorderColor: 'transparent',
        buttonBackground: 'rgba(255,255,255,0.2)',
        accent: '#FF5F6D',
      };
    case 'purple':
    default:
      return {
        gradient: ['#0f0c29', '#302b63', '#24243e'],
        textColor: '#ffffff',
        boxBackground: 'rgba(255,255,255,0.1)',
        boxBorderColor: 'transparent',
        buttonBackground: 'rgba(255,255,255,0.2)',
        accent: '#FF5F6D',
      };
  }
}
