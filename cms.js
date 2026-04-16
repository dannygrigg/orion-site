// ── ORION CMS LOADER ─────────────────────────────────────
(function(){
  'use strict';

  const BASE = window.location.pathname.includes('/orion-site') ? '/orion-site' : '';
  const PAGE = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  function getJSON(path) {
    return fetch(BASE + path + '?v=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function ytId(url) {
    const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
    return m ? m[1] : '';
  }

  function toEmbed(url) {
    const id = ytId(url);
    if (!id) return url || '';
    return 'https://www.youtube.com/embed/' + id + '?rel=0&modestbranding=1&playsinline=1';
  }

  function thumbFor(url) {
    const id = ytId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  }

  function normaliseImage(url, fallback='') {
    const s = String(url || '').trim();
    if (!s) return fallback;
    if (s.includes('youtube.com') || s.includes('youtu.be')) return thumbFor(s) || fallback;
    if (s.includes('photos.app.goo.gl')) return fallback;
    return s;
  }

  function setVal(el, val) {
    if (!el || val === undefined || val === null || String(val).trim() === '') return;
    if (String(val).includes('<')) el.innerHTML = val; else el.textContent = val;
  }

  function setSelector(selector, val) {
    document.querySelectorAll(selector).forEach(el => setVal(el, val));
  }

  function applyAnnouncements(items) {
    const track = document.querySelector('.announcement-track');
    if (!track || !items || !items.length) return;
    const doubled = [...items, ...items];
    track.innerHTML = doubled.map(a => {
      const link = a.link_url ? ` <a href="${esc(a.link_url)}">${esc(a.link_label || 'read more')}</a>` : '';
      return `<span class="announcement-item">${esc(a.text || '')}${link}</span><span class="announcement-sep">·</span>`;
    }).join('');
  }

  function applyGlobal(settings) {
    if (!settings) return;
    document.querySelectorAll('a[href^="tel:"]').forEach(a => { if (settings.phone) { a.href = 'tel:' + settings.phone.replace(/\s+/g,''); a.lastChild.textContent = settings.phone; } });
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => { if (settings.email) { a.href = 'mailto:' + settings.email; a.lastChild.textContent = settings.email; } });
  }

  function applyHeroVideo(url) {
    if (!url) return;
    const wrap = document.getElementById('heroWrap') || document.querySelector('.hero-video-wrap');
    if (!wrap) return;
    wrap.innerHTML = `<iframe src="${toEmbed(url)}" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    wrap.style.cssText = 'position:relative;overflow:hidden;aspect-ratio:16/10;background:#000;display:block';
  }

  function applyStats(d) {
    const stats = document.querySelectorAll('.stat-item');
    for (let i = 1; i <= 4; i++) {
      if (!stats[i-1]) break;
      setVal(stats[i-1].querySelector('.stat-label'), d[`stat${i}_label`]);
      setVal(stats[i-1].querySelector('.stat-number'), d[`stat${i}_number`]);
      setVal(stats[i-1].querySelector('.stat-note'), d[`stat${i}_note`]);
    }
  }

  function applyFeatureCards(d) {
    const feats = document.querySelectorAll('.feature-card');
    for (let i = 1; i <= 6; i++) {
      if (!feats[i-1]) break;
      setVal(feats[i-1].querySelector('.feature-title'), d[`feat${i}_title`]);
      setVal(feats[i-1].querySelector('.feature-desc'), d[`feat${i}_desc`]);
    }
  }

  function applySolutionCards(d) {
    const cards = document.querySelectorAll('.solution-card');
    for (let i = 1; i <= 6; i++) {
      if (!cards[i-1]) break;
      setVal(cards[i-1].querySelector('.solution-tag'), d[`sol${i}_tag`]);
      setVal(cards[i-1].querySelector('.solution-title'), d[`sol${i}_title`]);
      setVal(cards[i-1].querySelector('.solution-desc'), d[`sol${i}_desc`]);
    }
  }

  function applyProof(d) {
    const proofs = document.querySelectorAll('.proof-card');
    for (let i = 1; i <= 4; i++) {
      if (!proofs[i-1]) break;
      setVal(proofs[i-1].querySelector('.proof-number'), d[`proof${i}_number`]);
      setVal(proofs[i-1].querySelector('.proof-label'), d[`proof${i}_label`]);
      setVal(proofs[i-1].querySelector('.proof-desc'), d[`proof${i}_desc`]);
    }
  }

  function applySpecRows(d) {
    const lis = document.querySelectorAll('.spec-list li');
    for (let i = 1; i <= 8; i++) {
      if (!lis[i-1]) break;
      setVal(lis[i-1].querySelector('.spec-key'), d[`spec${i}_key`]);
      setVal(lis[i-1].querySelector('.spec-val'), d[`spec${i}_val`]);
    }
    const trs = document.querySelectorAll('.specs-table tr');
    for (let i = 1; i <= 8; i++) {
      if (!trs[i-1]) break;
      const cells = trs[i-1].querySelectorAll('td');
      const key = d[`spec${i}_key`], val = d[`spec${i}_val`];
      if (cells.length >= 2) {
        if (!key && !val) trs[i-1].style.display = 'none';
        else {
          trs[i-1].style.display = '';
          setVal(cells[0], key);
          setVal(cells[1], val);
        }
      }
    }
  }

  function applyImages(d) {
    const heroImage = d.hero_image || d.main_image || '';
    if (heroImage) document.querySelectorAll('.page-header img,.hero-img img,[data-cms="hero_image"]').forEach(el => { el.src = heroImage; el.style.display='block'; });
    if (d.dark_image) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; pv.appendChild(img); }
        img.src = d.dark_image;
      }
    }
    for (let i=1;i<=13;i++) {
      const val = d[`client_logo_${i}`];
      if (!val) continue;
      document.querySelectorAll(`[data-cms="client_logo_${i}"]`).forEach(el => { el.src = val; el.style.display='block'; const p = el.closest('.client-logo-item'); if (p) p.style.display='flex'; });
    }
  }

  function applyRenders(renders) {
    const items = (renders || []).filter(r => r && r.src);
    const galleryImgs = document.querySelectorAll('#cms-gallery img[data-cms]');
    if (galleryImgs.length) {
      galleryImgs.forEach((img, i) => {
        const item = items[i];
        if (item) {
          img.src = item.src;
          img.alt = item.alt || item.title || 'Helix render';
          img.style.display = 'block';
        } else {
          img.removeAttribute('src');
          img.style.display = 'none';
        }
      });
    }
  }

  function applyMediaBlocks(blocks) {
    const homeWrap = document.getElementById('media-blocks');
    const helixWrap = document.getElementById('helix-dynamic-media');
    const wrap = helixWrap || homeWrap;
    if (!wrap) return;
    const items = (blocks || []).filter(Boolean);
    wrap.innerHTML = items.map(block => {
      const title = block.title ? `<h3 style="font-size:20px;letter-spacing:-0.01em;margin-bottom:8px">${esc(block.title)}</h3>` : '';
      const caption = block.caption ? `<p style="font-size:14px;line-height:1.65;color:var(--mid-gray)">${esc(block.caption)}</p>` : '';
      if (block.type === 'video' && block.url) {
        return `<section style="background:white;border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow-sm);margin-bottom:20px"><div style="aspect-ratio:16/9;background:#000;position:relative"><iframe src="${toEmbed(block.url)}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div><div style="padding:18px 20px">${title}${caption}</div></section>`;
      }
      if (block.type === 'carousel') {
        const slides = String(block.slides || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
        if (!slides.length) return '';
        return `<section style="background:white;border:1px solid var(--border);border-radius:22px;padding:18px 18px 14px;box-shadow:var(--shadow-sm);margin-bottom:20px">${title}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">${slides.map(src => `<img src="${esc(src)}" alt="${esc(block.alt || block.title || '')}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;border:1px solid var(--border-light)" onerror="this.style.display='none'">`).join('')}</div>${caption ? `<div style="padding-top:12px">${caption}</div>` : ''}</section>`;
      }
      const src = block.src || block.url;
      if (!src) return '';
      return `<section style="background:white;border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow-sm);margin-bottom:20px"><img src="${esc(src)}" alt="${esc(block.alt || block.title || '')}" style="width:100%;aspect-ratio:16/10;object-fit:cover;display:block" onerror="this.closest('section').style.display='none'"><div style="padding:18px 20px">${title}${caption}</div></section>`;
    }).join('');
    const dyn = document.getElementById('helixDynamicContent');
    if (dyn) dyn.style.display = (wrap.innerHTML.trim() || document.querySelector('#cms-gallery img[style*="display: block"]')) ? 'block' : 'none';
  }

  function applySharedPage(d) {
    if (!d) return;
    applyHeroVideo(d.hero_video_url);
    const h1 = document.querySelector('.page-header h1, .page-hero h1, h1');
    if (h1 && d.hero_h1) h1.innerHTML = d.hero_h1;
    setSelector('.page-header-sub,.hero-sub,.page-hero-sub', d.hero_sub);
    setSelector('.page-header-eyebrow,.hero-eyebrow,.page-eyebrow', d.hero_eyebrow);
    applyStats(d);
    applyFeatureCards(d);
    applySolutionCards(d);
    applyProof(d);
    applySpecRows(d);
    applyImages(d);
    setSelector('.cta-card h2', d.cta_h2);
    setSelector('.cta-card .section-lead', d.cta_lead);
    applyRenders(d.renders);
    applyMediaBlocks(d.media_blocks);
    Object.keys(d).forEach(key => {
      if (!d[key]) return;
      document.querySelectorAll(`[data-cms="${key}"]`).forEach(el => {
        if (el.tagName === 'IMG') { el.src = d[key]; el.style.display='block'; }
        else setVal(el, d[key]);
      });
    });
  }

  function applyHomepage(d) {
    if (!d) return;
    applyHeroVideo(d.hero_video_url);
    const h1 = document.querySelector('.hero h1');
    if (h1 && d.hero_line1) h1.innerHTML = d.hero_line1 + (d.hero_line2 ? `<br><em>${d.hero_line2}</em>` : '');
    setSelector('.hero-sub', d.hero_body);
    setSelector('.hero-eyebrow', d.hero_eyebrow);
    applyStats(d);
    applyFeatureCards(d);
    if (d.dark_h2_line1) {
      const darkH2 = document.querySelector('.product-section h2');
      if (darkH2) darkH2.innerHTML = d.dark_h2_line1 + (d.dark_h2_line2 ? `<br><em>${d.dark_h2_line2}</em>` : '');
    }
    setSelector('.product-section .section-lead', d.dark_lead);
    applySpecRows(d);
    applyProof(d);
    applyImages(d);
    setSelector('.cta-card h2', d.cta_h2);
    setSelector('.cta-card .section-lead', d.cta_lead);
    applyMediaBlocks(d.media_blocks);
  }

  function newsCard(item, label, linkText) {
    const thumb = normaliseImage(item.image, thumbFor(item.link || item.url || '')) || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80';
    const link = item.link || item.url || '#';
    return `<a class="news-card" href="${esc(link)}"${link !== '#' ? ' target="_blank" rel="noopener"' : ''}><div class="news-card-img"><img src="${esc(thumb)}" alt="${esc(item.title || label || 'Image')}"><span class="news-tag tag-news">${esc(label || item.type || 'news')}</span></div><div class="news-card-body"><div class="news-date">${esc(item.date || '')}</div><div class="news-title">${esc(item.title || label || 'Untitled')}</div><div class="news-excerpt">${esc((item.summary || item.caption || '').slice(0, 220))}</div><div class="news-link">${esc(linkText || 'Read more →')}</div></div></a>`;
  }

  function loadHubCollections() {
    const newsFeed = document.getElementById('cms-news-feed');
    const ytFeed = document.getElementById('cms-youtube-feed');
    const socialFeed = document.getElementById('cms-social-feed');
    const vaultList = document.getElementById('cms-vault-list');

    if (newsFeed) {
      getJSON('/_data/news/index.json').then(idx => Promise.all(((idx && idx.files) || []).map(f => getJSON('/_data/news/' + f))).then(items => {
        const news = items.filter(Boolean).filter(n => n.status !== 'draft').sort((a,b) => new Date(b.date) - new Date(a.date));
        newsFeed.innerHTML = news.length ? news.map(n => newsCard(n, n.type || 'news', 'Read story →')).join('') : '<p style="color:var(--mid-gray);font-weight:300">No news items yet.</p>';
      }));
    }

    getJSON('/_data/social/index.json').then(idx => Promise.all(((idx && idx.files) || []).map(f => getJSON('/_data/social/' + f))).then(items => {
      const posts = items.filter(Boolean).sort((a,b) => new Date(b.date) - new Date(a.date));
      if (ytFeed) {
        const vids = posts.filter(p => String(p.platform).toLowerCase() === 'youtube');
        ytFeed.innerHTML = vids.length ? vids.map(v => {
          const card = { title: (v.caption || 'Watch on YouTube').slice(0, 90), caption: 'Videos from Orion on YouTube.', date: v.date, url: v.url, image: normaliseImage(v.image, thumbFor(v.url)) };
          return newsCard(card, 'YouTube', 'Watch on YouTube →');
        }).join('') : '<a class="news-card" href="https://www.youtube.com/@orionautomation1" target="_blank" rel="noopener"><div class="news-card-body"><div class="news-title">Orion on YouTube</div><div class="news-excerpt">Latest videos and explainers from Orion Automation.</div><div class="news-link">Open channel →</div></div></a>';
      }
      if (socialFeed) {
        const socials = posts.filter(p => String(p.platform).toLowerCase() !== 'youtube');
        socialFeed.innerHTML = socials.length ? socials.map(p => {
          const platform = String(p.platform || 'social');
          const card = { title: platform.charAt(0).toUpperCase() + platform.slice(1) + ' update', caption: p.caption || 'Follow Orion for the latest updates.', date: p.date, url: p.url, image: normaliseImage(p.image, '') };
          return newsCard(card, platform, 'View post →');
        }).join('') : '<p style="color:var(--mid-gray);font-weight:300">No social posts yet.</p>';
      }
    }));

    if (vaultList) {
      getJSON('/_data/vault/index.json').then(idx => Promise.all(((idx && idx.files) || []).map(f => getJSON('/_data/vault/' + f))).then(items => {
        const docs = items.filter(Boolean).filter(v => v.access !== 'internal');
        vaultList.innerHTML = docs.map(v => `<a href="${esc(v.url)}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:white;margin-bottom:8px;text-decoration:none;color:inherit"><div style="width:34px;height:34px;border-radius:8px;background:var(--blue-bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">📄</div><div><div style="font-size:13px;font-weight:500">${esc(v.name)}</div><div style="font-size:11px;color:var(--mid-gray)">${esc(v.category || '')}</div></div></a>`).join('');
      }));
    }
  }

  function boot() {
    const isHome = PAGE === 'index' || PAGE === '' || window.location.pathname.endsWith('/orion-site/');
    const isHub = PAGE === 'hub';
    Promise.all([getJSON('/_data/pages.json'), getJSON('/_data/global.json')]).then(([pages, global]) => {
      if (!pages) return;
      applyGlobal(global || {});
      if (pages.homepage && pages.homepage.announcements) applyAnnouncements(pages.homepage.announcements);
      if (isHome) applyHomepage(pages.homepage || {});
      else if (pages[PAGE]) applySharedPage(pages[PAGE]);
      if (isHub) loadHubCollections();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
