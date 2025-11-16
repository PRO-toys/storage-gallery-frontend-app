# 🚀 Vite React + TypeScript + Tailwind Frontend Deployment (Built Locally, Deployed at Root)

## 📁 Project Overview

- **Tech Stack**: Vite + React + TypeScript + Tailwind CSS
- **Deployment Type**: Build locally, upload the **contents** of `dist/` (not the folder itself)
- **Server Path**: `/newdata/vhosts/protoys.online/html-storage-frontend`
- **Domain**: [https://storage-frontend.protoys.online/](https://storage-frontend.protoys.online/)

---

## 🏗️ Step 1: Build Frontend Locally

### 1.1 Clone or Enter Project Directory

```bash
cd ~/projects/html-storage-frontend
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Set Base Path in `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ For root deployment
});
```

### 1.4 Build for Production

```bash
npm run build
```

✅ Output: Files in `dist/`

---

## 📤 Step 2: Upload Build Output to Server

### Upload only the **contents** of `dist/` to the web root:

```bash
scp -r dist/* root@<your-server-ip>:/newdata/vhosts/protoys.online/html-storage-frontend/
```

Or use FileZilla/SFTP to copy all files **inside** `dist/` (not the folder itself).

---

## 🌐 Step 3: Set Document Root in Plesk

Set to:

```
html-storage-frontend
```

This should now contain:

```
/newdata/vhosts/protoys.online/html-storage-frontend/
  ├── index.html
  ├── assets/
  ├── .htaccess
  └── other build files
```

---

## 🔄 Step 4: Enable SPA Routing with `.htaccess`

Create this `.htaccess` in `/html-storage-frontend/`:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]
```

✅ This handles React Router page refreshes without 404 errors.

---

## 🔐 Step 5: Set Proper Permissions (On Server)

```bash
cd /newdata/vhosts/protoys.online/html-storage-frontend
chown -R protoys.online:psacln .
chmod -R 755 .
```

---

## ✅ Final Checklist

-

---

## 🌎 Test Routes

```
https://storage-frontend.protoys.online/
https://storage-frontend.protoys.online/role/user/gallery/GalleryViewer/ABC123
```

---

🎉 Deployment successful! You now have a fully working Vite React app hosted directly at root domain.

