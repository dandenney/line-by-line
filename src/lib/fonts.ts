import { Source_Serif_4, Inter } from 'next/font/google';

export const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'],
  variable: '--font-source-serif',
});

export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// Combined font variables for use in CSS
export const fontVariables = `${sourceSerif.variable} ${inter.variable}`; 