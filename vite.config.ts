import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const pwaTargetPlugin = (isAdmin: boolean): Plugin => ({
  name: 'le-matin-pwa-html',
  transformIndexHtml(html) {
    if (!isAdmin) return html
    return html
      .replace('<meta name="theme-color" content="#FDFBF7" />', '<meta name="theme-color" content="#3E422B" />')
      .replace('<meta name="apple-mobile-web-app-title" content="Le Matin" />', '<meta name="apple-mobile-web-app-title" content="📊 Le Matin Admin" />')
      .replace(
        'Le Matin chez Refka — homemade breakfast boxes and brunch platters, delivered fresh every morning.',
        'Le Matin chez Refka — Kitchen & Brand Dashboard for order dispatch, menu stock, and box customization.',
      )
      .replace('<title>Le Matin chez Refka — Fait maison, avec amour</title>', '<title>📊 Le Matin — Admin Dashboard</title>')
      .replace('/manifest-store.webmanifest', '/manifest-admin.webmanifest')
      .replace(/\/pwa\/store-icon-192\.png/g, '/pwa/admin-icon-192.png')
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isAdmin = mode === 'admin' || env.VITE_APP_TARGET === 'admin'

  return {
    plugins: [react(), pwaTargetPlugin(isAdmin)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
