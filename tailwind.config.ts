import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
      // 値は globals.css の :root / .dark で定義される CSS 変数を参照。
      // これにより bg-xxx / text-xxx / border-xxx / hover:bg-xxx /
      // from-xxx / to-xxx / data-[state=active]:bg-xxx などすべての
      // variant prefix でダークテーマに自動追従する。
      colors: {
        // 基本色 - 日本の伝統色
        'sumi': {
          DEFAULT: 'var(--color-sumi)',
          light: 'var(--color-sumi-light)',
          50: 'var(--color-sumi-50)',
        },
        'hai': {
          DEFAULT: 'var(--color-hai)',
          light: 'var(--color-hai-light)',
          dark: 'var(--color-hai-dark)',
          50: 'var(--color-hai-50)',
        },
        'gin': {
          DEFAULT: 'var(--color-gin)',
          light: 'var(--color-gin-light)',
          dark: 'var(--color-gin-dark)',
        },
        'shiro': 'var(--color-shiro)',
        'kinari': 'var(--color-kinari)',

        // 松葉色 - プライマリカラー
        'matsu': {
          DEFAULT: 'var(--color-matsu)',
          light: 'var(--color-matsu-light)',
          dark: 'var(--color-matsu-dark)',
          50: 'var(--color-matsu-50)',
          100: 'var(--color-matsu-100)',
          200: 'var(--color-matsu-200)',
          300: 'var(--color-matsu-300)',
          400: 'var(--color-matsu-400)',
          500: 'var(--color-matsu-500)',
          600: 'var(--color-matsu-600)',
          700: 'var(--color-matsu-700)',
          800: 'var(--color-matsu-800)',
          900: 'var(--color-matsu-900)',
        },

        // 茶色 - セカンダリカラー
        'cha': {
          DEFAULT: 'var(--color-cha)',
          light: 'var(--color-cha-light)',
          dark: 'var(--color-cha-dark)',
          50: 'var(--color-cha-50)',
          100: 'var(--color-cha-100)',
          200: 'var(--color-cha-200)',
          300: 'var(--color-cha-300)',
          400: 'var(--color-cha-400)',
          500: 'var(--color-cha-500)',
          600: 'var(--color-cha-600)',
          700: 'var(--color-cha-700)',
          800: 'var(--color-cha-800)',
          900: 'var(--color-cha-900)',
        },

        // 藍色 - アクセントカラー
        'ai': {
          DEFAULT: 'var(--color-ai)',
          light: 'var(--color-ai-light)',
          dark: 'var(--color-ai-dark)',
          50: 'var(--color-ai-50)',
          100: 'var(--color-ai-100)',
          200: 'var(--color-ai-200)',
          300: 'var(--color-ai-300)',
          400: 'var(--color-ai-400)',
          500: 'var(--color-ai-500)',
          600: 'var(--color-ai-600)',
          700: 'var(--color-ai-700)',
          800: 'var(--color-ai-800)',
          900: 'var(--color-ai-900)',
        },

        // 紅色 - エラー・警告
        'beni': {
          DEFAULT: 'var(--color-beni)',
          light: 'var(--color-beni-light)',
          dark: 'var(--color-beni-dark)',
          50: 'var(--color-beni-50)',
          100: 'var(--color-beni-100)',
          200: 'var(--color-beni-200)',
          300: 'var(--color-beni-300)',
          400: 'var(--color-beni-400)',
          500: 'var(--color-beni-500)',
          600: 'var(--color-beni-600)',
          700: 'var(--color-beni-700)',
          800: 'var(--color-beni-800)',
          900: 'var(--color-beni-900)',
        },

        // 琥珀色 - 警告
        'kohaku': {
          DEFAULT: 'var(--color-kohaku)',
          light: 'var(--color-kohaku-light)',
          dark: 'var(--color-kohaku-dark)',
          50: 'var(--color-kohaku-50)',
          100: 'var(--color-kohaku-100)',
          200: 'var(--color-kohaku-200)',
          300: 'var(--color-kohaku-300)',
          400: 'var(--color-kohaku-400)',
          500: 'var(--color-kohaku-500)',
          600: 'var(--color-kohaku-600)',
          700: 'var(--color-kohaku-700)',
          800: 'var(--color-kohaku-800)',
          900: 'var(--color-kohaku-900)',
        },

        // ステータス色（アクセシブル）
        'status': {
          'active': 'var(--color-matsu)',
          'warning': 'var(--color-kohaku)',
          'attention': 'var(--color-beni)',
          'neutral': 'var(--color-hai)',
        },

        // 背景・ボーダー
        'accessible': {
          'primary': 'var(--color-matsu)',
          'secondary': 'var(--color-cha)',
          'accent': 'var(--color-ai)',
          'text': 'var(--color-sumi)',
          'bg-light': 'var(--color-shiro)',
          'border': 'var(--color-gin)',
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
      // グラデーションは globals.css の CSS 変数を参照するため、
      // bg-gradient-warm 等も自動でダークテーマに追従する。
      backgroundImage: {
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-matsu': 'var(--gradient-matsu)',
        'gradient-cha': 'var(--gradient-cha)',
        'gradient-ai': 'var(--gradient-ai)',
        'gradient-sumi': 'var(--gradient-sumi)',
        'gradient-kohaku': 'var(--gradient-kohaku)',
      },
    },
  },
  plugins: [],
};
export default config;
