import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq',(upstream,req,res)=>{const abort=()=>{if(!res.writableEnded)upstream.destroy();};req.once('aborted',abort);res.once('close',abort);upstream.once('close',()=>{req.removeListener('aborted',abort);res.removeListener('close',abort);});});
        },
      },
    },
  },
});
