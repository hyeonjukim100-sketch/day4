# 혼저옵서예 제주 (Vite + Supabase + Pixabay)

제주도 소개 사이트. Supabase 이메일 회원가입/로그인, 명소 ♥ 찜하기, Pixabay 이미지.

## 폴더 구조
- `index.html`, `src/` : Vite 프론트엔드 (바닐라 JS)
- `api/pixabay.js` : Vercel 서버리스 함수 (Pixabay 키를 서버에서만 사용)
- `supabase/schema.sql` : 찜하기 테이블 + RLS 정책

## 환경변수

| 이름 | 어디서 얻나 | 비고 |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | 공개돼도 OK |
| `VITE_SUPABASE_ANON_KEY` | 같은 화면의 anon(publishable) 키 | service_role 키 금지 |
| `PIXABAY_API_KEY` | https://pixabay.com/api/docs/ (로그인 후 Parameters에 표시) | `VITE_` 없이! 서버 전용 |

## 로컬 실행
```bash
cd jeju-site
cp .env.example .env   # 값 채우기
npm install
npm run dev
```

## Vercel 배포
1. Vercel → Add New → Project → GitHub 저장소 Import
2. **Root Directory** 를 `jeju-site` 로 지정 (Framework: Vite 자동 인식)
3. Environment Variables 에 위 3개 등록 → Deploy
4. Supabase → Authentication → URL Configuration 에 배포 주소를 **Site URL** 로 설정하고 Redirect URLs 에도 추가
