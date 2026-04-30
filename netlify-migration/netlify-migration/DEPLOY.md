# Orion MIS — Netlify + Decap CMS Deployment Guide

## What this migration does
- Moves hosting from GitHub Pages → Netlify (free tier, same repo)
- Adds Decap CMS at `/admin/` with proper auth (no GitHub token needed)
- Content stays in `_data/` JSON files — site still works as pure static HTML
- `cms.js` reads both new Decap format AND old admin format (backward compatible)
- All existing URLs continue to work

---

## STEP 1 — Add files to the repo

Upload these files to your `dannygrigg/orion-site` GitHub repo:

| File | Where |
|------|-------|
| `netlify.toml` | repo root |
| `admin/index.html` | repo root |
| `admin/config.yml` | repo root |
| `cms.js` | repo root (replace existing) |
| `_data/homepage.json` | repo root (replace existing) |
| `_data/global.json` | repo root (replace existing) |
| `_data/pages/helix-product.json` | create `_data/pages/` folder |
| `_data/pages/solutions.json` | same |
| `_data/pages/about.json` | same |
| `_data/pages/case-studies.json` | same |
| `_data/pages/unit-handling.json` | same |
| `_data/pages/pallet-heavy.json` | same |
| `_data/pages/food-beverage.json` | same |
| `_data/pages/hub.json` | same |
| `_data/pages/contact.json` | same |

---

## STEP 2 — Deploy to Netlify

1. Go to **app.netlify.com** → **Add new site → Import an existing project**
2. Choose **GitHub** → select `dannygrigg/orion-site`
3. Build settings:
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.`
4. Click **Deploy site**
5. Wait ~60 seconds → site is live at `https://RANDOM-NAME.netlify.app`
6. Go to **Site settings → Domain management** → rename to `orionmis.netlify.app` (or add your custom domain `orionmis.co.uk`)

---

## STEP 3 — Enable Netlify Identity

1. In Netlify dashboard → **Site settings → Identity**
2. Click **Enable Identity**
3. Under **Registration** → set to **Invite only** (important — stops anyone signing up)
4. Under **Services** → **Git Gateway** → click **Enable Git Gateway**
5. Go to **Identity tab** (top nav) → **Invite users** → enter your email address
6. Check your email → click the invite link → set your password

---

## STEP 4 — Test the CMS

1. Go to `https://orionmis.netlify.app/admin/`
2. Click **Login with Netlify Identity**
3. Sign in with the email/password you just set
4. You should see the full CMS interface with all content sections

---

## STEP 5 — Add Identity widget to HTML pages (optional but recommended)

Add this line to each HTML page just before `</body>` (after the existing cms.js line):

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
    }
  });
}
</script>
```

This lets editors log in from any page and be redirected to the CMS.

---

## STEP 6 — Point your domain to Netlify (when ready)

1. Netlify → **Domain settings → Add custom domain** → enter `orionmis.co.uk`
2. Netlify will show you DNS records to add at your registrar
3. Add a CNAME: `www` → `your-site.netlify.app`
4. Add an A record: `@` → Netlify's load balancer IP (shown in dashboard)
5. SSL is automatic via Let's Encrypt (free)

---

## How the CMS works after setup

| Action | What happens |
|--------|-------------|
| Editor logs in at `/admin/` | Netlify Identity auth → Decap CMS loads |
| Editor changes homepage headline | Decap commits `_data/homepage.json` to GitHub |
| Netlify detects commit | Auto-deploys in ~30 seconds |
| Visitor loads the page | `cms.js` fetches `_data/homepage.json` and applies changes |

No tokens needed. No copy/paste. No GitHub access for editors.

---

## Data file structure

```
_data/
  homepage.json          ← Homepage content (video, text, stats, features)
  global.json            ← Phone, email, address
  pages/
    helix-product.json   ← Helix page content
    solutions.json       ← Solutions page
    about.json           ← About page (includes logos array)
    case-studies.json    ← Case studies index
    unit-handling.json
    pallet-heavy.json
    food-beverage.json
    hub.json
    contact.json
  news/                  ← Individual news items (one .json per item)
  vault/                 ← Individual vault docs
  social/                ← Individual social posts
  case-studies/          ← Individual case study detail files
```

---

## Backward compatibility

The new `cms.js` reads BOTH:
- `_data/homepage.json` (new Decap format with arrays)
- `_data/pages.json` (old admin format with flat keys)

So the site will work during transition. Once you've migrated content into Decap, the old `pages.json` can be deleted.

---

## Security

- **CMS auth:** Netlify Identity (JWT tokens, not GitHub tokens)
- **Git Gateway:** Netlify acts as proxy — editors never need GitHub access
- **Invite only:** Registration disabled, editors invited by email only
- **Admin URL indexed:** `/admin/` has `X-Robots-Tag: noindex` via netlify.toml
- **No API tokens in browser:** Unlike the old admin panel
- **HTTPS:** Automatic on Netlify (Let's Encrypt)
- **Headers:** Security headers set in netlify.toml (X-Frame-Options, CSP, etc.)

---

## Rollback plan

If anything goes wrong on Netlify:
- GitHub Pages is still live at `dannygrigg.github.io/orion-site/`
- Just update your DNS back to GitHub Pages IPs
- Zero data loss — both point to the same repo
