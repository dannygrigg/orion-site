# Orion Admin — Setup & Handover

This replaces the old PIN-based admin with a Netlify Identity / Git Gateway flow. No PIN, no GitHub token in the browser. Anyone you invite can edit; nobody else can. Edits are committed under each editor's own identity, so you have a real audit trail in Git history.

## Files in this update

```
admin.html       (replaces existing — full rewrite)
cms.js           (replaces existing — adds new-format reads + legacy fallback + live preview bridge)
netlify.toml     (replaces existing — adds noindex header for admin.html)
```

Drop these three files in the repo root over the existing ones, commit, push to `main`. Netlify rebuilds automatically.

## One-time Netlify setup (you do this — I can't from chat)

You said Identity and Git Gateway are already enabled. Quickly re-verify:

1. **Netlify dashboard → Site configuration → Identity**
   - Status: **Enabled**
   - Registration preferences: **Invite only**
   - External providers: optional — you can add Google sign-in here if you want one-click login
   - **Git Gateway**: scroll to the bottom of the Identity page → enable if not already

2. **Invite users**
   - Identity page → **Invite users** → add Danny's email and any colleagues
   - They get an email, set a password, can sign in at `/admin.html`

3. **Revoke the old GitHub PAT**
   - Go to https://github.com/settings/tokens
   - Find `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` and click **Delete**
   - You no longer need a PAT — Git Gateway uses an Anthropic-internal credential

## How it works

- **Login**: `/admin.html` shows a Sign In button. The Netlify Identity widget opens. Users sign in with email/password (or Google/GitHub if you enable external providers).
- **Reads**: The admin reads JSON files directly from the public site (fast, no auth needed) and via Git Gateway when checking for unpublished drafts.
- **Writes**: Every save/publish goes through `/.netlify/git/github/...` — Netlify proxies to GitHub with a credential it holds server-side. The browser never sees a GitHub token.
- **Drafts**: Saving a draft commits to `_data/_drafts/<path>` instead of `_data/<path>`. Publishing copies draft → live and deletes the draft. The preview iframe shows live OR draft content via a Draft/Live toggle.
- **Live preview**: As you type, the iframe updates within ~600ms via a `postMessage` bridge to `cms.js` — no rebuild needed for the preview to reflect typing.

## Editor features

- Schema-driven form (same fields as the old `admin/config.yml` Decap schema, so no content loss)
- Image upload: drag/drop or click. Image commits to `images/uploads/`, URL is filled in for you. 5MB cap per file.
- Repeating sections (stats, features, announcements, etc.) with add/remove/reorder
- Live preview pane with Desktop / Tablet / Mobile viewport switch
- Draft / Live toggle on the preview pane
- News, Social, Vault collections with full CRUD + auto-rebuild of the `index.json` for each
- Mobile-responsive: edit/preview tabs on phones
- Unsaved-changes guard before navigating away

## What changed from the previous setup

| Before | After |
| --- | --- |
| PIN `1234` in browser localStorage | Netlify Identity email/password per user |
| GitHub PAT in browser localStorage | Git Gateway (token held server-side by Netlify) |
| One button: save | Save Draft → Preview → Publish |
| Direct edits to GitHub from browser | Edits go via Netlify (auditable, revocable) |
| Single admin user (shared PIN) | Per-user accounts, full Git history shows who changed what |
| `cms.js` only read legacy `_data/pages.json` | `cms.js` now reads `_data/homepage.json` + `_data/pages/*.json`, with legacy fallback for safety |

## Known issues / follow-up work

1. **Old `_data/pages.json` still exists.** `cms.js` will prefer the new structured files but fall back to the old file if a structured file is missing. Once you've confirmed all pages render correctly from the structured files for a week or two, you can delete `_data/pages.json` and the fallback logic in `cms.js`.
2. **No `404.html` exists** but `netlify.toml` redirects to it. Create a `404.html` at the repo root with whatever 404 page you want, or remove the catch-all redirect.
3. **Image uploads grow the Git repo** over time. For a brochure site with moderate updates this is fine. If image volume grows heavy, swap in a media service (Cloudinary free tier works well — Helix already uses some Cloudinary URLs).
4. **The Decap admin at `/admin/index.html` still exists.** It's harmless — both auth flows use Netlify Identity + Git Gateway, so they could in theory co-exist. If you want a single admin entry, delete the `admin/` folder.

## Quick test plan after deploy

1. Visit `https://uksortation.netlify.app/admin.html` → see Sign In button (no PIN)
2. Sign in with your invited email → land in the admin
3. Click **Homepage** → existing content loads in left pane, live homepage in right
4. Edit the hero headline → within ~600ms, the preview iframe updates
5. **Save draft** → toast confirms, "Draft" badge appears, sidebar amber dot on Homepage
6. **Publish** → confirm modal → toast confirms; rebuild starts. Wait 30s, hard-refresh the public site to confirm.
7. **News & Events** → click + New → fill in title/date/summary → Save Draft → Publish → confirm it appears on `/hub.html`
8. Upload an image in any image field → confirm it commits to `images/uploads/`

## Rollback

If anything goes wrong, the old `admin.html` is recoverable from Git history. The new admin only writes to `_data/_drafts/...` until you click Publish, so unpublished work won't affect the live site.
