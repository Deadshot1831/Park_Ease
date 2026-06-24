const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/yashwantyadav/.claude/skills/pptx-official/scripts/html2pptx.js');

const DIR = __dirname;
const SLIDES = path.join(DIR, 'slides');
const ASSETS = path.join(DIR, 'assets');

// ---------- shared styles ----------
const STYLE = `
  html,body{margin:0;padding:0}
  body{width:720pt;height:405pt;background:#0a0a12;font-family:Arial,Helvetica,sans-serif;color:#e8e8f0;display:flex}
  .root{width:720pt;height:405pt;box-sizing:border-box;padding:30pt 40pt;display:flex;flex-direction:column}
  h1,h2,h3,h4,p,ul,li{margin:0;padding:0}
  .kicker{color:#c084fc;font-size:11pt;font-weight:bold;letter-spacing:2.4pt}
  .h{color:#ffffff;font-size:27pt;font-weight:bold;margin-top:8pt}
  .sub{color:#9aa0b5;font-size:12.5pt;margin-top:7pt;line-height:1.45}
  .muted{color:#9aa0b5}
  .acc{color:#c084fc}
  .pink{color:#e879f9}
  li{color:#cfd0db;font-size:12.5pt;line-height:1.7}
  .num{color:#e879f9;font-weight:bold}
  .foot{color:#5b5f73;font-size:8pt;margin-top:auto}
`;

const bar = `<img src="${path.join(ASSETS, 'gradbar.png')}" style="width:90pt;height:5pt;margin-top:10pt" />`;

// Presenter-facing speaker notes per slide
const NOTES = {
  title: "Open with energy. ParkEase is a smart-parking platform that lets drivers find and reserve a guaranteed spot before they arrive. Frame it as solving a daily, universal pain in Indian cities — then move quickly into the problem.",
  problem: "Set the scene: vehicle ownership is booming but parking information hasn't kept up. Drivers waste 15–20 minutes per trip and often park illegally out of desperation. Land the emotional hook before showing the hard numbers.",
  numbers: "Hit the headline stats hard, pausing after each. 8 crore+ traffic challans a year nationally; Noida alone issued ~2.7 lakh illegal-parking challans in a single year; Delhi issues ~65,000 a month — roughly 7.8 lakh a year. Note: cite official/press sources (see the appendix) before presenting.",
  cost: "Reframe the cost. It isn't just the fine — parking search drives an estimated ~30% of urban congestion, wastes fuel and raises emissions. Make it a societal problem, not just an individual inconvenience.",
  solution: "Introduce ParkEase as the fix: one live map aggregating commercial lots, street and private spaces. Two sides of the marketplace — drivers reserve and pay ahead; owners monetise space they already own. Emphasise it's asset-light.",
  how: "Walk the simple four-step flow and stress it takes under a minute with a guaranteed spot. Real-time availability over WebSockets means what the driver sees is actually free right now.",
  features: "Stress that this is a working, full-stack platform — not a mockup. Call out the differentiators: real payments via Razorpay, live monitoring with Park.Guard, verified (booking-gated) reviews, and the built-in AI assistant.",
  impact: "Quantify the upside. ~17 minutes saved per trip; at 1M users and two trips a day that's roughly 570,000 driver-hours saved every day. Fewer cars circling means fewer illegal-parking fines and less congestion. Flag the chart as an illustrative model.",
  market: "Size the prize: 350M+ registered vehicles, 500M+ urban residents, and rising smartphone/UPI adoption. Even a small share is a large business. Flag the growth curve as illustrative — swap in a sourced market report for fundraising.",
  model: "Explain the economics: commission per booking is the core revenue, plus owner subscriptions and featured listings, a share of dynamic/surge pricing, and partnerships (EV, insurance). Multiple streams, asset-light.",
  why: "Summarise the edge — aggregation + real-time + secure payments + monitoring + AI in a single product — then paint the roadmap: AI availability prediction, dynamic pricing, EV/IoT integration, native mobile apps and city partnerships.",
  compare: "This is the 'why us' proof. Maps/search apps show some parking but can't guarantee or book a spot. Existing parking apps book commercial lots but rarely cover street + private spaces, owner tools, in-booking monitoring or an AI assistant. ParkEase does all of it in one platform — walk down the ParkEase column of green checks.",
  closing: "End on the vision and a clear ask. 'Park with certainty, arrive with ease.' State exactly what you're seeking — a pilot, a partnership, mentorship, or funding — and invite questions.",
  sources: "Backup/appendix slide. Use it to answer 'where did these numbers come from?'. Replace each placeholder with the exact primary citation (with year and link) before you present.",
};

function page(inner, n) {
  const pageNo = n ? `<p style="position:absolute"></p>` : '';
  return `<!DOCTYPE html><html><head><style>${STYLE}</style></head><body><div class="root">${inner}${pageNo}</div></body></html>`;
}

// stat card
function stat(num, label, w = 196) {
  return `<div style="width:${w}pt;background:#15131f;border-left:5px solid #a855f7;border-radius:9pt;padding:15pt;box-sizing:border-box;margin-right:11pt">
    <h2 style="color:#e879f9;font-size:30pt;font-weight:bold">${num}</h2>
    <p style="color:#aab0c2;font-size:11pt;margin-top:6pt;line-height:1.35">${label}</p>
  </div>`;
}
function featureCard(title, body, w = 196) {
  return `<div style="width:${w}pt;background:#141320;border:1px solid #262438;border-radius:10pt;padding:13pt;box-sizing:border-box;margin:0 9pt 9pt 0">
    <h3 style="color:#ffffff;font-size:13pt;font-weight:bold">${title}</h3>
    <p style="color:#9aa0b5;font-size:10pt;margin-top:5pt;line-height:1.4">${body}</p>
  </div>`;
}

// ---------- slides ----------
const slides = [];

// 1. TITLE
slides.push({ name: 'title', html: page(`
  <div style="display:flex;flex-direction:column;justify-content:center;height:345pt">
    <p class="kicker">SMART PARKING &middot; RESERVED IN ADVANCE</p>
    <h1 style="color:#ffffff;font-size:62pt;font-weight:bold;margin-top:14pt">Park<span style="color:#c084fc">Ease</span></h1>
    <img src="${path.join(ASSETS, 'gradbar.png')}" style="width:150pt;height:6pt;margin-top:14pt" />
    <p style="color:#c6c8d4;font-size:16pt;margin-top:18pt;max-width:540pt;line-height:1.5">Find, compare and book a guaranteed parking spot near you &mdash; ending the daily hunt for parking in India&rsquo;s cities.</p>
    <p style="color:#6b7088;font-size:11pt;margin-top:26pt">Pitch Deck &middot; 2026 &nbsp;|&nbsp; MERN Web Platform</p>
  </div>
`) });

// 2. PROBLEM intro
slides.push({ name: 'problem', html: page(`
  <p class="kicker">THE PROBLEM</p>
  <h2 class="h">India is running out of places to park.</h2>
  ${bar}
  <p class="sub" style="max-width:600pt">Vehicle ownership is exploding, but parking infrastructure and information haven&rsquo;t kept up. Drivers circle endlessly, park illegally out of desperation, and pay the price &mdash; in time, fuel, fines, and frustration.</p>
  <div style="display:flex;margin-top:20pt">
    ${stat('350M+', 'registered vehicles in India &mdash; and rising fast')}
    ${stat('15&ndash;20 min', 'average time wasted searching for a spot per trip')}
    ${stat('#1', 'improper parking is among the most common traffic violations')}
  </div>
  <p class="foot">Figures are from publicly reported sources; verify and cite live sources before publishing.</p>
`) });

// 3. THE NUMBERS (challans)
slides.push({ name: 'numbers', html: page(`
  <p class="kicker">THE NUMBERS</p>
  <h2 class="h">Improper parking, by the figures.</h2>
  ${bar}
  <div style="display:flex;margin-top:22pt">
    ${stat('8 Cr+', 'traffic challans issued across India every year')}
    ${stat('2.7 lakh', 'illegal-parking challans in Noida in a single year')}
    ${stat('~65,000', 'illegal-parking challans issued in Delhi every month')}
  </div>
  <p class="sub" style="margin-top:20pt;max-width:610pt">That&rsquo;s roughly <span class="num">7.8 lakh</span> parking challans a year in Delhi alone. Behind every fine is a driver who simply couldn&rsquo;t find a legal place to park.</p>
  <p class="foot">Reported figures (Noida Traffic Police / Delhi Traffic Police, press reports). Confirm exact numbers and citations before public use.</p>
`) });

// 4. HIDDEN COST
slides.push({ name: 'cost', html: page(`
  <p class="kicker">THE HIDDEN COST</p>
  <h2 class="h">Every wasted minute adds up.</h2>
  ${bar}
  <div style="display:flex;margin-top:22pt">
    ${stat('30%', 'of urban traffic congestion is linked to drivers hunting for parking')}
    ${stat('Wasted fuel', 'circling burns fuel and money on every single trip')}
    ${stat('More CO&#8322;', 'needless idling and driving raises emissions in dense cities')}
  </div>
  <p class="sub" style="margin-top:20pt;max-width:610pt">The cost isn&rsquo;t just the fine. It&rsquo;s lost time, fuel, pollution, road rage and clogged streets &mdash; a tax paid by every driver, every day.</p>
  <p class="foot">Congestion share attributable to parking search is an industry-cited estimate; verify before publishing.</p>
`) });

// 5. SOLUTION
slides.push({ name: 'solution', html: page(`
  <p class="kicker">THE SOLUTION</p>
  <h2 class="h">ParkEase &mdash; a guaranteed spot, before you arrive.</h2>
  ${bar}
  <p class="sub" style="max-width:620pt">A web platform that aggregates commercial lots, street parking and private spaces onto one live map &mdash; so drivers reserve and pay in advance, and owners earn from space they already have.</p>
  <div style="display:flex;margin-top:20pt">
    <div style="width:300pt;background:#15131f;border:1px solid #2a2740;border-radius:11pt;padding:16pt;box-sizing:border-box;margin-right:14pt">
      <h3 style="color:#c084fc;font-size:14pt;font-weight:bold">For Drivers</h3>
      <ul style="margin-top:8pt;padding-left:14pt">
        <li>See real-time availability on a map</li>
        <li>Reserve &amp; pay &mdash; spot held before arrival</li>
        <li>QR-pass entry, receipts, reviews</li>
      </ul>
    </div>
    <div style="width:300pt;background:#15131f;border:1px solid #2a2740;border-radius:11pt;padding:16pt;box-sizing:border-box">
      <h3 style="color:#c084fc;font-size:14pt;font-weight:bold">For Owners</h3>
      <ul style="margin-top:8pt;padding-left:14pt">
        <li>List a lot or driveway in minutes</li>
        <li>Set pricing, manage availability</li>
        <li>Track bookings &amp; revenue live</li>
      </ul>
    </div>
  </div>
`) });

// 6. HOW IT WORKS
slides.push({ name: 'how', html: page(`
  <p class="kicker">HOW IT WORKS</p>
  <h2 class="h">From hunting to parked &mdash; in four steps.</h2>
  ${bar}
  <div style="display:flex;margin-top:24pt">
    ${stat('1', 'Find &mdash; open the live map &amp; filter by price, type, EV &amp; amenities', 148)}
    ${stat('2', 'Reserve &mdash; pick your time &amp; vehicle; the spot is held for you', 148)}
    ${stat('3', 'Pay &mdash; securely via Razorpay (UPI, cards, wallets)', 148)}
    ${stat('4', 'Park &mdash; arrive, scan your QR pass, done', 148)}
  </div>
  <p class="sub" style="margin-top:22pt;max-width:600pt">Live availability updates instantly over WebSockets, so what you see is what&rsquo;s actually free.</p>
`) });

// 7. FEATURES
slides.push({ name: 'features', html: page(`
  <p class="kicker">THE PRODUCT</p>
  <h2 class="h">Built like a real platform, not a demo.</h2>
  ${bar}
  <div style="display:flex;flex-wrap:wrap;margin-top:16pt">
    ${featureCard('Real-time map', 'Live availability with color-coded pins over WebSockets.')}
    ${featureCard('Guaranteed booking', 'Reserve ahead with a scannable QR pass &amp; PDF receipt.')}
    ${featureCard('Secure payments', 'Razorpay &mdash; UPI, cards, wallets, refunds &amp; webhooks.')}
    ${featureCard('Park.Guard monitor', 'Live CCTV &amp; impact alerts for your active booking.')}
    ${featureCard('Verified reviews', 'Only real customers who booked can rate a spot.')}
    ${featureCard('AI assistant', 'A built-in chatbot answers parking &amp; booking queries.')}
  </div>
`) });

// 8. IMPACT (chart)
slides.push({ name: 'impact', html: page(`
  <p class="kicker">THE IMPACT</p>
  <h2 class="h">Time saved, fines avoided, cities unclogged.</h2>
  ${bar}
  <div style="display:flex;margin-top:14pt">
    <div style="width:250pt;display:flex;flex-direction:column">
      <p class="sub" style="margin-top:4pt">By guiding drivers straight to a legal, reserved bay, ParkEase removes the circling that wastes time and triggers illegal-parking fines.</p>
      <div style="margin-top:12pt">${stat('~17 min', 'saved per trip, per driver', 230)}</div>
    </div>
    <div id="impact" class="placeholder" style="width:330pt;height:235pt;background:#15131f;margin-left:12pt;border-radius:10pt"></div>
  </div>
  <p class="foot">Illustrative projection: users &times; 2 trips/day &times; 17 min saved. For modelling only.</p>
`) });

// 9. MARKET (chart)
slides.push({ name: 'market', html: page(`
  <p class="kicker">THE OPPORTUNITY</p>
  <h2 class="h">A large, fast-growing market.</h2>
  ${bar}
  <div style="display:flex;margin-top:14pt">
    <div style="width:250pt;display:flex;flex-direction:column">
      <ul style="margin-top:6pt;padding-left:14pt">
        <li><span class="num">350M+</span> registered vehicles nationwide</li>
        <li><span class="num">500M+</span> people living in urban India</li>
        <li>Smart-parking adoption rising with UPI &amp; smartphones</li>
      </ul>
      <p class="sub" style="margin-top:10pt">Even a sliver of urban drivers is a multi-crore opportunity.</p>
    </div>
    <div id="market" class="placeholder" style="width:330pt;height:235pt;background:#15131f;margin-left:12pt;border-radius:10pt"></div>
  </div>
  <p class="foot">Market-size curve is illustrative (indicative CAGR); replace with sourced figures before fundraising.</p>
`) });

// 10. BUSINESS MODEL (pie)
slides.push({ name: 'model', html: page(`
  <p class="kicker">BUSINESS MODEL</p>
  <h2 class="h">Multiple ways to earn.</h2>
  ${bar}
  <div style="display:flex;margin-top:14pt">
    <div style="width:250pt;display:flex;flex-direction:column">
      <ul style="margin-top:6pt;padding-left:14pt">
        <li>Commission on every booking</li>
        <li>Owner subscriptions &amp; featured listings</li>
        <li>Dynamic / surge pricing share</li>
        <li>Ads &amp; partnerships (EV, insurance)</li>
      </ul>
      <p class="sub" style="margin-top:10pt">Asset-light: we monetise spaces that already exist.</p>
    </div>
    <div id="model" class="placeholder" style="width:330pt;height:235pt;background:#15131f;margin-left:12pt;border-radius:10pt"></div>
  </div>
`) });

// 11. WHY US / ROADMAP
slides.push({ name: 'why', html: page(`
  <p class="kicker">WHY PARKEASE</p>
  <h2 class="h">Edge today, vision for tomorrow.</h2>
  ${bar}
  <div style="display:flex;margin-top:18pt">
    <div style="width:300pt;background:#15131f;border:1px solid #2a2740;border-radius:11pt;padding:16pt;box-sizing:border-box;margin-right:14pt">
      <h3 style="color:#c084fc;font-size:13pt;font-weight:bold">Our edge</h3>
      <ul style="margin-top:8pt;padding-left:14pt">
        <li>Aggregates lots, street &amp; private spaces in one app</li>
        <li>Real-time, secure payments &amp; monitoring built in</li>
        <li>Verified reviews &amp; an AI assistant</li>
      </ul>
    </div>
    <div style="width:300pt;background:#15131f;border:1px solid #2a2740;border-radius:11pt;padding:16pt;box-sizing:border-box">
      <h3 style="color:#c084fc;font-size:13pt;font-weight:bold">What&rsquo;s next</h3>
      <ul style="margin-top:8pt;padding-left:14pt">
        <li>AI availability prediction &amp; dynamic pricing</li>
        <li>EV-charging &amp; IoT sensor integration</li>
        <li>Native mobile apps &amp; city partnerships</li>
      </ul>
    </div>
  </div>
`) });

// 11b. HOW WE COMPARE
slides.push({ name: 'compare', html: page(`
  <p class="kicker">HOW WE COMPARE</p>
  <h2 class="h">Better than what&rsquo;s out there today.</h2>
  ${bar}
  <div id="compare" class="placeholder" style="width:640pt;height:248pt;background:#0a0a12;margin-top:12pt"></div>
  <p class="foot">Compared by capability category (typical maps/search apps and existing parking apps) &mdash; not a claim about any specific named product.</p>
`) });

// 12. CLOSING
slides.push({ name: 'closing', html: page(`
  <div style="display:flex;flex-direction:column;justify-content:center;height:345pt">
    <p class="kicker">THE VISION</p>
    <h1 style="color:#ffffff;font-size:40pt;font-weight:bold;margin-top:12pt;line-height:1.15">Park with certainty.<br/><span style="color:#c084fc">Arrive with ease.</span></h1>
    <img src="${path.join(ASSETS, 'gradbar.png')}" style="width:150pt;height:6pt;margin-top:16pt" />
    <p style="color:#c6c8d4;font-size:14pt;margin-top:18pt;max-width:560pt;line-height:1.5">ParkEase turns wasted minutes and avoidable fines into a single tap &mdash; making India&rsquo;s cities move a little more smoothly.</p>
    <p style="color:#8b8fa6;font-size:12pt;margin-top:24pt">Thank you. &nbsp; Let&rsquo;s build the future of parking.</p>
    <p class="foot" style="margin-top:18pt">All statistics are reported/illustrative figures included for discussion; verify and cite primary sources before any public or investor use.</p>
  </div>
`) });

// 13. SOURCES / APPENDIX
function srcRow(claim, src) {
  return `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #211f30;padding:7pt 0">
    <p style="color:#d3d4de;font-size:10.5pt;width:330pt">${claim}</p>
    <p style="color:#8b8fa6;font-size:10pt;width:280pt;text-align:right">${src}</p>
  </div>`;
}
slides.push({ name: 'sources', html: page(`
  <p class="kicker">APPENDIX</p>
  <h2 class="h">Sources &amp; notes.</h2>
  ${bar}
  <div style="margin-top:14pt">
    ${srcRow('8 Cr+ traffic challans / year (India)', 'NCRB / MoRTH / national press reports')}
    ${srcRow('2.7 lakh illegal-parking challans, Noida (1 year)', 'Noida Traffic Police / press reports')}
    ${srcRow('~65,000 illegal-parking challans / month, Delhi', 'Delhi Traffic Police / press reports')}
    ${srcRow('350M+ registered vehicles in India', 'MoRTH &ldquo;Vahan&rdquo; / Road Transport Yearbook')}
    ${srcRow('15&ndash;20 min wasted searching for parking', 'INRIX parking study / industry research')}
    ${srcRow('~30% of urban congestion from parking search', 'INRIX / academic research (e.g. D. Shoup)')}
    ${srcRow('Market size &amp; revenue mix', 'Illustrative &mdash; replace with a market report')}
  </div>
  <p class="foot">Figures are reported or illustrative and included for discussion. Confirm exact numbers and add primary citations (with year &amp; link) before any public or investor use.</p>
`) });

// ---------- generate assets ----------
async function makeAssets() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const grad = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="20">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="55%" stop-color="#a855f7"/><stop offset="100%" stop-color="#d946ef"/>
    </linearGradient></defs><rect width="600" height="20" rx="10" fill="url(#g)"/></svg>`;
  await sharp(Buffer.from(grad)).png().toFile(path.join(ASSETS, 'gradbar.png'));
}

// ---------- build ----------
async function build() {
  await makeAssets();
  fs.mkdirSync(SLIDES, { recursive: true });

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'ParkEase';
  pptx.title = 'ParkEase — Smart Parking Finder & Booking Platform';

  const VIOLET = ['a855f7', 'd946ef', '7c3aed', '8b5cf6', '60a5fa'];

  for (const s of slides) {
    const file = path.join(SLIDES, `${s.name}.html`);
    fs.writeFileSync(file, s.html);
    const { slide, placeholders } = await html2pptx(file, pptx);
    if (NOTES[s.name]) slide.addNotes(NOTES[s.name]);

    if (s.name === 'impact' && placeholders[0]) {
      slide.addChart(pptx.charts.BAR, [{
        name: 'Driver-hours saved / day',
        labels: ['0.1M users', '0.5M users', '1M users'],
        values: [56667, 283333, 566667],
      }], {
        ...placeholders[0], barDir: 'col', showTitle: true, title: 'Driver-hours saved per day (at scale)',
        titleColor: 'e8e8f0', titleFontSize: 11, showLegend: false,
        showValAxisTitle: false, showCatAxisTitle: false,
        catAxisLabelColor: 'aab0c2', valAxisLabelColor: 'aab0c2', catAxisLabelFontSize: 9, valAxisLabelFontSize: 8,
        valAxisMinVal: 0, valAxisMaxVal: 600000, valAxisMajorUnit: 150000,
        chartColors: ['a855f7'], dataLabelColor: 'ffffff', dataLabelFontSize: 8, showValue: true, dataLabelPosition: 'outEnd',
        chartColorsOpacity: 100, plotArea: { fill: { color: '15131f' } }, fill: '15131f',
      });
    }
    if (s.name === 'market' && placeholders[0]) {
      slide.addChart(pptx.charts.LINE, [{
        name: 'India smart-parking market (illustrative)',
        labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
        values: [100, 117, 137, 160, 187, 219, 256],
      }], {
        ...placeholders[0], lineSize: 3, lineSmooth: true, showTitle: true,
        title: 'Market size index (2024 = 100, ~16% CAGR, illustrative)',
        titleColor: 'e8e8f0', titleFontSize: 10, showLegend: false,
        catAxisLabelColor: 'aab0c2', valAxisLabelColor: 'aab0c2', catAxisLabelFontSize: 9, valAxisLabelFontSize: 8,
        valAxisMinVal: 0, valAxisMaxVal: 300, valAxisMajorUnit: 100,
        chartColors: ['d946ef'], lineDataSymbol: 'circle', lineDataSymbolSize: 5,
      });
    }
    if (s.name === 'compare' && placeholders[0]) {
      const ph = placeholders[0];
      const mark = (sym) => ({
        text: sym,
        options: { align: 'center', bold: true, color: sym === '✓' ? '34d399' : sym === '✗' ? 'fb7185' : 'fbbf24' },
      });
      const pe = (sym) => ({ text: sym, options: { align: 'center', bold: true, color: '34d399', fill: { color: '20143a' } } });
      const cap = (t) => ({ text: t, options: { align: 'left', color: 'e8e8f0' } });
      const hCell = (t, fill, al) => ({ text: t, options: { fill: { color: fill }, color: 'FFFFFF', bold: true, align: al || 'center' } });

      const rows = [
        ['Live, real-time availability', '~', '✓'],
        ['Guaranteed reservation (spot held)', '✗', '✓'],
        ['Book & pay in advance (UPI / cards)', '✗', '✓'],
        ['Lots + street + private spaces', '~', '~'],
        ['Owner self-listing & revenue tools', '✗', '~'],
        ['In-booking security monitoring', '✗', '✗'],
        ['Verified, booking-gated reviews', '~', '✗'],
        ['AI assistant + EV / amenity filters', '~', '✗'],
      ];
      const tableData = [
        [hCell('Capability', '241f33', 'left'), hCell('Maps / search apps', '241f33'), hCell('Existing parking apps', '241f33'), hCell('ParkEase', 'a855f7')],
        ...rows.map(([c, m1, m2]) => [cap(c), mark(m1), mark(m2), pe('✓')]),
      ];
      slide.addTable(tableData, {
        x: ph.x, y: ph.y, w: ph.w, h: ph.h,
        colW: [ph.w * 0.37, ph.w * 0.225, ph.w * 0.225, ph.w * 0.18],
        rowH: [0.42, ...Array(8).fill(0.355)],
        fontFace: 'Arial', fontSize: 10.5, valign: 'middle',
        color: 'e8e8f0', fill: { color: '15131f' },
        border: { type: 'solid', pt: 0.5, color: '2a2740' },
      });
    }
    if (s.name === 'model' && placeholders[0]) {
      slide.addChart(pptx.charts.PIE, [{
        name: 'Revenue mix',
        labels: ['Booking commission', 'Owner subscriptions', 'Dynamic pricing', 'Ads & partnerships'],
        values: [55, 25, 12, 8],
      }], {
        ...placeholders[0], showPercent: true, showLegend: true, legendPos: 'b', legendColor: 'cfd0db', legendFontSize: 9,
        dataLabelColor: 'ffffff', dataLabelFontSize: 9, chartColors: VIOLET,
        showTitle: true, title: 'Illustrative revenue mix', titleColor: 'e8e8f0', titleFontSize: 11,
      });
    }
  }

  const out = path.join('/Users/yashwantyadav/Desktop/Parking_assist', 'ParkEase-Pitch-Deck.pptx');
  await pptx.writeFile({ fileName: out });
  console.log('✅ wrote', out);
}

build().catch((e) => { console.error(e); process.exit(1); });
