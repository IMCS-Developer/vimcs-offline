import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Daftarkan Service Worker segera agar seluruh aset dicache saat pertama kali dibuka
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('VIMCS Offline siap digunakan tanpa internet!')
  },
  onNeedRefresh() {
    console.log('Versi baru tersedia, memuat pembaruan...')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
