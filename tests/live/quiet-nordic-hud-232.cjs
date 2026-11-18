'use strict';
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const {chromium} = require('playwright-core');

const VIEWPORTS = [
  {name: 'iphone', width: 390, height: 844, insets: {top: 47, left: 0, bottom: 34, right: 0}},
  {name: 'ipad-portrait', width: 768, height: 1024, insets: {top: 24, left: 0, bottom: 20, right: 0}},
  {name: 'ipad-landscape', width: 1024, height: 768, insets: {top: 24, left: 0, bottom: 20, right: 0}}
];
const SPEECH = 'The homestead feels peaceful today, and the woodland path still needs clearing before dusk.';
const LONG_SPEECH = 'Haigen watches the morning mist lift from the kitchen garden while Dylan rearranges paint jars on the cart.';
const LONG_TOAST = 'First task: clear seven brush piles at camp with Collect before the raven returns with another note.';
const LONG_QUEST = 'Listen beside the Silent Pond and follow the blocked stream until the water can speak again';

function luminance(color) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color || '');
  if (!m) return null;
  const parts = [1, 2, 3].map(i => {
    const s = Number(m[i]) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
}
function contrast(a, b) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  if (L1 == null || L2 == null) return 0;
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

(async () => {
  const root = path.join(__dirname, '../..');
  const html = fs.readFileSync(path.join(root, 'haigen.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'v127-ornate-ui.css'), 'utf8');
  const ver = JSON.parse(fs.readFileSync(path.join(root, 'haigen-version.json'), 'utf8'));
  assert.ok(Number(ver.build) >= 430, 'Job 232 requires GAME_BUILD >= 430');
  assert.match(html, new RegExp('const GAME_BUILD\\s*=\\s*' + Number(ver.build) + '\\b'));
  assert.match(html, /quietHudObstacleBoxes/);
  assert.match(html, /heroClearBox/);
  assert.match(html, /haigen-toast-live/);
  assert.match(html, /wandererV127PreviewSave/);
  assert.match(html, /function checkShoulders/);
  assert.match(css, /Job 232: Quiet Nordic HUD/);
  assert.match(css, /iPad landscape/);
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /env\(safe-area-inset-left/);
  assert.ok(fs.existsSync(path.join(root, 'docs/quiet-nordic-hud-232/README.md')));
  assert.ok(fs.existsSync(path.join(root, 'docs/quiet-nordic-hud-232/before/iphone-overlap.png')));
  assert.ok(fs.existsSync(path.join(root, 'docs/quiet-nordic-hud-232/after/iphone-overlap.png')));

  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent((req.url || '/').split('?')[0]);
    if (rel === '/') rel = '/haigen.html';
    const file = path.join(root, rel.replace(/^\//, ''));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200);
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});

  async function applyInsets(page, insets) {
    const client = await page.context().newCDPSession(page);
    let last = 'CDP method missing';
    for (const params of [{insets}, {safeAreaInsets: insets}]) {
      try {
        await client.send('Emulation.setSafeAreaInsetsOverride', params);
        return true;
      } catch (err) {
        last = err && err.message ? err.message : String(err);
      }
    }
    console.log('SAFE AREA EMULATION SKIPPED: ' + last);
    return false;
  }

  async function readHud(page, expect) {
    return page.evaluate(expected => {
      const box = el => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return null;
        const b = el.getBoundingClientRect();
        if (b.width < 4 || b.height < 4) return null;
        return {
          left: b.left, top: b.top, right: b.right, bottom: b.bottom,
          w: b.width, h: b.height, cx: b.left + b.width / 2, cy: b.top + b.height / 2
        };
      };
      const overlaps = (a, b) => {
        if (!a || !b) return false;
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        return x > 2 && y > 2;
      };
      const reaches = (el, rect) => {
        if (!el || !rect) return false;
        const stack = document.elementsFromPoint(rect.cx, rect.cy) || [];
        return stack.some(n => n === el || el.contains(n));
      };
      const inside = rect => !!rect && rect.left >= -1 && rect.top >= -1 && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1;
      const speechEl = document.getElementById('haigenSpeech');
      const speech = box(speechEl);
      const toastEl = document.getElementById('toast');
      const toast = toastEl && toastEl.classList.contains('show') ? box(toastEl) : null;
      const questEl = document.getElementById('v127Quest');
      const quest = box(questEl);
      const mini = box(document.querySelector('.v127-mini'));
      const specs = [
        ['joy', document.getElementById('joy'), 44, 44],
        ['slot', document.querySelector('.hotbar .slot.selected') || document.querySelector('.hotbar .slot'), 44, 44],
        ['collect', document.getElementById('interactBtn'), 44, 36],
        ['use', document.getElementById('useBtn'), 44, 36],
        ['pack', document.querySelector('.v127-utility[data-action="packBtn"]'), 34, 34],
        ['map', document.querySelector('.v127-utility[data-action="mapBtn"]'), 34, 34],
        ['gear', document.getElementById('v127Gear'), 34, 34],
        ['mini', document.querySelector('.v127-mini'), 44, 44]
      ];
      const controls = {};
      for (const [name, el, minW, minH] of specs) {
        const rect = box(el);
        const covered = [];
        if (name !== 'mini' && overlaps(rect, speech)) covered.push('speech');
        if (overlaps(rect, toast)) covered.push('toast');
        if (name !== 'mini' && overlaps(rect, quest)) covered.push('quest');
        if (name !== 'mini' && overlaps(rect, mini)) covered.push('minimap');
        let hit = '';
        if (rect) {
          const top = document.elementFromPoint(rect.cx, rect.cy);
          hit = top ? (top.id || top.getAttribute('aria-label') || top.className || top.tagName) : '';
        }
        controls[name] = rect ? {
          ...rect, minW, minH, inside: inside(rect), reaches: reaches(el, rect), coveredBy: covered.join('+'), hit: String(hit).slice(0, 80)
        } : null;
      }
      const controlClashes = [['gear', 'use'], ['gear', 'collect'], ['joy', 'pack'], ['joy', 'slot'], ['pack', 'map']]
        .filter(([a, b]) => overlaps(controls[a], controls[b]))
        .map(([a, b]) => {
          const left = controls[a];
          const right = controls[b];
          const x = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const y = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          return a + '/' + b + ':' + Math.round(x) + 'x' + Math.round(y);
        });
      const snap = window.__gloamPort && window.__gloamPort.snapshot ? window.__gloamPort.snapshot() : null;
      let hero = null;
      if (snap) {
        const zoom = snap.worldZoom || 1;
        const px = (snap.x - snap.cameraX) * zoom + snap.width / 2;
        const py = (snap.y - snap.cameraY) * zoom + snap.height / 2;
        const half = Math.max(18, 16 * zoom);
        const above = Math.max(52, 60 * zoom);
        const below = Math.max(10, 12 * zoom);
        hero = {left: px - half, top: py - above, right: px + half, bottom: py + below};
      }
      const speechCs = speechEl ? getComputedStyle(speechEl) : null;
      const questTitle = questEl && questEl.querySelector('h3');
      const questItem = questEl && questEl.querySelector('#v127QuestList li');
      const titleBox = box(questTitle);
      const itemBox = questItem ? questItem.getBoundingClientRect() : null;
      const questCs = questTitle ? getComputedStyle(questTitle) : null;
      const period = box(document.querySelector('.v127-period'));
      const head = box(document.querySelector('.v127-head'));
      const companions = box(document.querySelector('.v127-companions'));
      const chromeHit = (panel, other) => overlaps(panel, other);
      return {
        build: window.__haigenBuild,
        toastLive: document.body.classList.contains('haigen-toast-live'),
        speech, toast, quest, mini, hero, controls, controlClashes,
        speechToast: overlaps(speech, toast),
        speechQuest: overlaps(speech, quest),
        speechMini: overlaps(speech, mini),
        speechHero: overlaps(speech, hero),
        speechPeriod: chromeHit(speech, period),
        speechHead: chromeHit(speech, head),
        speechCompanions: chromeHit(speech, companions),
        toastQuest: overlaps(toast, quest),
        toastMini: overlaps(toast, mini),
        toastPeriod: chromeHit(toast, period),
        toastHead: chromeHit(toast, head),
        toastCompanions: chromeHit(toast, companions),
        questMini: overlaps(quest, mini),
        speechText: speechEl ? speechEl.textContent : '',
        speechFont: speechCs ? parseFloat(speechCs.fontSize) : 0,
        speechColor: speechCs ? speechCs.color : '',
        speechBg: speechCs ? speechCs.backgroundColor : '',
        speechScroll: speechEl ? speechEl.scrollHeight : 0,
        speechClient: speechEl ? speechEl.clientHeight : 0,
        speechClipped: !!(speechEl && speechEl.scrollHeight > speechEl.clientHeight + 16),
        speechInView: inside(speech),
        toastText: toastEl ? toastEl.textContent : '',
        questTitle: questTitle ? questTitle.textContent : '',
        questText: questItem ? questItem.textContent : '',
        questFont: questCs ? parseFloat(questCs.fontSize) : 0,
        questColor: questCs ? questCs.color : '',
        questTitleInView: inside(titleBox),
        questItemReachable: !!(questEl && itemBox && (
          (itemBox.height > 8 && itemBox.top < quest.bottom - 2 && itemBox.bottom > quest.top + 2) ||
          questEl.scrollHeight > questEl.clientHeight + 4
        )),
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        expectSpeech: expected.speech,
        expectToast: expected.toast,
        expectQuest: expected.quest
      };
    }, expect);
  }

  function assertLayout(metrics, label) {
    assert.equal(metrics.build, Number(ver.build), label + ' build');
    assert.equal(metrics.toastLive, true, label + ' toast live');
    assert.ok(metrics.speech, label + ' speech visible');
    assert.ok(metrics.toast, label + ' toast visible');
    assert.ok(metrics.mini, label + ' minimap visible');
    assert.ok(metrics.quest, label + ' quest visible');
    assert.equal(metrics.speechToast, false, label + ' speech covers toast');
    assert.equal(metrics.speechQuest, false, label + ' speech covers quest');
    assert.equal(metrics.speechMini, false, label + ' speech covers minimap');
    assert.equal(metrics.speechHero, false, label + ' speech covers Haigen ' + JSON.stringify(metrics.speech) + ' hero ' + JSON.stringify(metrics.hero));
    assert.equal(metrics.toastQuest, false, label + ' toast covers quest');
    assert.equal(metrics.toastMini, false, label + ' toast covers minimap');
    assert.equal(metrics.questMini, false, label + ' quest covers minimap');
    assert.equal(metrics.toastPeriod, false, label + ' toast covers the day chip');
    assert.equal(metrics.toastHead, false, label + ' toast covers the portrait');
    assert.equal(metrics.toastCompanions, false, label + ' toast covers companions');
    assert.equal(metrics.speechPeriod, false, label + ' speech covers the day chip');
    assert.equal(metrics.speechHead, false, label + ' speech covers the portrait');
    assert.equal(metrics.speechCompanions, false, label + ' speech covers companions');
    assert.ok(metrics.speechText.includes(metrics.expectSpeech), label + ' speech text missing');
    assert.equal(metrics.speechClipped, false, label + ' speech text clipped scroll ' + metrics.speechScroll + ' client ' + metrics.speechClient);
    assert.ok(metrics.speechInView, label + ' speech outside viewport');
    assert.ok(metrics.speechFont >= 12, label + ' speech font ' + metrics.speechFont);
    assert.ok(metrics.toastText.includes(metrics.expectToast), label + ' toast text missing: ' + metrics.toastText);
    assert.ok(metrics.questTitle.includes('Silent Pond'), label + ' quest title missing');
    assert.ok(metrics.questTitleInView, label + ' quest title not visible');
    assert.ok(metrics.questFont >= 11, label + ' quest font ' + metrics.questFont);
    const speechContrast = contrast(metrics.speechColor, metrics.speechBg);
    assert.ok(speechContrast >= 4.5, label + ' speech contrast ' + speechContrast.toFixed(2) + ' ' + metrics.speechColor + ' on ' + metrics.speechBg);
    const questLum = luminance(metrics.questColor);
    assert.ok(questLum != null && questLum > 0.45, label + ' quest text not light enough ' + metrics.questColor);
    for (const name of ['joy', 'slot', 'collect', 'use', 'pack', 'map', 'gear', 'mini']) {
      const info = metrics.controls[name];
      assert.ok(info, label + ' ' + name + ' missing');
      assert.ok(info.w >= info.minW && info.h >= info.minH, label + ' ' + name + ' touch size ' + info.w + 'x' + info.h);
      assert.ok(info.inside, label + ' ' + name + ' outside viewport');
      assert.ok(info.reaches, label + ' ' + name + ' center is not a touch hit (' + info.hit + ')');
      assert.equal(info.coveredBy, '', label + ' ' + name + ' covered by ' + info.coveredBy);
    }
    assert.deepEqual(metrics.controlClashes, [], label + ' controls overlap each other');
  }

  function assertSafe(metrics, insets, label) {
    if (!insets) return;
    const limit = (rect, name) => {
      assert.ok(rect, label + ' ' + name + ' missing for safe area');
      assert.ok(rect.top >= insets.top - 1, label + ' ' + name + ' under top inset ' + rect.top);
      assert.ok(rect.left >= insets.left - 1, label + ' ' + name + ' under left inset ' + rect.left);
      assert.ok(rect.right <= metrics.innerWidth - insets.right + 1, label + ' ' + name + ' under right inset ' + rect.right);
      assert.ok(rect.bottom <= metrics.innerHeight - insets.bottom + 1, label + ' ' + name + ' under bottom inset ' + rect.bottom);
    };
    for (const name of ['joy', 'slot', 'collect', 'use', 'pack', 'map', 'gear', 'mini']) limit(metrics.controls[name], name);
    limit(metrics.speech, 'speech');
    limit(metrics.toast, 'toast');
    if (metrics.questTitleInView) limit(metrics.quest, 'quest');
  }

  async function runViewport(vp) {
    const page = await browser.newPage({
      viewport: {width: vp.width, height: vp.height},
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const requested = await applyInsets(page, vp.insets);
    await page.route('**/haigen.html?qa=quiet-hud-232*', async route => {
      const response = await route.fetch();
      let body = await response.text();
      const marker = 'function worldZoom(){return baseCameraScale()*cameraZoom}';
      assert.ok(body.includes(marker), 'camera hook missing');
      body = body.replace(marker, marker + `;window.__hudQA=(opts)=>{state.x=opts.x;state.y=opts.y;state.story=state.story||{};state.story.stage=opts.stage??1;state.story.oldStreamQuestRetired=false;cam.x=opts.x;cam.y=opts.y-(typeof presentationPortraitFraming==="function"&&presentationPortraitFraming()?Math.min(110,H*.075)/Math.max(.01,worldZoom()):0);cameraDetached=false;look.x=0;look.y=0;state.autonomy=true;autoBubble=opts.speech||"";autoBubbleTimer=opts.ms||16000;if(opts.toast)notify(opts.toast);const q=document.getElementById("v127Quest");if(q){q.style.display="";q.dataset.collapsed=opts.questCollapsed?"true":"false";const t=document.getElementById("v127QuestToggle");if(t)t.textContent=opts.questCollapsed?"+":"−";const list=document.getElementById("v127QuestList");if(list&&opts.questText){list.innerHTML='<li><span class="v127-checkbox"></span><span></span></li>';list.querySelector("span:last-child").textContent=opts.questText;}else if(list&&!list.children.length){list.innerHTML='<li><span class="v127-checkbox"></span><span>Listen near the Silent Pond</span></li>';}}return true;};`);
      await route.fulfill({response, body});
    });
    await page.goto(`http://127.0.0.1:${port}/haigen.html?qa=quiet-hud-232-${vp.name}`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__haigenWorldReady && window.__v127UIReady, {timeout: 30000});
    if (requested) await applyInsets(page, vp.insets);
    await page.waitForTimeout(400);
    const probe = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0px);left:env(safe-area-inset-left,0px);width:0;height:0;pointer-events:none';
      document.body.appendChild(el);
      const r = el.getBoundingClientRect();
      el.remove();
      return {top: r.top, left: r.left};
    });
    const safeLive = requested && Math.abs(probe.top - vp.insets.top) <= 2 && Math.abs(probe.left - vp.insets.left) <= 2;
    console.log(vp.name + ' safe-area ' + (safeLive ? 'emulated ' + vp.insets.top + '/' + vp.insets.bottom : 'not applied (probe ' + probe.top + ',' + probe.left + ')'));

    await page.evaluate(args => window.__hudQA(args), {
      x: 1530, y: 1655, stage: 1, questCollapsed: false,
      speech: SPEECH, toast: 'A raven has brought a note from Haigen!'
    });
    await page.waitForTimeout(450);
    const metrics = await readHud(page, {speech: 'woodland path', toast: 'raven has brought a note', quest: 'Silent Pond'});
    assertLayout(metrics, vp.name);
    if (safeLive) assertSafe(metrics, vp.insets, vp.name + ' safe');
    if (process.env.QUIET_HUD_CAPTURE === '1') {
      const after = path.join(root, 'docs/quiet-nordic-hud-232/after');
      const stem = vp.name === 'ipad-portrait' ? 'ipad-portrait-overlap' : vp.name === 'ipad-landscape' ? 'ipad-landscape-overlap' : 'iphone-overlap';
      await page.screenshot({path: path.join(after, stem + '.png')});
      if (vp.name === 'iphone') await page.screenshot({path: path.join(after, 'iphone-overlap-with-quest.png')});
    }

    await page.evaluate(args => window.__hudQA(args), {
      x: 1530, y: 1655, stage: 1, questCollapsed: true,
      speech: LONG_SPEECH, toast: LONG_TOAST
    });
    await page.waitForTimeout(450);
    const collapsed = await readHud(page, {speech: 'paint jars', toast: 'brush piles', quest: 'Silent Pond'});
    assert.equal(collapsed.speechToast, false, vp.name + ' long speech covers toast');
    assert.equal(collapsed.speechMini, false, vp.name + ' long speech covers minimap');
    assert.equal(collapsed.speechHero, false, vp.name + ' long speech covers Haigen');
    assert.equal(collapsed.toastMini, false, vp.name + ' long toast covers minimap');
    assert.equal(collapsed.toastPeriod, false, vp.name + ' long toast covers the day chip');
    assert.equal(collapsed.toastHead, false, vp.name + ' long toast covers the portrait');
    assert.equal(collapsed.toastCompanions, false, vp.name + ' long toast covers companions');
    assert.ok(collapsed.speechText.includes(LONG_SPEECH), vp.name + ' long speech truncated');
    assert.equal(collapsed.speechClipped, false, vp.name + ' long speech clipped');
    assert.ok(collapsed.speech && collapsed.speech.bottom < vp.height - 120, vp.name + ' long speech falls into bottom controls');
    if (process.env.QUIET_HUD_CAPTURE === '1' && vp.name === 'iphone') {
      await page.screenshot({path: path.join(root, 'docs/quiet-nordic-hud-232/after/iphone-long-text.png')});
    }

    await page.evaluate(args => window.__hudQA(args), {
      x: 1530, y: 1655, stage: 1, questCollapsed: false,
      speech: LONG_SPEECH, toast: LONG_TOAST, questText: LONG_QUEST
    });
    await page.waitForTimeout(450);
    const longQuest = await readHud(page, {speech: 'paint jars', toast: 'brush piles', quest: LONG_QUEST});
    assertLayout(longQuest, vp.name + ' long-text');
    assert.ok(longQuest.questText.includes(LONG_QUEST), vp.name + ' long quest text missing');
    assert.ok(longQuest.questItemReachable, vp.name + ' long quest objective not reachable');
    if (safeLive) assertSafe(longQuest, vp.insets, vp.name + ' long safe');
    if (process.env.QUIET_HUD_CAPTURE === '1' && vp.name === 'iphone') {
      await page.screenshot({path: path.join(root, 'docs/quiet-nordic-hud-232/after/iphone-long-text-with-quest.png')});
    }

    await page.locator('#v127Gear').tap();
    await page.waitForTimeout(120);
    assert.equal(await page.locator('#haigenSpeech').evaluate(e => getComputedStyle(e).visibility), 'hidden');
    await page.locator('#v127CloseSettings').tap();
    assert.ok(!errors.length, vp.name + ' page errors ' + JSON.stringify(errors));
    await page.close();
    console.log('PASS quiet HUD ' + vp.name + ' ' + vp.width + 'x' + vp.height);
  }

  for (const vp of VIEWPORTS) await runViewport(vp);
  assert.ok(fs.existsSync(path.join(root, 'docs/quiet-nordic-hud-232/after/ipad-landscape-overlap.png')), 'iPad landscape evidence screenshot missing');
  await browser.close();
  server.close();
  console.log('PASS Job 232 Quiet Nordic HUD: lanes, touch targets, safe area, V' + ver.build);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
