import { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          primary: {
            // delft_blue
            DEFAULT: '#2f3b55',
            100: '#090c11',
            200: '#131822',
            300: '#1c2433',
            400: '#262f44',
            500: '#2f3b55',
            600: '#4a5d86',
            700: '#6d82af',
            800: '#9eabc9',
            900: '#ced5e4',
          },
          //
          secondary: {
            // magenta_haze
            DEFAULT: '#a75a86',
            100: '#21121b',
            200: '#422435',
            300: '#633650',
            400: '#85476a',
            500: '#a75a86',
            600: '#b87a9d',
            700: '#c99cb6',
            800: '#dbbdce',
            900: '#eddee7',
          },
          contrast: {
            // isabelline
            DEFAULT: '#f2e9e4',
            100: '#3f2a1e',
            200: '#7f543d',
            300: '#b58165',
            400: '#d3b5a4',
            500: '#f2e9e4',
            600: '#f4ede9',
            700: '#f7f1ee',
            800: '#faf6f4',
            900: '#fcfaf9',
          },
          info: {
            // blue_munsell
            DEFAULT: '#468c98',
            100: '#0e1c1f',
            200: '#1c393d',
            300: '#2a555c',
            400: '#39717b',
            500: '#468c98',
            600: '#62aab7',
            700: '#8ac0c9',
            800: '#b1d5db',
            900: '#d8eaed',
          },
          danger: {
            // cinnabar
            DEFAULT: '#db583d',
            100: '#2f0f09',
            200: '#5f1e11',
            300: '#8e2d1a',
            400: '#be3d23',
            500: '#db583d',
            600: '#e37964',
            700: '#ea9a8b',
            800: '#f1bcb1',
            900: '#f8ddd8',
          },
          success: {
            // celadon
            DEFAULT: '#8bcea5',
            100: '#14311f',
            200: '#29623f',
            300: '#3d935e',
            400: '#5bba80',
            500: '#8bcea5',
            600: '#a3d8b7',
            700: '#bae2c9',
            800: '#d1ecdb',
            900: '#e8f5ed',
          },
          warning: {
            // hunyadi_yellow
            DEFAULT: '#f5af40',
            100: '#3b2603',
            200: '#764b06',
            300: '#b17109',
            400: '#ec970c',
            500: '#f5af40',
            600: '#f7c068',
            700: '#f9d08e',
            800: '#fbe0b3',
            900: '#fdefd9',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
