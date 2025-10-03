import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 高齢者向けフォントサイズ拡張
      fontSize: {
        'senior-xs': ['14px', { lineHeight: '1.6' }],
        'senior-sm': ['16px', { lineHeight: '1.6' }],
        'senior-base': ['18px', { lineHeight: '1.6' }],
        'senior-lg': ['20px', { lineHeight: '1.6' }],
        'senior-xl': ['24px', { lineHeight: '1.6' }],
        'senior-2xl': ['28px', { lineHeight: '1.6' }],
      },
      // 色覚バリアフリー対応カラーパレット
      colors: {
        // 顧客ステータス色（高コントラスト + パターン対応）
        'status': {
          'active': '#22c55e',      // 緑（契約中）
          'warning': '#f59e0b',     // 黄（滞納注意）  
          'attention': '#ef4444',   // 赤（要対応）
          'neutral': '#6b7280',     // グレー（その他）
        },
        // アクセシブルカラーパレット
        'accessible': {
          'primary': '#1e40af',     // 濃い青
          'secondary': '#059669',   // 濃い緑
          'accent': '#dc2626',      // 濃い赤
          'text': '#1f2937',        // 濃いグレー
          'bg-light': '#f9fafb',    // 薄いグレー
          'border': '#d1d5db',      // 境界線
        }
      },
      // タッチ対応の最小タップサイズ
      spacing: {
        'touch': '44px', // 44px minimum for accessibility
        'senior-gap': '24px', // 高齢者向け余白
      },
      // 高コントラスト設定
      contrast: {
        '150': '150%',
      }
    },
  },
  plugins: [],
};
export default config;