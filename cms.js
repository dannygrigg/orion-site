// ── ORION CMS LOADER ─────────────────────────────────────
(function(){
  'use strict';
  const BASE = window.location.pathname.includes('/orion-site') ? '/orion-site' : '';
  const PAGE = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  function toEmbed(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!m) return url;
    const v = m[1];
    return 'https://www.youtube.com/embed/'+v+'?autoplay=1&mute=1&loop=1&playlist='+v+'&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1';
  }

  // Safe setter — only updates if value is non-empty, preserves HTML tags
  function setEl(el, val) {
    if (!el || !val || val.trim() === '') return;
    if (val.includes('<')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  }

  function get(path) {
    return fetch(BASE + path + '?v=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  function applyVideo(d) {
    const url = d.hero_video_url;
    if (!url) return;
    const wrap = document.getElementById('heroWrap') || document.querySelector('.hero-video-wrap');
    if (!wrap) return;
    const embedUrl = toEmbed(url);
    wrap.style.cssText = 'position:relative;overflow:hidden;aspect-ratio:16/10;background:#000;display:block';
    wrap.innerHTML = '<iframe src="'+embedUrl+'" style="position:absolute;top:-10%;left:-10%;width:120%;height:120%;border:0;pointer-events:none" allow="autoplay;encrypted-media" allowfullscreen></iframe>';
  }


  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toYouTubeEmbed(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!m) return url;
    const v = m[1];
    return 'https://www.youtube.com/embed/' + v;
  }

  function renderMediaBlocks(blocks) {
    const container = document.getElementById('media-blocks');
    if (!container) return;
    if (!Array.isArray(blocks) || !blocks.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = blocks.map((block, i) => {
      if (!block || !block.type) return '';
      const title = block.title ? `<h3 class="media-block-title">${escapeHtml(block.title)}</h3>` : '';

      if (block.type === 'image') {
        if (!block.src) return '';
        return `
          <section class="section media-block-section">
            <div class="section-inner">
              <div class="media-block-card">
                ${title}
                <img class="media-block-image" src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || '')}">
              </div>
            </div>
          </section>
        `;
      }

      if (block.type === 'video') {
        if (!block.url) return '';
        const embed = toYouTubeEmbed(block.url);
        return `
          <section class="section media-block-section">
            <div class="section-inner">
              <div class="media-block-card">
                ${title}
                <div class="media-block-video-wrap">
                  <iframe src="${escapeHtml(embed)}" title="${escapeHtml(block.title || 'Video')}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
                ${block.caption ? `<p class="media-block-caption">${escapeHtml(block.caption)}</p>` : ''}
              </div>
            </div>
          </section>
        `;
      }

      if (block.type === 'carousel') {
        const slides = String(block.slides || '')
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean);

        if (!slides.length) return '';
        return `
          <section class="section media-block-section">
            <div class="section-inner">
              <div class="media-block-card">
                ${title}
                <div class="media-block-carousel" data-carousel="${i}">
                  <button class="media-nav media-nav-prev" type="button" aria-label="Previous slide">‹</button>
                  <div class="media-block-carousel-track">
                    ${slides.map((src, idx) => `
                      <img class="media-block-carousel-slide ${idx === 0 ? 'is-active' : ''}" src="${escapeHtml(src)}" alt="${escapeHtml((block.title || 'Carousel') + ' ' + (idx + 1))}">
                    `).join('')}
                  </div>
                  <button class="media-nav media-nav-next" type="button" aria-label="Next slide">›</button>
                </div>
              </div>
            </div>
          </section>
        `;
      }

      return '';
    }).join('');

    container.querySelectorAll('[data-carousel]').forEach(carousel => {
      const slides = [...carousel.querySelectorAll('.media-block-carousel-slide')];
      if (!slides.length) return;
      let current = 0;

      function showSlide(next) {
        current = (next + slides.length) % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === current));
      }

      carousel.querySelector('.media-nav-prev')?.addEventListener('click', () => showSlide(current - 1));
      carousel.querySelector('.media-nav-next')?.addEventListener('click', () => showSlide(current + 1));
    });
  }


  function applyHomepage(d) {
    if (!d) return;
    applyVideo(d);

    // h1 — rebuild with <em> for line 2
    const h1 = document.querySelector('.hero h1');
    if (h1 && d.hero_line1) {
      const line2 = d.hero_line2 ? '<br><em>' + d.hero_line2 + '</em>' : '';
      h1.innerHTML = d.hero_line1 + line2;
    }

    const sub = document.querySelector('.hero-sub');
    if (sub && d.hero_body) sub.textContent = d.hero_body;

    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow && d.hero_eyebrow) {
      const textNode = [...eyebrow.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (textNode) textNode.textContent = d.hero_eyebrow; else eyebrow.lastChild && (eyebrow.lastChild.textContent = d.hero_eyebrow);
    }

    // Stats
    const stats = document.querySelectorAll('.stat-item');
    [[d.stat1_label,d.stat1_number,d.stat1_note],[d.stat2_label,d.stat2_number,d.stat2_note],
     [d.stat3_label,d.stat3_number,d.stat3_note],[d.stat4_label,d.stat4_number,d.stat4_note]].forEach((s,i) => {
      if (!stats[i]) return;
      setEl(stats[i].querySelector('.stat-label'), s[0]);
      setEl(stats[i].querySelector('.stat-number'), s[1]);
      setEl(stats[i].querySelector('.stat-note'), s[2]);
    });

    // Feature cards
    const feats = document.querySelectorAll('.feature-card');
    [[d.feat1_title,d.feat1_desc],[d.feat2_title,d.feat2_desc],[d.feat3_title,d.feat3_desc],
     [d.feat4_title,d.feat4_desc],[d.feat5_title,d.feat5_desc],[d.feat6_title,d.feat6_desc]].forEach((f,i) => {
      if (!feats[i]) return;
      setEl(feats[i].querySelector('.feature-title'), f[0]);
      setEl(feats[i].querySelector('.feature-desc'), f[1]);
    });

    // Dark section
    const dsH2 = document.querySelector('.product-section h2');
    if (dsH2 && d.dark_h2_line1) {
      const em = d.dark_h2_line2 ? '<br><em>' + d.dark_h2_line2 + '</em>' : '';
      dsH2.innerHTML = d.dark_h2_line1 + em;
    }
    setEl(document.querySelector('.product-section .section-lead'), d.dark_lead);

    if (d.dark_image) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; pv.appendChild(img); }
        img.src = d.dark_image;
      }
    }

    // Specs
    const specs = document.querySelectorAll('.spec-list li');
    [[d.spec1_key,d.spec1_val],[d.spec2_key,d.spec2_val],[d.spec3_key,d.spec3_val],[d.spec4_key,d.spec4_val],
     [d.spec5_key,d.spec5_val],[d.spec6_key,d.spec6_val],[d.spec7_key,d.spec7_val]].forEach((s,i) => {
      if (!specs[i]) return;
      setEl(specs[i].querySelector('.spec-key'), s[0]);
      setEl(specs[i].querySelector('.spec-val'), s[1]);
    });

    // Proof
    const proofs = document.querySelectorAll('.proof-card');
    [[d.proof1_number,d.proof1_label,d.proof1_desc],[d.proof2_number,d.proof2_label,d.proof2_desc],
     [d.proof3_number,d.proof3_label,d.proof3_desc],[d.proof4_number,d.proof4_label,d.proof4_desc]].forEach((p,i) => {
      if (!proofs[i]) return;
      setEl(proofs[i].querySelector('.proof-number'), p[0]);
      setEl(proofs[i].querySelector('.proof-label'), p[1]);
      setEl(proofs[i].querySelector('.proof-desc'), p[2]);
    });

    // CTA
    setEl(document.querySelector('.cta-card h2'), d.cta_h2);
    setEl(document.querySelector('.cta-card .section-lead'), d.cta_lead);

    renderMediaBlocks(d.media_blocks);

    // Announcement bar
    if (d.announcements && d.announcements.length) {
      const track = document.querySelector('.announcement-track');
      if (track) {
        const doubled = [...d.announcements, ...d.announcements];
        track.innerHTML = doubled.map(a => {
          const txt = a.link_url ? a.text+' <a href="'+a.link_url+'">'+(a.link_label||a.link_url)+'</a>' : a.text;
          return '<span class="announcement-item">'+txt+'</span><span class="announcement-sep">·</span>';
        }).join('');
      }
    }
  }

  function applyPage(d) {
    if (!d) return;
    applyVideo(d);

    // Hero image
    if (d.hero_image) {
      document.querySelectorAll('.page-header img,.hero-img img,[data-cms="hero_image"]').forEach(el => { el.src = d.hero_image; });
    }

    // Page header text — use innerHTML to preserve <em> tags
    const ph1 = document.querySelector('.page-header h1, h1');
    if (ph1 && d.hero_h1) ph1.innerHTML = d.hero_h1;
    setEl(document.querySelector('.page-header-sub,.hero-sub'), d.hero_sub);
    setEl(document.querySelector('.page-header-eyebrow,.hero-eyebrow'), d.hero_eyebrow);

    // Stats
    const stats = document.querySelectorAll('.stat-item');
    for (let i=1;i<=4;i++) {
      if (!stats[i-1]) break;
      setEl(stats[i-1].querySelector('.stat-label'), d['stat'+i+'_label']);
      setEl(stats[i-1].querySelector('.stat-number'), d['stat'+i+'_number']);
      setEl(stats[i-1].querySelector('.stat-note'), d['stat'+i+'_note']);
    }

    // Feature cards
    const feats = document.querySelectorAll('.feature-card');
    for (let i=1;i<=6;i++) {
      if (!feats[i-1]) break;
      setEl(feats[i-1].querySelector('.feature-title'), d['feat'+i+'_title']);
      setEl(feats[i-1].querySelector('.feature-desc'), d['feat'+i+'_desc']);
    }

    // Solution cards
    const sols = document.querySelectorAll('.solution-card');
    for (let i=1;i<=6;i++) {
      if (!sols[i-1]) break;
      setEl(sols[i-1].querySelector('.solution-tag'), d['sol'+i+'_tag']);
      setEl(sols[i-1].querySelector('.solution-title'), d['sol'+i+'_title']);
      setEl(sols[i-1].querySelector('.solution-desc'), d['sol'+i+'_desc']);
    }

    // Spec list
    const specs = document.querySelectorAll('.spec-list li');
    for (let i=1;i<=8;i++) {
      if (!specs[i-1]) break;
      setEl(specs[i-1].querySelector('.spec-key'), d['spec'+i+'_key']);
      setEl(specs[i-1].querySelector('.spec-val'), d['spec'+i+'_val']);
    }

    // Product visual image
    const imgUrl = d.dark_image || d.main_image;
    if (imgUrl) {
      const pv = document.querySelector('.product-visual');
      if (pv) {
        let img = pv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; pv.appendChild(img); }
        img.src = imgUrl;
      }
    }

    // CTA
    setEl(document.querySelector('.cta-card h2'), d.cta_h2);
    setEl(document.querySelector('.cta-card .section-lead'), d.cta_lead);

    
    // Show/hide gallery images based on whether src is set
    document.querySelectorAll('img[data-cms]').forEach(img => {
      if (img.src && img.src !== '' && !img.src.endsWith('/orion-site/') && img.src !== window.location.href) {
        img.style.display = 'block';
      }
    });
    // Product visual: show image if set
    const pv = document.querySelector('.product-visual img');
    if (pv && pv.src && !pv.src.endsWith('/')) pv.style.display = 'block';
    
  // Client logos — show empty slots when src is provided via admin
  for (let i = 1; i <= 13; i++) {
    const logoEl = document.querySelector('[data-cms="client_logo_' + i + '"]');
    if (logoEl && d['client_logo_' + i]) {
      logoEl.src = d['client_logo_' + i];
      logoEl.style.display = 'block';
      const parent = logoEl.closest('.client-logo-item');
      if (parent) parent.style.display = 'flex';
    }
  }
  // data-cms attribute slots
    Object.keys(d).forEach(key => {
      if (!d[key]) return;
      document.querySelectorAll('[data-cms="'+key+'"]').forEach(el => {
        if (el.tagName === 'IMG') el.src = d[key]; else setEl(el, d[key]);
      });
    });
  }

  function loadCollections(data) {
    // News on hub page
    const newsFeed = document.getElementById('cms-news-feed');
    if (newsFeed) {
      get('/_data/news/index.json').then(idx => {
        if (!idx || !idx.files || !idx.files.length) { newsFeed.innerHTML = '<p style="color:var(--mid-gray);font-weight:300">No news items yet.</p>'; return; }
        Promise.all(idx.files.map(f => get('/_data/news/'+f))).then(items => {
          const pub = items.filter(Boolean).filter(n=>n.status!=='draft').sort((a,b)=>new Date(b.date)-new Date(a.date));
          if (!pub.length) { newsFeed.innerHTML = '<p style="color:var(--mid-gray);font-weight:300">No news items yet.</p>'; return; }
          newsFeed.innerHTML = pub.map(n => `<div style="background:white;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px">${n.image?'<img src="'+n.image+'" style="width:100%;height:180px;object-fit:cover">':''}<div style="padding:20px"><span style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--blue);background:var(--blue-bg);padding:3px 9px;border-radius:980px">${n.type||'news'}</span><div style="font-size:16px;font-weight:500;margin:10px 0 6px">${n.title}</div><div style="font-size:13px;font-weight:300;color:var(--mid-gray);line-height:1.65;margin-bottom:10px">${n.summary||''}</div><span style="font-size:11px;color:var(--mid-gray)">${n.date||''}</span>${n.link?'<a href="'+n.link+'" target="_blank" style="margin-left:12px;font-size:12px;font-weight:500;color:var(--blue);text-decoration:none">Read more →</a>':''}</div></div>`).join('');
        });
      });
    }
    // Social on hub page
    const socialFeed = document.getElementById('cms-social-feed');
    if (socialFeed) {
      get('/_data/social/index.json').then(idx => {
        if (!idx || !idx.files || !idx.files.length) { socialFeed.innerHTML = '<p style="color:var(--mid-gray);font-weight:300">No social posts yet.</p>'; return; }
        Promise.all(idx.files.map(f => get('/_data/social/'+f))).then(items => {
          const posts = items.filter(Boolean).sort((a,b)=>new Date(b.date)-new Date(a.date));
          if (!posts.length) { socialFeed.innerHTML = '<p style="color:var(--mid-gray);font-weight:300">No posts yet.</p>'; return; }
          socialFeed.innerHTML = posts.map(p => `<div style="border:1px solid var(--border);border-radius:16px;padding:20px;background:white;margin-bottom:12px">${p.image?'<img src="'+p.image+'" style="width:100%;border-radius:10px;margin-bottom:12px;max-height:220px;object-fit:cover">':''}<div style="font-size:14px;font-weight:300;line-height:1.65">${p.caption}</div>${p.url?'<a href="'+p.url+'" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:500;color:var(--blue);text-decoration:none">View post →</a>':''}</div>`).join('');
        });
      });
    }
    // Vault on hub page
    const vaultList = document.getElementById('cms-vault-list');
    if (vaultList) {
      get('/_data/vault/index.json').then(idx => {
        if (!idx || !idx.files || !idx.files.length) return;
        Promise.all(idx.files.map(f => get('/_data/vault/'+f))).then(items => {
          const docs = items.filter(Boolean).filter(v=>v.access!=='internal');
          if (!docs.length) return;
          vaultList.innerHTML = docs.map(v => `<a href="${v.url}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:white;margin-bottom:8px;text-decoration:none;color:inherit"><div style="width:34px;height:34px;border-radius:8px;background:var(--blue-bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">📄</div><div><div style="font-size:13px;font-weight:500">${v.name}</div><div style="font-size:11px;color:var(--mid-gray)">${v.category}</div></div></a>`).join('');
        });
      });
    }
  }

  function boot() {
    const isHome = PAGE === 'index' || PAGE === '' || window.location.pathname.endsWith('/orion-site/');
    const isHub = PAGE === 'hub';

    get('/_data/pages.json').then(allPages => {
      if (!allPages) return;
      if (isHome && allPages.homepage) applyHomepage(allPages.homepage);
      else if (allPages[PAGE]) applyPage(allPages[PAGE]);
    });

    if (isHub) loadCollections();
  }

  
  // Show gallery images once src is set
  document.querySelectorAll('[data-cms]').forEach(el => {
    if (el.tagName === 'IMG' && el.src && !el.src.endsWith('/') && el.src !== window.location.href) {
      el.style.display = 'block';
    }
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
