// ── ORION MIS — CMS LOADER v2 ────────────────────────────────────
// Reads structured JSON files written by Decap CMS and applies
// content to the current page. No rebuild required.
// Works on both Netlify and GitHub Pages.
(function () {
  'use strict';

  // ── PATH RESOLUTION ──────────────────────────────────────────
  // Works on Netlify (root) and GitHub Pages (/orion-site/)
  const BASE = (function () {
    const p = window.location.pathname;
    if (p.startsWith('/orion-site')) return '/orion-site';
    return '';
  })();

  const PAGE = (function () {
    const p = window.location.pathname.split('/').pop().replace('.html', '');
    if (!p || p === 'orion-site') return 'index';
    return p;
  })();

  const IS_HOME = PAGE === 'index' || window.location.pathname.endsWith('/');
  const IS_HUB  = PAGE === 'hub';

  // ── HELPERS ──────────────────────────────────────────────────

  function get(path) {
    return fetch(BASE + path + '?v=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  // Convert YouTube watch URL → embed URL
  function toEmbed(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!m) return url;
    const v = m[1];
    return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1&loop=1&playlist=${v}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
  }

  // Safe element setter — only updates if value is non-empty
  // Uses innerHTML when value contains HTML tags, textContent otherwise
  function setEl(el, val) {
    if (!el || val === undefined || val === null || val === '') return;
    const str = String(val).trim();
    if (!str) return;
    if (str.includes('<')) {
      el.innerHTML = str;
    } else {
      el.textContent = str;
    }
  }

  // Set a video slot
  function setVideo(wrapEl, url) {
    if (!wrapEl || !url) return;
    const embed = toEmbed(url);
    wrapEl.style.display = 'block';
    wrapEl.style.cssText = 'position:relative;overflow:hidden;aspect-ratio:16/10;background:#000;display:block;border-radius:var(--radius-xl,28px) var(--radius-xl,28px) 0 0';
    wrapEl.innerHTML = `<iframe src="${embed}" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
  }

  // ── HOMEPAGE ─────────────────────────────────────────────────

  function applyHomepage(d) {
    if (!d) return;

    // Hero video
    setVideo(document.getElementById('heroWrap'), d.hero_video_url);

    // Headlines
    const h1 = document.querySelector('.hero h1');
    if (h1 && d.hero_line1) {
      const line2 = d.hero_line2 ? `<br><em>${d.hero_line2}</em>` : '';
      h1.innerHTML = d.hero_line1 + line2;
    }
    setEl(document.querySelector('.hero-sub'), d.hero_body);
    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow && d.hero_eyebrow) {
      const tn = [...eyebrow.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (tn) tn.textContent = d.hero_eyebrow;
    }

    // Stats bar — support both array and flat field formats
    const stats = document.querySelectorAll('.stat-item');
    const statsData = d.stats || [
      { label: d.stat1_label, number: d.stat1_number, note: d.stat1_note },
      { label: d.stat2_label, number: d.stat2_number, note: d.stat2_note },
      { label: d.stat3_label, number: d.stat3_number, note: d.stat3_note },
      { label: d.stat4_label, number: d.stat4_number, note: d.stat4_note },
    ];
    statsData.forEach((s, i) => {
      if (!stats[i]) return;
      setEl(stats[i].querySelector('.stat-label'), s.label);
      setEl(stats[i].querySelector('.stat-number'), s.number);
      setEl(stats[i].querySelector('.stat-note'), s.note);
    });

    // Feature cards — support both array and flat formats
    const feats = document.querySelectorAll('.feature-card');
    const featsData = d.features || [
      { title: d.feat1_title, desc: d.feat1_desc }, { title: d.feat2_title, desc: d.feat2_desc },
      { title: d.feat3_title, desc: d.feat3_desc }, { title: d.feat4_title, desc: d.feat4_desc },
      { title: d.feat5_title, desc: d.feat5_desc }, { title: d.feat6_title, desc: d.feat6_desc },
    ];
    featsData.forEach((f, i) => {
      if (!feats[i]) return;
      setEl(feats[i].querySelector('.feature-title'), f.title);
      setEl(feats[i].querySelector('.feature-desc'), f.desc);
    });

    // Dark section
    const dsH2 = document.querySelector('.product-section h2');
    if (dsH2 && d.dark_h2_line1) {
      const em = d.dark_h2_line2 ? `<br><em>${d.dark_h2_line2}</em>` : '';
      dsH2.innerHTML = d.dark_h2_line1 + em;
    }
    setEl(document.querySelector('.product-section .section-lead'), d.dark_lead);

    // Product visual image
    if (d.dark_image) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit';
          pv.appendChild(img);
        }
        img.src = d.dark_image;
      }
    }

    // Spec table — support array or flat
    const specs = document.querySelectorAll('.spec-list li');
    const specsData = d.specs || [
      { key: d.spec1_key, val: d.spec1_val }, { key: d.spec2_key, val: d.spec2_val },
      { key: d.spec3_key, val: d.spec3_val }, { key: d.spec4_key, val: d.spec4_val },
      { key: d.spec5_key, val: d.spec5_val }, { key: d.spec6_key, val: d.spec6_val },
      { key: d.spec7_key, val: d.spec7_val },
    ];
    specsData.forEach((s, i) => {
      if (!specs[i]) return;
      setEl(specs[i].querySelector('.spec-key'), s.key);
      setEl(specs[i].querySelector('.spec-val'), s.val);
    });

    // Proof numbers — support array or flat
    const proofs = document.querySelectorAll('.proof-card');
    const proofsData = d.proof || [
      { number: d.proof1_number, label: d.proof1_label, desc: d.proof1_desc },
      { number: d.proof2_number, label: d.proof2_label, desc: d.proof2_desc },
      { number: d.proof3_number, label: d.proof3_label, desc: d.proof3_desc },
      { number: d.proof4_number, label: d.proof4_label, desc: d.proof4_desc },
    ];
    proofsData.forEach((p, i) => {
      if (!proofs[i]) return;
      setEl(proofs[i].querySelector('.proof-number'), p.number);
      setEl(proofs[i].querySelector('.proof-label'), p.label);
      setEl(proofs[i].querySelector('.proof-desc'), p.desc);
    });

    // CTA
    setEl(document.querySelector('.cta-card h2'), d.cta_h2);
    setEl(document.querySelector('.cta-card .section-lead'), d.cta_lead);
    const ctaBtn = document.querySelector('.cta-card .btn-white');
    if (ctaBtn && d.cta_btn) ctaBtn.textContent = d.cta_btn;

    // Announcement bar
    if (d.announcements && d.announcements.length) {
      const track = document.querySelector('.announcement-track');
      if (track) {
        const doubled = [...d.announcements, ...d.announcements];
        track.innerHTML = doubled.map(a => {
          const txt = a.link_url
            ? `${a.text} <a href="${a.link_url}">${a.link_label || a.link_url}</a>`
            : a.text;
          return `<span class="announcement-item">${txt}</span><span class="announcement-sep">·</span>`;
        }).join('');
      }
    }
  }

  // ── GENERIC PAGE ─────────────────────────────────────────────

  function applyPage(d) {
    if (!d) return;

    // Video slot (hidden by default, shown when URL set)
    const wrap = document.getElementById('heroWrap') || document.querySelector('.hero-video-wrap');
    if (wrap && d.hero_video_url) setVideo(wrap, d.hero_video_url);

    // Hero image
    if (d.hero_image) {
      document.querySelectorAll('.page-header img,.hero-img img,[data-cms="hero_image"]').forEach(el => {
        el.src = d.hero_image;
      });
    }

    // Header text — h1 uses innerHTML to preserve <em>
    const h1 = document.querySelector('.page-header h1, h1');
    if (h1 && d.hero_h1) h1.innerHTML = d.hero_h1;
    setEl(document.querySelector('.page-header-sub,.hero-sub'), d.hero_sub);
    setEl(document.querySelector('.page-header-eyebrow,.hero-eyebrow'), d.hero_eyebrow);

    // Stats
    const stats = document.querySelectorAll('.stat-item');
    const statsArr = d.stats || [];
    if (statsArr.length) {
      statsArr.forEach((s, i) => {
        if (!stats[i]) return;
        setEl(stats[i].querySelector('.stat-label'), s.label);
        setEl(stats[i].querySelector('.stat-number'), s.number);
        setEl(stats[i].querySelector('.stat-note'), s.note);
      });
    } else {
      // Legacy flat fields
      for (let i = 1; i <= 4; i++) {
        if (!stats[i-1]) break;
        setEl(stats[i-1].querySelector('.stat-label'), d[`stat${i}_label`]);
        setEl(stats[i-1].querySelector('.stat-number'), d[`stat${i}_number`]);
        setEl(stats[i-1].querySelector('.stat-note'), d[`stat${i}_note`]);
      }
    }

    // Feature cards
    const feats = document.querySelectorAll('.feature-card');
    const featsArr = d.features || [];
    if (featsArr.length) {
      featsArr.forEach((f, i) => {
        if (!feats[i]) return;
        setEl(feats[i].querySelector('.feature-title'), f.title);
        setEl(feats[i].querySelector('.feature-desc'), f.desc);
      });
    }

    // Gallery images (helix-product)
    const galleryArr = d.gallery || [];
    if (galleryArr.length) {
      const galleryWrap = document.getElementById('cms-gallery');
      if (galleryWrap) {
        galleryArr.forEach((img, i) => {
          const el = galleryWrap.querySelector(`[data-cms="gallery_${i+1}"], img:nth-child(${i+1})`);
          if (el && img.url) { el.src = img.url; el.style.display = 'block'; if (img.alt) el.alt = img.alt; }
        });
      }
      // Also handle flat gallery slots
      for (let i = 1; i <= 4; i++) {
        const el = document.querySelector(`[data-cms="gallery_${i}"]`);
        if (el && galleryArr[i-1]?.url) { el.src = galleryArr[i-1].url; el.style.display = 'block'; }
      }
    }

    // Main product image
    if (d.main_image) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; pv.appendChild(img); }
        img.src = d.main_image;
      }
    }

    // Spec table
    const specs = document.querySelectorAll('.spec-list li');
    const specsArr = d.specs || [];
    if (specsArr.length) {
      specsArr.forEach((s, i) => {
        if (!specs[i]) return;
        setEl(specs[i].querySelector('.spec-key'), s.key);
        setEl(specs[i].querySelector('.spec-val'), s.val);
      });
    }

    // Solution cards
    const sols = document.querySelectorAll('.solution-card');
    const solsArr = d.solutions || [];
    if (solsArr.length) {
      solsArr.forEach((s, i) => {
        if (!sols[i]) return;
        setEl(sols[i].querySelector('.solution-tag'), s.tag);
        setEl(sols[i].querySelector('.solution-title'), s.title);
        setEl(sols[i].querySelector('.solution-desc'), s.desc);
        if (s.anchor) {
          const link = sols[i].querySelector('.solution-link, a');
          if (link) link.href = `solutions.html#${s.anchor}`;
        }
      });
    }

    // Client logos (about page)
    const logosArr = d.client_logos || [];
    if (logosArr.length) {
      const track = document.querySelector('.client-logos-track, .client-logos');
      if (track) {
        const existingItems = track.querySelectorAll('.client-logo-item');
        logosArr.forEach((logo, i) => {
          if (existingItems[i]) {
            const img = existingItems[i].querySelector('img');
            if (img) { img.src = logo.url; img.alt = logo.alt || ''; img.style.display = 'block'; }
            existingItems[i].style.display = 'flex';
            if (logo.link) {
              const a = existingItems[i].closest('a') || existingItems[i].querySelector('a');
              if (a) a.href = logo.link;
            }
          } else {
            // New logo slot
            const div = document.createElement('div');
            div.className = 'client-logo-item';
            div.style.display = 'flex';
            const inner = logo.link ? `<a href="${logo.link}" target="_blank" rel="noopener">` : '';
            const innerClose = logo.link ? '</a>' : '';
            div.innerHTML = `${inner}<img src="${logo.url}" alt="${logo.alt||''}" style="height:72px;width:auto;object-fit:contain">${innerClose}`;
            track.appendChild(div);
          }
        });
      }
    }

    // CTA
    setEl(document.querySelector('.cta-card h2'), d.cta_h2);
    setEl(document.querySelector('.cta-card .section-lead'), d.cta_lead);

    // data-cms attribute slots (catch-all)
    Object.keys(d).forEach(key => {
      if (!d[key] || typeof d[key] !== 'string') return;
      document.querySelectorAll(`[data-cms="${key}"]`).forEach(el => {
        if (el.tagName === 'IMG') el.src = d[key];
        else setEl(el, d[key]);
      });
    });
  }

  // ── HUB COLLECTIONS ──────────────────────────────────────────

  function loadCollections() {
    // News feed
    const newsFeed = document.getElementById('cms-news-feed');
    if (newsFeed) {
      loadCollection('news').then(items => {
        const pub = items.filter(n => n.status !== 'draft').sort((a, b) => new Date(b.date) - new Date(a.date));
        newsFeed.innerHTML = pub.length
          ? pub.map(n => `
            <div style="background:white;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px">
              ${n.image ? `<img src="${n.image}" alt="${n.title}" style="width:100%;height:180px;object-fit:cover">` : ''}
              <div style="padding:20px">
                <span style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--blue);background:var(--blue-bg);padding:3px 9px;border-radius:980px">${n.type || 'news'}</span>
                <div style="font-size:16px;font-weight:500;margin:10px 0 6px">${n.title}</div>
                <div style="font-size:13px;font-weight:300;color:var(--mid-gray);line-height:1.65;margin-bottom:10px">${n.summary || ''}</div>
                <span style="font-size:11px;color:var(--mid-gray)">${n.date || ''}</span>
                ${n.link ? `<a href="${n.link}" target="_blank" style="margin-left:12px;font-size:12px;font-weight:500;color:var(--blue);text-decoration:none">Read more →</a>` : ''}
              </div>
            </div>`).join('')
          : '<p style="color:var(--mid-gray);font-weight:300">No news items published yet.</p>';
      });
    }

    // Social feed
    const socialFeed = document.getElementById('cms-social-feed');
    if (socialFeed) {
      loadCollection('social').then(items => {
        const posts = items.sort((a, b) => new Date(b.date) - new Date(a.date));
        socialFeed.innerHTML = posts.length
          ? posts.map(p => `
            <div style="border:1px solid var(--border);border-radius:16px;padding:20px;background:white;margin-bottom:12px">
              ${p.image ? `<img src="${p.image}" style="width:100%;border-radius:10px;margin-bottom:12px;max-height:220px;object-fit:cover" alt="">` : ''}
              <p style="font-size:14px;font-weight:300;line-height:1.65">${p.caption}</p>
              ${p.url ? `<a href="${p.url}" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:500;color:var(--blue);text-decoration:none">View post →</a>` : ''}
            </div>`).join('')
          : '<p style="color:var(--mid-gray);font-weight:300">No social posts yet.</p>';
      });
    }

    // Vault
    const vaultList = document.getElementById('cms-vault-list');
    if (vaultList) {
      loadCollection('vault').then(items => {
        const pub = items.filter(v => v.access !== 'internal');
        const ICONS = { pdf: '📄', doc: '📝', xls: '📊', ppt: '📋', dwg: '📐', zip: '🗜️', link: '🔗' };
        if (pub.length) {
          vaultList.innerHTML = pub.map(v => `
            <a href="${v.url}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:white;margin-bottom:8px;text-decoration:none;color:inherit">
              <div style="width:34px;height:34px;border-radius:8px;background:var(--blue-bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${ICONS[v.filetype] || '📄'}</div>
              <div><div style="font-size:13px;font-weight:500">${v.name}</div><div style="font-size:11px;color:var(--mid-gray)">${v.category}</div></div>
            </a>`).join('');
        }
      });
    }
  }

  // Load a collection — works with both Decap (individual files) and legacy index.json
  function loadCollection(name) {
    // Try Decap folder structure first (individual .json files)
    return get(`/_data/${name}/index.json`).then(index => {
      if (index && index.files && index.files.length) {
        return Promise.all(index.files.map(f => get(`/_data/${name}/${f}`))).then(r => r.filter(Boolean));
      }
      // Decap creates individual files without an index — scan via a known list or return empty
      return [];
    }).catch(() => []);
  }

  // ── GLOBAL SETTINGS ──────────────────────────────────────────

  function applyGlobal(d) {
    if (!d) return;
    // Update footer contact details
    document.querySelectorAll('[data-cms="phone"], a[href^="tel"]').forEach(el => {
      if (d.phone) { if (el.href) el.href = `tel:${d.phone.replace(/\s/g, '')}`; setEl(el.querySelector('span') || el, d.phone); }
    });
    document.querySelectorAll('[data-cms="email"], a[href^="mailto"]').forEach(el => {
      if (d.email) { if (el.href) el.href = `mailto:${d.email}`; setEl(el.querySelector('span') || el, d.email); }
    });
    document.querySelectorAll('[data-cms="address"]').forEach(el => { if (d.address) setEl(el, d.address); });
    // Tawk.to — swap chat ID if different
    if (d.tawk_id && !window._tawkInitialised) {
      window._tawkInitialised = true;
    }
  }

  // ── BOOT ─────────────────────────────────────────────────────

  function boot() {
    // Always load global settings
    get('/_data/global.json').then(applyGlobal);

    if (IS_HOME) {
      // Homepage reads from both _data/homepage.json (Decap) and _data/pages.json (legacy admin)
      Promise.all([
        get('/_data/homepage.json'),
        get('/_data/pages.json'),
      ]).then(([hp, pages]) => {
        const d = hp || (pages && pages.homepage) || null;
        applyHomepage(d);
      });
    } else {
      // Other pages: try _data/pages/PAGE.json (Decap) then _data/pages.json[PAGE] (legacy)
      Promise.all([
        get(`/_data/pages/${PAGE}.json`),
        get('/_data/pages.json'),
      ]).then(([pageData, allPages]) => {
        const d = pageData || (allPages && allPages[PAGE]) || null;
        applyPage(d);
      });
    }

    if (IS_HUB) loadCollections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
