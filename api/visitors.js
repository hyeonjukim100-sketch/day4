// Vercel 서버리스 함수: 공공데이터포털 인증키를 브라우저에 노출하지 않으려고 서버에서 대신 호출합니다.
// 제주특별자치도 서귀포시_직영관광지 관람객수 추이 (odcloud 15125100)
export default async function handler(req, res) {
  const send = (code, body, cache) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (cache) res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.end(JSON.stringify(body));
  };

  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return send(500, { error: 'DATA_GO_KR_KEY 환경변수가 설정되지 않았어요.' });

  const url = new URL('https://api.odcloud.kr/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca');
  url.search = new URLSearchParams({ serviceKey: key, page: '1', perPage: '200', returnType: 'JSON' });

  try {
    const r = await fetch(url);
    if (!r.ok) return send(r.status, { error: `공공데이터포털 응답 오류 (${r.status})` });
    const d = await r.json();
    send(200, { data: d.data || [] }, true);
  } catch (e) {
    send(502, { error: '공공데이터포털 호출에 실패했어요.' });
  }
}
