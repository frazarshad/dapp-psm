import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      setupFiles: ['src/installSesLockdown.ts'],
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    },
  })
);
