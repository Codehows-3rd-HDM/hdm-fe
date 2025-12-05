/* @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 쓰던 색상들을 이름으로 지정
        hd: {
          primary: '#002c5f',   // 현대차 다크 네이비 (로고색?)
          blue: '#007bff',      // 기본 버튼 파랑
          green: '#28a745',     // 엑셀/성공 녹색
          red: '#dc3545',       // 삭제/경고 빨강
          gray: '#f4f7f9',      // 배경 회색
          navy: '#1f253b',
          white: '#FFFFFF',   //흰색
        }
      }
    },
  },
  plugins: [],
}