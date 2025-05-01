import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  // Your existing configuration...

  // Add environment variable support
  vite: {
    define: {
      'import.meta.env.CLOUDFLARE_DOMAIN': JSON.stringify(import.meta.env.CLOUDFLARE_DOMAIN || ''),
    },
  },
})
