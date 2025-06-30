/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.{html,ts}"],
  },
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}

