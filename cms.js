// ── ORION CMS LOADER ─────────────────────────────────────
// Reads _data/pages.json (written by admin panel) and applies
// content to the current page. Zero rebuild required.
(function(){
  'use strict';
  const BASE = window.location.pathname.includes('/orion-site') ? '/orion-site' : '';
  const PAGE = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  // Convert YouTube watch URL to embed URL
  function toEmbed(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url; // already embed
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!m) return url;
    const vid = m[1];
    return 'https://www.youtube.com/embed/' + vid + '?autoplay=1&mute=1&loop=1&playlist=' + vid + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1';
  }

  function get(path) {
    return fetch(BASE + path + '?v=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  // ── APPLY HOMEPAGE ──────────────────────────────────────
  function applyHomepage(d) {
    if (!d) return;

    // Hero video
    const wrap = document.getElementById('heroWrap');
    if (wrap && d.hero_video_url) {
      const embedUrl = toEmbed(d.hero_video_url);
      wrap.style.cssText = 'position:relative;overflow:hidden;border-radius:var(--radius-xl,28px) var(--radius-xl,28px) 0 0;aspect-ratio:16/10;background:#000';
      wrap.innerHTML = '<iframe src="' + embedUrl + '" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay;encrypted-media" allowfullscreen></iframe>';
    }

    // Headlines
    const h1 = document.querySelector('.hero h1');
    if (h1 && (d.hero_line1 || d.hero_line2)) {
      h1.innerHTML = (d.hero_line1 || '') + (d.hero_line2 ? '<br><em>' + d.hero_line2 + '</em>' : '');
    }

    // Body text
    const sub = document.querySelector('.hero-sub');
    if (sub && d.hero_body) {
      sub.textContent = d.hero_body;
    }

    // Eyebrow
    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow && d.hero_eyebrow) {
      eyebrow.childNodes[eyebrow.childNodes.length - 1].textContent = d.hero_eyebrow;
    }

    // Stats bar
    const stats = document.querySelectorAll('.stat-item');
    [[d.stat1_label, d.stat1_number, d.stat1_note],
     [d.stat2_label, d.stat2_number, d.stat2_note],
     [d.stat3_label, d.stat3_number, d.stat3_note],
     [d.stat4_label, d.stat4_number, d.stat4_note]].forEach((s, i) => {
      if (!stats[i]) return;
      if (s[0]) { const el = stats[i].querySelector('.stat-label'); if (el) el.textContent = s[0]; }
      if (s[1]) { const el = stats[i].querySelector('.stat-number'); if (el) el.textContent = s[1]; }
      if (s[2]) { const el = stats[i].querySelector('.stat-note'); if (el) el.textContent = s[2]; }
    });

    // Feature cards
    const feats = document.querySelectorAll('.feature-card');
    [[d.feat1_title, d.feat1_desc],[d.feat2_title, d.feat2_desc],[d.feat3_title, d.feat3_desc],
     [d.feat4_title, d.feat4_desc],[d.feat5_title, d.feat5_desc],[d.feat6_title, d.feat6_desc]].forEach((f, i) => {
      if (!feats[i]) return;
      if (f[0]) { const el = feats[i].querySelector('.feature-title'); if (el) el.textContent = f[0]; }
      if (f[1]) { const el = feats[i].querySelector('.feature-desc'); if (el) el.textContent = f[1]; }
    });

    // Dark section — product visual image
    if (d.dark_image) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl,28px)'; pv.appendChild(img); }
        img.src = d.dark_image;
      }
    }

    // Spec list values
    const specs = document.querySelectorAll('.spec-list li');
    [[d.spec1_key, d.spec1_val],[d.spec2_key, d.spec2_val],[d.spec3_key, d.spec3_val],[d.spec4_key, d.spec4_val],
     [d.spec5_key, d.spec5_val],[d.spec6_key, d.spec6_val],[d.spec7_key, d.spec7_val]].forEach((s, i) => {
      if (!specs[i]) return;
      if (s[0]) { const el = specs[i].querySelector('.spec-key'); if (el) el.textContent = s[0]; }
      if (s[1]) { const el = specs[i].querySelector('.spec-val'); if (el) el.textContent = s[1]; }
    });

    // Proof numbers
    const proofs = document.querySelectorAll('.proof-card');
    [[d.proof1_number, d.proof1_label, d.proof1_desc],[d.proof2_number, d.proof2_label, d.proof2_desc],
     [d.proof3_number, d.proof3_label, d.proof3_desc],[d.proof4_number, d.proof4_label, d.proof4_desc]].forEach((p, i) => {
      if (!proofs[i]) return;
      if (p[0]) { const el = proofs[i].querySelector('.proof-number'); if (el) el.textContent = p[0]; }
      if (p[1]) { const el = proofs[i].querySelector('.proof-label'); if (el) el.textContent = p[1]; }
      if (p[2]) { const el = proofs[i].querySelector('.proof-desc'); if (el) el.textContent = p[2]; }
    });

    // CTA
    if (d.cta_h2) { const el = document.querySelector('.cta-card h2'); if (el) el.textContent = d.cta_h2; }
    if (d.cta_lead) { const el = document.querySelector('.cta-card .section-lead'); if (el) el.textContent = d.cta_lead; }

    // Announcement bar
    if (d.announcements && d.announcements.length) {
      const track = document.querySelector('.announcement-track');
      if (track) {
        const doubled = [...d.announcements, ...d.announcements];
        track.innerHTML = doubled.map(a => {
          const txt = a.link_url
            ? a.text + ' <a href="' + a.link_url + '">' + (a.link_label || a.link_url) + '</a>'
            : a.text;
          return '<span class="announcement-item">' + txt + '</span><span class="announcement-sep">·</span>';
        }).join('');
      }
    }
  }

  // ── APPLY ANY PAGE ──────────────────────────────────────
  function applyPage(pageId, d) {
    if (!d) return;

    // Hero video
    const videoUrl = d.hero_video_url;
    if (videoUrl) {
      const wrap = document.getElementById('heroWrap') || document.querySelector('.hero-video-wrap');
      if (wrap) {
        const embedUrl = toEmbed(videoUrl);
        wrap.style.cssText = 'position:relative;overflow:hidden;border-radius:var(--radius-xl,28px) var(--radius-xl,28px) 0 0;aspect-ratio:16/10;background:#000';
        wrap.innerHTML = '<iframe src="' + embedUrl + '" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay;encrypted-media" allowfullscreen></iframe>';
      }
    }

    // Hero image
    if (d.hero_image) {
      const slots = document.querySelectorAll('.page-header img, .hero-img img, [data-cms="hero_image"]');
      slots.forEach(el => { el.src = d.hero_image; });
    }

    // Page header text
    if (d.hero_h1) { const el = document.querySelector('.page-header h1, h1'); if (el) el.textContent = d.hero_h1; }
    if (d.hero_sub) { const el = document.querySelector('.page-header-sub, .hero-sub'); if (el) el.textContent = d.hero_sub; }
    if (d.hero_eyebrow) { const el = document.querySelector('.page-header-eyebrow, .hero-eyebrow'); if (el) el.textContent = d.hero_eyebrow; }

    // Stats
    const stats = document.querySelectorAll('.stat-item');
    for (let i = 1; i <= 4; i++) {
      if (!stats[i-1]) break;
      const lbl = d['stat'+i+'_label'], num = d['stat'+i+'_number'], note = d['stat'+i+'_note'];
      if (lbl) { const el = stats[i-1].querySelector('.stat-label'); if (el) el.textContent = lbl; }
      if (num) { const el = stats[i-1].querySelector('.stat-number'); if (el) el.textContent = num; }
      if (note) { const el = stats[i-1].querySelector('.stat-note'); if (el) el.textContent = note; }
    }

    // Feature cards
    const feats = document.querySelectorAll('.feature-card');
    for (let i = 1; i <= 6; i++) {
      if (!feats[i-1]) break;
      const t = d['feat'+i+'_title'], desc = d['feat'+i+'_desc'];
      if (t) { const el = feats[i-1].querySelector('.feature-title'); if (el) el.textContent = t; }
      if (desc) { const el = feats[i-1].querySelector('.feature-desc'); if (el) el.textContent = desc; }
    }

    // Solution cards
    const sols = document.querySelectorAll('.solution-card');
    for (let i = 1; i <= 6; i++) {
      if (!sols[i-1]) break;
      const tag = d['sol'+i+'_tag'], title = d['sol'+i+'_title'], desc = d['sol'+i+'_desc'];
      if (tag) { const el = sols[i-1].querySelector('.solution-tag'); if (el) el.textContent = tag; }
      if (title) { const el = sols[i-1].querySelector('.solution-title'); if (el) el.textContent = title; }
      if (desc) { const el = sols[i-1].querySelector('.solution-desc'); if (el) el.textContent = desc; }
    }

    // Spec list
    const specs = document.querySelectorAll('.spec-list li');
    for (let i = 1; i <= 8; i++) {
      if (!specs[i-1]) break;
      const k = d['spec'+i+'_key'], v = d['spec'+i+'_val'];
      if (k) { const el = specs[i-1].querySelector('.spec-key'); if (el) el.textContent = k; }
      if (v) { const el = specs[i-1].querySelector('.spec-val'); if (el) el.textContent = v; }
    }

    // Product visual image
    if (d.dark_image || d.main_image) {
      const img_url = d.dark_image || d.main_image;
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; pv.appendChild(img); }
        img.src = img_url;
      }
    }

    // CTA
    if (d.cta_h2) { const el = document.querySelector('.cta-card h2'); if (el) el.textContent = d.cta_h2; }
    if (d.cta_lead) { const el = document.querySelector('.cta-card .section-lead'); if (el) el.textContent = d.cta_lead; }

    // data-cms attribute slots (for any element tagged with data-cms="field_id")
    Object.keys(d).forEach(key => {
      if (!d[key]) return;
      document.querySelectorAll('[data-cms="' + key + '"]').forEach(el => {
        if (el.tagName === 'IMG') el.src = d[key];
        else el.textContent = d[key];
      });
    });
  }

  // ── BOOT ──────────────────────────────────────────────
  function boot() {
    const isHome = PAGE === 'index' || PAGE === '' ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/orion-site/');

    get('/_data/pages.json').then(allPages => {
      if (!allPages) return;

      if (isHome && allPages.homepage) {
        applyHomepage(allPages.homepage);
      } else if (allPages[PAGE]) {
        applyPage(PAGE, allPages[PAGE]);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
