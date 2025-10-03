import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // <-- Import the plugin

export default defineConfig({
  plugins: [
    react(),
    // Add the static copy plugin here
    viteStaticCopy({
      targets: [
        {
          src: 'netlify/functions/*', // <-- Source directory
          dest: '.netlify/functions'   // <-- Destination directory
        }
      ]
    })
  ],
});