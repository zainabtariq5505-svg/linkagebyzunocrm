import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        accent: '#8B5CF6',
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },
    },
  },
  plugins: [],
}
export default config
