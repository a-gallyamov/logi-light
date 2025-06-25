import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import SVG from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';

export default defineConfig(() => ({
  base: '/logi-light/',
  plugins: [
    tsconfigPaths(),
    react(),
    SVG({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
      exclude: '',
    }),
    checker({ typescript: true }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@app/*': resolve(__dirname, 'src/app'),
      '@pages/*': resolve(__dirname, 'src/pages'),
      '@widgets/*': resolve(__dirname, 'src/widgets'),
      '@features/*': resolve(__dirname, 'src/features'),
      '@entities/*': resolve(__dirname, 'src/entities'),
      '@shared/*': resolve(__dirname, 'src/shared'),
      '@modules/*': resolve(__dirname, 'src/modules'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
}));
