import { defineConfig, loadEnv } from 'vite';
import pixabay from './api/pixabay.js';
import visitors from './api/visitors.js';

// 로컬 개발(npm run dev)에서도 Vercel 서버리스 함수(/api/pixabay)가 동작하도록 연결
function devApi(env) {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/pixabay', (req, res) => {
        process.env.PIXABAY_API_KEY = env.PIXABAY_API_KEY;
        req.url = '/api/pixabay' + (req.url === '/' ? '' : req.url);
        pixabay(req, res);
      });
      server.middlewares.use('/api/visitors', (req, res) => {
        process.env.DATA_GO_KR_KEY = env.DATA_GO_KR_KEY;
        visitors(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [devApi(env)] };
});
