// Vercel 서버리스 함수: Pixabay API 키를 브라우저에 노출하지 않으려고 서버에서 대신 호출합니다.
export default async function handler(req, res) {
  const send = (code, body, cache) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (cache) res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.end(JSON.stringify(body));
  };

  const key = process.env.PIXABAY_API_KEY;
  if (!key) return send(500, { error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았어요.' });

  const params = new URL(req.url, 'http://localhost').searchParams;
  const q = (params.get('q') || 'jeju island').slice(0, 100);
  const n = Math.min(Math.max(Number(params.get('n')) || 5, 3), 20);

  const url =
    `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}` +
    `&image_type=photo&orientation=horizontal&safesearch=true&per_page=${n}`;

  try {
    const r = await fetch(url);
    if (!r.ok) return send(r.status, { error: `Pixabay 응답 오류 (${r.status})` });
    const d = await r.json();
    const hits = (d.hits || []).map(h => ({
      id: h.id,
      thumb: h.webformatURL,
      large: h.largeImageURL,
      tags: h.tags,
      user: h.user,
      page: h.pageURL,
    }));
    return send(200, { hits }, true);
  } catch (e) {
    return send(502, { error: 'Pixabay에 연결하지 못했어요.' });
  }
}
