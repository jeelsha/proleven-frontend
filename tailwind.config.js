/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        siteBG: '#F7F7FA',
        siteBG2: '#F4F4F6',
        offWhite: '#E9EBEC',
        offWhite2: '#F5F5F5',
        offWhite3: '#F9FAFD',
        authBG: '#E6F0FF',
        dark: '#111111',
        primary: '#0B4565',
        primary2: '#C2FF00',
        primary2Light: '#D0F4BA',
        primaryLight: '#F7FAFC',
        secondary: '#069FC1',
        lime: '#C2FF00',
        grayText: '#898989',
        borderColor: '#E6E6E6',
        navText: '#70708C',
        ic_1: '#42ED93',
        ic_2: '#EBA146',
        ic_3: '#FF6191',
        ic_4: '#09CCF8',
        danger: '#EB5757',
        orange2: '#ED8633',
        lightPurple: '#909DF9',
        lightGreen: '#4BCE97',
        green2: '#27AE60',
        green3: '#34C759',
        selectedGreen: '#00BD9D',
        grayOutline: '#0B456566',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        kanbanCard: '0px 4px 10px 0px',
        header: '0px 10px 50px',
        card: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
      },
      fontSize: {
        '22px': '22px',
        '15px': '15px',
      },
      backgroundImage: {
        checkmark: 'url(assets/checkmark.svg)',
        celebrationBg: 'url(assets/celebration_bg.png)',
        arrowDown: 'url(assets/chevron-down.svg)',
        prolevenWhiz: 'url(assets/proleven_whiz.svg)',
        welcomePopup: 'url(assets/welcome_popup.svg)',
        // checkmark2: "url(../imgs/checkmark-datatable.png)",
        authbg: 'url(assets/auth-bg.png)',
        lazyGradient:
          'linear-gradient(103deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)',
      },
      spacing: {
        unset: 'unset',
        '100dvh': '100dvh',
        '15px': '15px',
        '18px': '18px',
        '42px': '42px',
        '50px': '50px',
        '54px': '54px',
        '30px': '30px',
        '10px': '10px',
        '9px': '9px',
      },
      borderRadius: {
        '10px': '10px',
      },
      zIndex: {
        1: 9,
        2: 99,
        3: 999,
        4: 9999,
        5: 99999,
      },
      screens: {
        '3xl': '2100px',
        1900: '1900px',
        1800: '1800px',
        1600: '1600px',
        1500: '1500px',
        1400: '1400px',
        1300: '1300px',
        1200: '1200px',
        1024: '1024px',
        991: '991px',
        512: '512px',
      },
      keyframes: {
        lazy: {
          '0%': { backgroundPosition: '0' },
          '100%': { backgroundPosition: '-200%' },
        },
      },
      animation: {
        lazy: 'lazy 1.7s linear infinite',
      },
      backgroundSize: {
        200: '200%',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.overflow-unset': {
          overflow: ' unset',
        },
        '.word-break': {
          wordWrap: ' break-word',
        },
        '.wordBreak': {
          wordBreak: 'break-all',
        },
        '.wordBreak-word': {
          wordBreak: 'break-word',
        },
      });
    }),
  ],
};
