/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b121e',
        panel: '#102733',
        cyan: '#22d3ee',
        success: '#22c55e',
        error: '#ef4444'
      }
    }
  },
  plugins: []
};

