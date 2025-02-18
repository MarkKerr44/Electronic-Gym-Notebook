// themeHelpers.ts
import { ThemeType } from './ThemeProvider';

export function getThemeColors(theme: ThemeType) {
  switch (theme) {
    case 'light':
      return {
        /**
         * Existing fields (unchanged)
         */
        gradient: ['#ffffff', '#f2f2f2'],
        textColor: '#000000',
        boxBackground: 'rgba(0,0,0,0.05)',
        boxBorderColor: '#aaa',
        buttonBackground: 'rgba(0,0,0,0.05)',
        accent: '#007AFF',

        /**
         * New fields (optional usage)
         */
        headerGradient: ['#ffffff', '#f2f2f2'],          // For top header sections
        buttonGradient: ['#007AFF', '#64b5ff'],          // For fancy gradient buttons
        cardBackground: 'rgba(0,0,0,0.03)',              // Subtle card background
        secondaryTextColor: '#666666',                   // Slightly darker than #000
        highlightSolid: '#e3e3e3',                       // Solid highlight color
      };

    case 'dark':
      return {
        /**
         * Existing fields (unchanged)
         */
        gradient: ['#000000', '#333333'],
        textColor: '#ffffff',
        boxBackground: 'rgba(255,255,255,0.1)',
        boxBorderColor: 'transparent',
        buttonBackground: 'rgba(255,255,255,0.2)',
        accent: '#FF5F6D',

        /**
         * New fields
         */
        headerGradient: ['#000000', '#333333'],
        buttonGradient: ['#444444', '#666666'],          // Or keep it pink if you prefer
        cardBackground: 'rgba(255,255,255,0.07)',
        secondaryTextColor: '#cccccc',
        highlightSolid: '#444444',
      };

    case 'purple':
    default:
      return {
        /**
         * Existing fields (unchanged)
         */
        gradient: ['#0f0c29', '#302b63', '#24243e'],
        textColor: '#ffffff',
        boxBackground: 'rgba(255,255,255,0.1)',
        boxBorderColor: 'transparent',
        buttonBackground: 'rgba(255,255,255,0.2)',
        accent: '#FF5F6D',

        /**
         * New fields
         */
        headerGradient: ['#0f0c29', '#302b63'],
        buttonGradient: ['#FF5F6D', '#FFC371'],
        cardBackground: '#4C4C4C',
        secondaryTextColor: '#FFC371',
        highlightSolid: '#FFC371',
      };
  }
}
