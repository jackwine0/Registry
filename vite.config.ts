import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forwards /api/* to the local Express proxy in /server during dev,
      // so the browser only ever talks to one origin (avoids CORS entirely).
      // Explicit 127.0.0.1 (not "localhost") avoids a common failure mode:
      // Node resolves "localhost" to the IPv6 loopback (::1) first, and in
      // environments without IPv6 loopback configured (many containers/
      // sandboxes), that connection is refused even though the server is
      // listening fine on IPv4 — surfacing as a confusing ECONNREFUSED here
      // despite the API server logging that it started successfully.
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
