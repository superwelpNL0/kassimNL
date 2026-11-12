// Haalt volgersaantallen op en schrijft stats.json. Bij een mislukte bron blijft de oude waarde staan.
import fs from 'node:fs/promises';

const YT_CHANNEL_ID = 'UC0f7U09e-pdd_BieALVG2LA';
const TT_USER = 'kassim.nl';
const TW_LOGIN = 'kassimnl';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const get = (url, headers = {}) =>
  fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', ...headers }, signal: AbortSignal.timeout(20000) })
    .then((r) => { if (!r.ok) throw new Error(r.status + ' ' + url); return r; });

// "1.23K" / "4,5 M" / "12K" -> getal
function parseShort(num, suf) {
  let n = parseFloat(String(num).replace(',', '.'));
  const m = { K: 1e3, M: 1e6, B: 1e9 }[(suf || '').toUpperCase()] || 1;
  return Math.round(n * m);
}

async function youtube() {
  if (process.env.YT_API_KEY) {
    try {
      const j = await (await get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${process.env.YT_API_KEY}`)).json();
      const n = Number(j.items?.[0]?.statistics?.subscriberCount);
      if (Number.isFinite(n)) return n;
    } catch (e) { console.warn('YouTube API:', e.message); }
  }
  try {
    const html = await (await get(`https://www.youtube.com/channel/${YT_CHANNEL_ID}`, { Cookie: 'CONSENT=YES+1; SOCS=CAI' })).text();
    const m = html.match(/([\d.,]+)\s*([KMB])?\s*subscribers/i);
    if (m) return parseShort(m[1], m[2]);
  } catch (e) { console.warn('YouTube scrape:', e.message); }
  return null;
}

async function tiktok() {
  try {
    const html = await (await get(`https://www.tiktok.com/@${TT_USER}`)).text();
    const m = html.match(/"followerCount":(\d+)/);
    if (m) return Number(m[1]);
  } catch (e) { console.warn('TikTok:', e.message); }
  return null;
}

async function twitch() {
  try {
    const t = (await (await get(`https://decapi.me/twitch/followcount/${TW_LOGIN}`)).text()).trim();
    if (/^\d+$/.test(t)) return Number(t);
  } catch (e) { console.warn('Twitch:', e.message); }
  return null;
}

let prev = {};
try { prev = JSON.parse(await fs.readFile('stats.json', 'utf8')); } catch {}

const [yt, tk, tw] = await Promise.all([youtube(), tiktok(), twitch()]);
const next = {
  updated: new Date().toISOString(),
  yt: yt ?? prev.yt ?? null,
  tk: tk ?? prev.tk ?? null,
  tw: tw ?? prev.tw ?? null,
};
await fs.writeFile('stats.json', JSON.stringify(next, null, 2) + '\n');
console.log(next);
