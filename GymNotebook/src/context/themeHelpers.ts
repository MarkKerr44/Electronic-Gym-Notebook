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

      
        headerGradient: ['#ffffff', '#f2f2f2'],          
        buttonGradient: ['#007AFF', '#64b5ff'],          
        cardBackground: 'rgba(0,0,0,0.03)',              
        secondaryTextColor: '#666666',                  
        highlightSolid: '#e3e3e3',                       
      };

    case 'dark':
      return {

        gradient: ['#000000', '#333333'],
        textColor: '#ffffff',
        boxBackground: 'rgba(255,255,255,0.1)',
        boxBorderColor: 'transparent',
        buttonBackground: 'rgba(255,255,255,0.2)',
        accent: '#FF5F6D',


        headerGradient: ['#000000', '#333333'],
        buttonGradient: ['#444444', '#666666'],          
        cardBackground: 'rgba(255,255,255,0.07)',
        secondaryTextColor: '#cccccc',
        highlightSolid: '#444444',
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

     
        headerGradient: ['#0f0c29', '#302b63'],
        buttonGradient: ['#FF5F6D', '#FFC371'],
        cardBackground: '#4C4C4C',
        secondaryTextColor: '#FFC371',
        highlightSolid: '#FFC371',
      };
  }
}
