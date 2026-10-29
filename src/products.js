// 제주 기념품 (가격은 임의로 정한 예시 값입니다)
export const PRODUCTS = [
  { id: 'hallabong-box',   emoji: '🍊', name: '한라봉 선물세트 3kg',     price: 28000, q: 'hallabong orange',   desc: '새콤달콤 과즙이 가득한 제주 한라봉.' },
  { id: 'tangerine-choco', emoji: '🍫', name: '감귤 초콜릿',             price: 9500,  q: 'orange chocolate',   desc: '감귤 향이 은은한 한 입 초콜릿.' },
  { id: 'harubang-mini',   emoji: '🗿', name: '돌하르방 미니어처',       price: 12000, q: 'jeju stone statue',  desc: '책상 위를 지켜 주는 귀여운 수호신.' },
  { id: 'canola-honey',    emoji: '🍯', name: '유채꿀 300g',             price: 18000, q: 'honey jar',          desc: '제주 유채꽃에서 모은 진한 꿀.' },
  { id: 'green-tea',       emoji: '🍵', name: '제주 녹차 티백 세트',     price: 15000, q: 'green tea',          desc: '오설록 스타일 은은한 햇녹차 20입.' },
  { id: 'black-pork-jerky',emoji: '🥓', name: '흑돼지 육포',             price: 13500, q: 'beef jerky',         desc: '짭짤고소 여행 간식.' },
  { id: 'camellia-soap',   emoji: '🌺', name: '동백 천연비누',           price: 8000,  q: 'camellia flower',    desc: '동백오일로 만든 부드러운 비누.' },
  { id: 'lava-mug',        emoji: '☕', name: '현무암 감성 머그컵',      price: 16000, q: 'ceramic mug',        desc: '화산석 질감을 닮은 도자기 머그.' },
  { id: 'haenyeo-tote',    emoji: '👜', name: '해녀 에코백',             price: 14000, q: 'canvas tote bag',    desc: '해녀 일러스트가 그려진 캔버스 가방.' },
  { id: 'jeju-postcard',   emoji: '💌', name: '제주 풍경 엽서 12장',     price: 6000,  q: 'postcard',           desc: '한라산부터 성산까지, 풍경을 담은 엽서.' },
];

export const won = n => n.toLocaleString('ko-KR') + '원';
