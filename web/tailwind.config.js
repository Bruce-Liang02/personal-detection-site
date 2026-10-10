/** @type {import('tailwindcss').Config} */

// ── 设计令牌 ─────────────────────────────────────────────
// 品牌色：青绿（teal），取自检测报告主色 #207963 的邻近色系
// 主色 primary = #017173，用于按钮/强调/品牌标识
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 品牌青绿：主色 primary（DEFAULT），hover 用 800
        // DEFAULT/soft/line 供简写类使用：bg-brand、text-brand、border-brand、bg-brand-soft
        brand: {
          DEFAULT: '#017173', // ← primary（#017173）
          soft:   '#f0faf8',
          'soft-2': '#d9f2ec',
          line:   '#b0e5da',
          50: '#f0faf8',
          100: '#d9f2ec',
          200: '#b0e5da',
          300: '#7dd0c2',
          400: '#46b3a4',
          500: '#209488',
          600: '#117a70',
          700: '#017173',
          800: '#045c5f',
          900: '#064b4e',
          950: '#032e31',
        },
        // 辅助强调色：靛紫，用于次级强调与图表第二序列
        accent: {
          50: '#f3f2ff',
          100: '#e6e4ff',
          200: '#c9c5ff',
          300: '#a49cff',
          400: '#8075fb',
          500: '#6b5ef0',
          600: '#5a4bd8',
          700: '#4c3fb0',
          800: '#3e358e',
          900: '#342e72',
        },
        // 文字层级：ink 主文 / ink-2 次文 / ink-3 辅助 / ink-4 占位
        ink: {
          DEFAULT: '#1d2129',
          2: '#4e5969',
          3: '#86909c',
          4: '#c9cdd4',
        },
        // 分割线与浅底
        line: {
          DEFAULT: '#e5e6eb',
          soft: '#f2f3f5',
          lighter: '#f7f8fa',
        },
        // 页面底色（极浅暖灰，与报告一致）
        page: '#f5f6f8',

        // 四层检测固定配色（跨页面保持一致，勿随意更改）
        l1: '#12A594', // 学术规范
        l2: '#3E7BFA', // 学术诚信
        l3: '#7C6CF0', // 学术表达
        l4: '#D4639E', // 批判性思维

        // 语义色：仅用于状态表达，不可作主色
        success: { DEFAULT: '#00B42A', soft: '#e8ffea', border: '#aff0b5' },
        warning: { DEFAULT: '#FF7D00', soft: '#fff7e8', border: '#ffcf8b' },
        danger:  { DEFAULT: '#F53F3F', soft: '#ffece8', border: '#fbc4c0' },
        info:    { DEFAULT: '#165DFF', soft: '#e8f3ff', border: '#bedaff' },
      },

      // 圆角：统一到 3 / 6 / 8 / 12 / 16 五档
      borderRadius: {
        'xs': '3px',
        'sm': '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"',
          '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'Arial', 'sans-serif',
        ],
      },

      // 字号层级（与报告一致的三级正文体系）
      fontSize: {
        'display': ['36px', { lineHeight: '1.25', fontWeight: '800' }],
        'title':   ['24px', { lineHeight: '1.35', fontWeight: '700' }],
        'subtitle':['18px', { lineHeight: '1.4',  fontWeight: '600' }],
        'body':    ['14px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
        'micro':   ['12px', { lineHeight: '1.45' }],
      },

      // 阴影：统一为 4 档，弱化硬边
      boxShadow: {
        'xs':  '0 1px 2px rgba(29,33,41,.04)',
        'sm':  '0 2px 8px rgba(29,33,41,.06)',
        'card': '0 2px 12px rgba(29,33,41,.06)',
        'md':  '0 6px 20px rgba(29,33,41,.08)',
        'lg':  '0 12px 32px rgba(29,33,41,.12)',
        'brand': '0 4px 14px rgba(1,113,115,.24)',
      },

      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
}