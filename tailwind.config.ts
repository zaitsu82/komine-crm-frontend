import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // フォントファミリー
      fontFamily: {
        sans: ['Noto Sans JP', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Hiragino Sans', 'sans-serif'],
        mincho: ['Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
      },
      // 高齢者向けフォントサイズ拡張
      fontSize: {
        'senior-xs': ['14px', { lineHeight: '1.7' }],
        'senior-sm': ['16px', { lineHeight: '1.7' }],
        'senior-base': ['18px', { lineHeight: '1.7' }],
        'senior-lg': ['20px', { lineHeight: '1.7' }],
        'senior-xl': ['24px', { lineHeight: '1.7' }],
        'senior-2xl': ['28px', { lineHeight: '1.7' }],
      },
      // 和モダンカラーパレット
      colors: {
        // 基本色 - 日本の伝統色
        'sumi': {
          DEFAULT: '#1a1a1a',
          light: '#2d2d2d',
          50: '#f5f5f5',
        },
        'hai': {
          DEFAULT: '#6b6b6b',
          light: '#8a8a8a',
          dark: '#4a4a4a',
          50: '#f0f0f0',
        },
        'gin': {
          DEFAULT: '#c0c0c0',
          light: '#d8d8d8',
          dark: '#a0a0a0',
        },
        'shiro': '#fafaf8',
        'kinari': '#f5f3ef',

        // 松葉色 - プライマリカラー
        'matsu': {
          DEFAULT: '#2d5a3d',
          light: '#3d7a52',
          dark: '#1e3d29',
          50: '#e8f0eb',
          100: '#d4e5da',
          200: '#a8cbb5',
          300: '#7db190',
          400: '#52976b',
          500: '#2d5a3d',
          600: '#264e34',
          700: '#1e3d29',
          800: '#172c1f',
          900: '#0f1b14',
        },

        // 茶色 - セカンダリカラー
        'cha': {
          DEFAULT: '#8b7355',
          light: '#a08060',
          dark: '#6b5a45',
          50: '#f7f4f0',
          100: '#ede7df',
          200: '#d9ccba',
          300: '#c4b095',
          400: '#b09470',
          500: '#8b7355',
          600: '#756248',
          700: '#5f503b',
          800: '#493e2e',
          900: '#332c21',
        },

        // 藍色 - アクセントカラー
        'ai': {
          DEFAULT: '#264348',
          light: '#3a6066',
          dark: '#1a3033',
          50: '#e8eced',
          100: '#d1d9db',
          200: '#a3b3b7',
          300: '#758d93',
          400: '#47676f',
          500: '#264348',
          600: '#20383c',
          700: '#1a2d30',
          800: '#142224',
          900: '#0e1718',
        },

        // 紅色 - エラー・警告
        'beni': {
          DEFAULT: '#b54a4a',
          light: '#c96a6a',
          dark: '#8f3a3a',
          50: '#fbe9e9',
          100: '#f5d4d4',
          200: '#e8a8a8',
          300: '#db7c7c',
          400: '#ce5050',
          500: '#b54a4a',
          600: '#973e3e',
          700: '#793232',
          800: '#5b2626',
          900: '#3d1a1a',
        },

        // 琥珀色 - 警告
        'kohaku': {
          DEFAULT: '#c4a35a',
          light: '#d4b87a',
          dark: '#a4863a',
          50: '#fdf6e3',
          100: '#f9ecc7',
          200: '#f2d98f',
          300: '#ebc657',
          400: '#d4b040',
          500: '#c4a35a',
          600: '#a4863a',
          700: '#84692a',
          800: '#644c1a',
          900: '#442f0a',
        },

        // ステータス色（アクセシブル）
        'status': {
          'active': '#2d5a3d',
          'warning': '#c4a35a',
          'attention': '#b54a4a',
          'neutral': '#6b6b6b',
        },

        // 背景・ボーダー
        'accessible': {
          'primary': '#2d5a3d',
          'secondary': '#8b7355',
          'accent': '#264348',
          'text': '#1a1a1a',
          'bg-light': '#fafaf8',
          'border': '#c0c0c0',
        }
      },
      // タッチ対応の最小タップサイズ
      spacing: {
        'touch': '48px',
        'senior-gap': '24px',
      },
      // ボックスシャドウ
      boxShadow: {
        'elegant-sm': '0 1px 2px rgba(26, 26, 26, 0.05)',
        'elegant': '0 4px 12px rgba(26, 26, 26, 0.08)',
        'elegant-lg': '0 8px 24px rgba(26, 26, 26, 0.12)',
        'elegant-xl': '0 16px 48px rgba(26, 26, 26, 0.16)',
        'matsu': '0 4px 12px rgba(45, 90, 61, 0.25)',
        'cha': '0 4px 12px rgba(139, 115, 85, 0.25)',
      },
      // ボーダー半径
      borderRadius: {
        'elegant': '8px',
        'elegant-lg': '12px',
        'elegant-xl': '16px',
      },
      // トランジション
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      // 高コントラスト設定
      contrast: {
        '150': '150%',
      },
      // 背景画像
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #fafaf8 0%, #f5f3ef 100%)',
        'gradient-matsu': 'linear-gradient(135deg, #2d5a3d 0%, #1e3d29 100%)',
        'gradient-cha': 'linear-gradient(135deg, #8b7355 0%, #6b5a45 100%)',
        'gradient-ai': 'linear-gradient(135deg, #264348 0%, #1a3033 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
