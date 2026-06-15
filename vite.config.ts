import path from 'node:path';
import os from 'node:os';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves from /REPO_NAME/ — update if you rename the repository.
const repoBase = '/Diffley_WC_26/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local dev: http://localhost:5173/  |  Production: /Diffley_WC_26/
  base: command === 'serve' ? '/' : repoBase,
  // Keep Vite cache outside Dropbox — sync locks cause EBUSY on node_modules/.vite
  cacheDir: path.join(os.homedir(), '.cache', 'vite', 'diffley-wc-26'),
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
