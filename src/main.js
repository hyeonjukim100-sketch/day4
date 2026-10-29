import './style.css';
import { supabase } from './supabase.js';
import { SPOTS } from './spots.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let user = null;
let favs = new Set();
let onlyFavs = false;
const images = {}; // spot.id -> {thumb,large,user,page}
let hero = null;

// ---------- Pixabay (서버리스 함수 경유) ----------
async function fetchImages(q, n = 5) {
  const ck = 'pix:' + q;
  try { const c = sessionStorage.getItem(ck); if (c) return JSON.parse(c); } catch {}
  const r = await fetch(`/api/pixabay?q=${encodeURIComponent(q)}&n=${n}`);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || '이미지를 불러오지 못했어요');
  const hits = (await r.json()).hits;
  try { sessionStorage.setItem(ck, JSON.stringify(hits)); } catch {}
  return hits;
}

async function loadImages() {
  try {
    const h = await fetchImages('jeju island sea', 10);
    hero = h[Math.floor(Math.random() * Math.min(h.length, 5))] || null;
  } catch (e) { toast(e.message); }
  await Promise.all(SPOTS.map(async s => {
    try {
      let hits = await fetchImages(s.q, 5);
      if (!hits.length) hits = await fetchImages('jeju', 5);
      images[s.id] = hits[0];
    } catch {}
  }));
  renderHero(); renderSpots();
}

// ---------- 화면 뼈대 ----------
$('#app').innerHTML = `
  ${supabase ? '' : '<div class="warn">⚠️ Supabase 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)가 설정되지 않아 로그인 기능이 꺼져 있어요.</div>'}
  <header class="top">
    <a class="logo" href="#">🍊 혼저옵서예 <b>제주</b></a>
    <nav>
      <a href="#spots">명소</a>
      <a href="#about">제주 이야기</a>
      <a href="/previous.html">🎮 이전 작품</a>
    </nav>
    <div id="auth-area"></div>
  </header>
  <section class="hero" id="hero">
    <div class="hero-inner">
      <p class="eyebrow">JEJU ISLAND</p>
      <h1>바람과 돌, 그리고 바다<br />제주에 오신 걸 환영해요</h1>
      <p>마음에 드는 명소는 ♥ 로 찜해 두세요. 로그인하면 나만의 제주 목록이 생겨요.</p>
      <a class="btn big" href="#spots">명소 둘러보기 ↓</a>
    </div>
    <span class="credit" id="hero-credit"></span>
  </section>
  <main>
    <section id="spots" class="wrap">
      <div class="sec-head">
        <h2>제주 대표 명소</h2>
        <button id="fav-filter" class="chip">♥ 내 찜만 보기</button>
      </div>
      <div id="grid" class="grid"></div>
    </section>
    <section id="about" class="wrap about">
      <h2>제주 이야기</h2>
      <div class="about-grid">
        <div><span>🌋</span><h3>화산섬</h3><p>한라산과 368개의 오름, 용암동굴까지. 제주는 화산이 만든 섬이에요. 유네스코 세계자연유산이기도 해요.</p></div>
        <div><span>👩‍🌾</span><h3>해녀 문화</h3><p>숨을 참고 바다에 들어가 해산물을 따는 해녀. 제주 해녀 문화는 유네스코 인류무형문화유산이에요.</p></div>
        <div><span>🗣️</span><h3>제주 방언</h3><p>"혼저 옵서예"는 어서 오세요, "폭삭 속았수다"는 수고 많으셨어요라는 뜻이에요.</p></div>
      </div>
    </section>
  </main>
  <footer>
    <p>제주 소개 사이트 · 사진 제공 <a href="https://pixabay.com" target="_blank" rel="noopener">Pixabay</a></p>
  </footer>
  <div id="modal-root"></div>
  <div id="toast"></div>
`;

// ---------- 렌더링 ----------
function renderHero() {
  if (!hero) return;
  $('#hero').style.backgroundImage = `linear-gradient(rgba(10,40,60,.35), rgba(10,40,60,.6)), url("${hero.large}")`;
  $('#hero-credit').innerHTML = `Photo by <a href="${esc(hero.page)}" target="_blank" rel="noopener">${esc(hero.user)}</a> / Pixabay`;
}

function renderSpots() {
  const list = SPOTS.filter(s => !onlyFavs || favs.has(s.id));
  $('#grid').innerHTML = list.length ? list.map(s => {
    const im = images[s.id];
    return `
    <article class="card">
      <div class="img" style="${im ? `background-image:url('${esc(im.thumb)}')` : ''}">
        <span class="tag">${s.tag}</span>
        <button class="heart ${favs.has(s.id) ? 'on' : ''}" data-id="${s.id}" aria-label="찜하기" title="찜하기">♥</button>
      </div>
      <div class="body">
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        ${im ? `<small>Image by <a href="${esc(im.page)}" target="_blank" rel="noopener">${esc(im.user)}</a> from Pixabay</small>` : '<small>이미지 불러오는 중…</small>'}
      </div>
    </article>`;
  }).join('') : '<p class="empty">아직 찜한 명소가 없어요. ♥ 를 눌러 보세요!</p>';
  const f = $('#fav-filter'); f.classList.toggle('on', onlyFavs);
}

function renderAuth() {
  const a = $('#auth-area');
  if (!supabase) { a.innerHTML = ''; return; }
  if (user) {
    const name = user.user_metadata?.nickname || user.email.split('@')[0];
    a.innerHTML = `<span class="me">🙋 ${esc(name)}님</span><button class="btn ghost" id="logout">로그아웃</button>`;
    $('#logout').onclick = async () => { await supabase.auth.signOut(); toast('로그아웃했어요. 또 만나요!'); };
  } else {
    a.innerHTML = `<button class="btn ghost" id="to-login">로그인</button><button class="btn" id="to-signup">회원가입</button>`;
    $('#to-login').onclick = () => openAuth('login');
    $('#to-signup').onclick = () => openAuth('signup');
  }
}

// ---------- 인증 모달 ----------
function openAuth(mode = 'login') {
  if (!supabase) return toast('Supabase 환경변수를 먼저 설정해 주세요.');
  const isLogin = mode === 'login';
  $('#modal-root').innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="auth-form" novalidate>
        <button type="button" class="x" id="close" aria-label="닫기">✕</button>
        <h2>${isLogin ? '🍊 로그인' : '🌼 회원가입'}</h2>
        ${isLogin ? '' : '<label>닉네임<input name="nickname" maxlength="20" placeholder="예: 제주러버" autocomplete="nickname" /></label>'}
        <label>이메일<input name="email" type="email" required placeholder="you@example.com" autocomplete="email" /></label>
        <label>비밀번호<input name="password" type="password" required minlength="6" placeholder="6자 이상" autocomplete="${isLogin ? 'current-password' : 'new-password'}" /></label>
        <p class="msg" id="msg"></p>
        <button class="btn big full" id="submit">${isLogin ? '로그인' : '가입하기'}</button>
        <p class="switch">${isLogin ? '처음이세요? <a href="#" id="sw">회원가입</a>' : '이미 계정이 있나요? <a href="#" id="sw">로그인</a>'}</p>
      </form>
    </div>`;
  const close = () => { $('#modal-root').innerHTML = ''; };
  $('#close').onclick = close;
  $('#overlay').onclick = e => { if (e.target.id === 'overlay') close(); };
  $('#sw').onclick = e => { e.preventDefault(); openAuth(isLogin ? 'signup' : 'login'); };
  $('#auth-form').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target), email = f.get('email').trim(), password = f.get('password');
    const msg = $('#msg'), btn = $('#submit');
    msg.className = 'msg'; msg.textContent = '';
    if (!email || password.length < 6) { msg.textContent = '이메일과 6자 이상의 비밀번호를 입력해 주세요.'; return; }
    btn.disabled = true;
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        close(); toast('환영해요! 로그인되었어요 🎉');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { nickname: (f.get('nickname') || '').trim() }, emailRedirectTo: location.origin },
        });
        if (error) throw error;
        if (data.session) { close(); toast('가입 완료! 환영해요 🎉'); }
        else { msg.className = 'msg ok'; msg.textContent = '확인 메일을 보냈어요. 메일의 링크를 누르면 가입이 완료돼요. 📧'; }
      }
    } catch (err) { msg.textContent = koError(err); }
    btn.disabled = false;
  };
}

function koError(err) {
  const m = err?.message || '';
  if (/Invalid login credentials/i.test(m)) return '이메일 또는 비밀번호가 맞지 않아요.';
  if (/already registered/i.test(m)) return '이미 가입된 이메일이에요. 로그인해 주세요.';
  if (/Email not confirmed/i.test(m)) return '이메일 인증이 아직이에요. 받은 메일함을 확인해 주세요.';
  if (/Password should be/i.test(m)) return '비밀번호는 6자 이상이어야 해요.';
  if (/rate limit|too many/i.test(m)) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  if (/valid email|invalid format/i.test(m)) return '이메일 형식을 확인해 주세요.';
  return m || '알 수 없는 오류가 발생했어요.';
}

// ---------- 찜하기 ----------
async function loadFavs() {
  favs = new Set();
  if (supabase && user) {
    const { data, error } = await supabase.from('favorites').select('spot_id');
    if (error) toast('찜 목록을 불러오지 못했어요. (supabase/schema.sql 을 실행했는지 확인해 주세요)');
    else favs = new Set(data.map(r => r.spot_id));
  }
  renderSpots();
}

$('#grid').addEventListener('click', async e => {
  const b = e.target.closest('.heart'); if (!b) return;
  if (!user) { toast('로그인하면 찜할 수 있어요 💛'); return openAuth('login'); }
  const id = b.dataset.id, had = favs.has(id);
  had ? favs.delete(id) : favs.add(id); renderSpots(); // 낙관적 업데이트
  const { error } = had
    ? await supabase.from('favorites').delete().eq('spot_id', id)
    : await supabase.from('favorites').insert({ spot_id: id });
  if (error) { had ? favs.add(id) : favs.delete(id); renderSpots(); toast('저장하지 못했어요: ' + error.message); }
});

$('#fav-filter').onclick = () => {
  if (!user) { toast('로그인 후 이용할 수 있어요'); return openAuth('login'); }
  onlyFavs = !onlyFavs; renderSpots();
};

let tt;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200);
}

// ---------- 시작 ----------
renderSpots(); renderAuth(); loadImages();
if (supabase) {
  supabase.auth.getSession().then(({ data }) => { user = data.session?.user ?? null; renderAuth(); loadFavs(); });
  supabase.auth.onAuthStateChange((_ev, session) => {
    const prev = user?.id; user = session?.user ?? null; renderAuth();
    if (prev !== user?.id) { onlyFavs = false; loadFavs(); }
  });
}
