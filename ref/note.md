###### frontend

# getting started
```sh
npm create vite@latest
cd frontend
npm install
```

# initial
```sh
# npm create vite@latest
# √ Project name: ... frontend
# √ Select a framework: » React
# √ Select a variant: » TypeScript + SWC
```

# packages
```sh
npm install react-router-dom
npm install localforage match-sorter sort-by
npm install axios
npm install sweetalert2

npm install react-ga4

# for page drawing
npm install html2canvas react-signature-canvas
```

# style : tailwind
```sh
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

[tailwind.config.js]
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

[index.css]
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

# kill port
# windows
[PowerShell]
```bash
# example
netstat -ano | findstr :3001
# TCP [::1]:3001 [::]:0 LISTENING 20900
taskkill /PID 20900 /F
```
