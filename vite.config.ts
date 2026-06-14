import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

const supabaseConfigPlugin = () => ({
  name: 'supabase-config-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url?.split('?')[0];
      if (url === '/api/supabase-config') {
        res.setHeader('Content-Type', 'application/json');
        const jsonFilePath = path.resolve(__dirname, './src/lib/supabase_credentials.json');
        
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(jsonFilePath)) {
              const data = fs.readFileSync(jsonFilePath, 'utf-8');
              res.statusCode = 200;
              res.end(data);
            } else {
              res.statusCode = 200;
              res.end(JSON.stringify({ url: '', anonKey: '' }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read credentials' }));
          }
          return;
        }
        
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed.url !== undefined && parsed.anonKey !== undefined) {
                fs.writeFileSync(jsonFilePath, JSON.stringify({
                  url: parsed.url.trim(),
                  anonKey: parsed.anonKey.trim()
                }, null, 2), 'utf-8');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } else {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid parameters' }));
              }
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Failed to parse JSON' }));
            }
          });
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), supabaseConfigPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
