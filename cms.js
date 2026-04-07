// ── ORION MIS — CMS DATA LOADER ───────────────────────────
// Reads JSON files saved by Decap CMS and applies them to the page
// Zero rebuild required — save in CMS → GitHub commits → live in 2 min

(function() {
  'use strict';

  // Work out the base path whether on GitHub Pages or locally
  const BASE = (() => {
    const p = window.location.pathname;
    if (p.startsWith('/orion-site')) return '/orion-site';
    return '';
  })();

  function get(path) {
    return fetch(BASE + path + '?v=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  // ── APPLY HOMEPAGE DATA ────────────────────────────────────
  function applyHome(d) {
    if (!d) return;

    // Hero video
    const wrap = document.getElementById('heroWrap');
    if (wrap && d.hero_video_url) {
      wrap.style.cssText = 'position:relative;overflow:hidden;border-radius:var(--radius-xl) var(--radius-xl) 0 0;aspect-ratio:16/10;background:#000';
      wrap.innerHTML = `<iframe src="${d.hero_video_url}" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
    }

    // Hero text
    const h1 = document.querySelector('.hero h1');
    if (h1 && (d.hero_line1 || d.hero_line2)) {
      h1.innerHTML = (d.hero_line1 || '') + (d.hero_line2 ? '<br><em>' + d.hero_line2 + '</em>' : '');
    }
    const sub = document.querySelector('.hero-sub');
    if (sub && d.hero_body) {
      sub.innerHTML = d.hero_body + (d.hero_lease ? ' <strong style="color:var(--dark);font-weight:500">' + d.hero_lease + '.</strong>' : '');
    }

    // Announcement bar
    if (d.announcements && d.announcements.length) {
      const track = document.querySelector('.announcement-track');
      if (track) {
        const items = [...d.announcements, ...d.announcements]; // doubled for seamless scroll
        track.innerHTML = items.map(a => {
          const txt = a.link_url
            ? `${a.text} <a href="${a.link_url}">${a.link_label || 'click here'}</a>`
            : a.text;
          return `<span class="announcement-item">${txt}</span><span class="announcement-sep">·</span>`;
        }).join('');
      }
    }
  }

  // ── APPLY HUB DATA ─────────────────────────────────────────
  function applyHub(news, vault, social) {

    // NEWS FEED
    const newsFeed = document.getElementById('cms-news-feed');
    if (newsFeed && news) {
      const items = news
        .filter(n => n.status !== 'draft')
        .sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
      newsFeed.innerHTML = items.length ? items.map(n => `
        <div style="background:white;border:1px solid var(--border-light);border-radius:16px;overflow:hidden;transition:box-shadow 0.2s" onmouseover="this.style.boxShadow='0 4px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
          ${n.image ? `<img src="${n.image}" alt="${n.title}" style="width:100%;height:180px;object-fit:cover">` : `<div style="height:6px;background:var(--blue)"></div>`}
          <div style="padding:20px 22px">
            <span style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--blue);background:var(--blue-bg);padding:3px 9px;border-radius:980px">${n.type||'news'}</span>
            <div style="font-size:16px;font-weight:500;letter-spacing:-0.01em;margin:10px 0 6px;line-height:1.3">${n.title}</div>
            <div style="font-size:13px;font-weight:300;color:var(--mid-gray);line-height:1.65;margin-bottom:12px">${n.summary||''}</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:11px;color:var(--mid-gray)">${fmtDate(n.date)}</span>
              ${n.link ? `<a href="${n.link}" target="_blank" style="font-size:12px;font-weight:500;color:var(--blue);text-decoration:none">Read more →</a>` : ''}
            </div>
          </div>
        </div>`).join('')
      : '<p style="color:var(--mid-gray);font-weight:300;font-size:14px">No news items published yet.</p>';
    }

    // VAULT
    const vaultList = document.getElementById('cms-vault-list');
    if (vaultList && vault) {
      const docs = vault.filter(v => v.access !== 'internal');
      const ICONS = {pdf:'📄',doc:'📝',xls:'📊',ppt:'📋',dwg:'📐',zip:'🗜️',link:'🔗'};
      vaultList.innerHTML = docs.length ? docs.map(v => `
        <a href="${v.url}" target="_blank" style="display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:white;margin-bottom:8px;text-decoration:none;color:inherit;transition:border-color 0.15s" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="width:36px;height:36px;border-radius:8px;background:var(--blue-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">${ICONS[v.filetype]||'📄'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">${v.name}${v.version?` <span style="font-size:11px;color:var(--mid-gray);font-weight:300">${v.version}</span>`:''}</div>
            <div style="font-size:11px;color:var(--mid-gray);font-weight:300;margin-top:2px;text-transform:capitalize">${v.category}${v.description?' · '+v.description.slice(0,55):''}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>`).join('')
      : '<p style="color:var(--mid-gray);font-weight:300;font-size:14px">No documents in the vault yet.</p>';
    }

    // SOCIAL
    const socialFeed = document.getElementById('cms-social-feed');
    if (socialFeed && social) {
      const posts = social.sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
      socialFeed.innerHTML = posts.length ? posts.map(p => `
        <div style="border:1px solid var(--border);border-radius:16px;padding:20px 22px;background:white;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--blue);background:var(--blue-bg);padding:3px 9px;border-radius:980px">${p.platform}</span>
            <span style="font-size:11px;color:var(--mid-gray)">${fmtDate(p.date)}</span>
          </div>
          ${p.image?`<img src="${p.image}" style="width:100%;border-radius:10px;margin-bottom:12px;max-height:220px;object-fit:cover" alt="">`:''}
          <p style="font-size:14px;font-weight:300;line-height:1.65;color:var(--dark);margin:0">${p.caption}</p>
          ${p.url?`<a href="${p.url}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;color:var(--blue);text-decoration:none;margin-top:10px">View post →</a>`:''}
        </div>`).join('')
      : '<p style="color:var(--mid-gray);font-weight:300;font-size:14px">No social posts yet.</p>';
    }
  }

  // ── APPLY IMAGE SLOTS ──────────────────────────────────────
  function applyImages(images, page) {
    if (!images) return;
    images
      .filter(img => img.page === page || img.page === 'all')
      .forEach(img => {
        document.querySelectorAll('[data-cms="' + img.section + '"]').forEach(el => {
          if (el.tagName === 'IMG') { el.src = img.url; if (img.alt) el.alt = img.alt; }
          else el.style.backgroundImage = 'url(' + img.url + ')';
        });
      });
  }

  function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}); }
    catch(e) { return d; }
  }

  // ── LOAD ALL NEWS/VAULT/SOCIAL from index files ────────────
  function loadCollection(folder) {
    return get('/_data/' + folder + '/index.json')
      .then(index => {
        if (!index || !index.files) return [];
        return Promise.all(index.files.map(f => get('/_data/' + folder + '/' + f)));
      })
      .then(results => results.filter(Boolean))
      .catch(() => []);
  }

  // ── BOOT ───────────────────────────────────────────────────
  function boot() {
    const page = window.location.pathname.split('/').pop().replace('.html','') || 'home';
    const isHome = page === 'index' || page === '' || page === 'home' || window.location.pathname.endsWith('/orion-site/');
    const isHub  = page === 'hub';

    if (isHome) {
      get('/_data/homepage.json').then(applyHome);
    }

    if (isHub) {
      Promise.all([
        loadCollection('news'),
        loadCollection('vault'),
        loadCollection('social')
      ]).then(([news, vault, social]) => {
        applyHub(news, vault, social);
      });
    }

    // Images on any page
    loadCollection('images').then(images => applyImages(images, isHome ? 'home' : page));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
