Meli — Digital Care Package

This is a small static site scaffold to create a private, local "digital care package" for your friend Meli.

How to use

- Open `index.html` in a browser (double-click). The site stores data in your browser's LocalStorage.

Features

- Curated Soundtrack: add songs and write a memory per song. You can provide a direct audio URL to play the song, or leave it blank.
- Map of Adventures: click the map to add pins (places to visit or with memories). Pins are saved locally and can be exported as JSON.
- Inside Jokes: add short lines.
- Timeline: static placeholders — replace with real dates and memories.

Customization

- Colors are in `styles.css` variables. Replace `--accent-purple`, `--accent-green`, `--accent-orange` with hex values you like.
- Swap the font in `index.html` by editing the Google Fonts link.

Notes

- This is intentionally offline/private — everything is stored locally in the browser. Move the folder to a simple web host or Carrd if you want a shareable link.

Placeholders

- Replace placeholder text and entries with real memories, song links, and jokes. The project seeds a few placeholder entries for guidance.

---

Repository & deployment

I created a GitHub repository you can push to: https://github.com/Regine12/meldigicare.git

To push this project to that repo (run these from the project folder in a terminal):

1) Initialize and push (if you haven't already):

   git init
   git add .
   git commit -m "Initial: Meli digital care package"
   git branch -M main
   git remote add origin https://github.com/Regine12/meldigicare.git
   git push -u origin main

2) Deploy options (pick one):

- Netlify (recommended for static sites):
  - Option A — Quick (Netlify UI): In Netlify, choose "New site from Git", connect GitHub, select the `Regine12/meldigicare` repo, and deploy. No build command needed — leave Publish directory as `/` or set to the project root.
  - Option B — Drop: drag the project folder to app.netlify.com/drop to publish a one-off static site.
  - Option C — CLI: install the Netlify CLI (`npm i -g netlify-cli`) then run `netlify deploy --prod --dir=.` after `netlify login` and `netlify init` to link to a site.

- Vercel: Connect the GitHub repo in Vercel and deploy. Also works well for static sites.

Sharing and privacy

- If you want the site private, keep the GitHub repo private and use Netlify's access controls (or a password-protected page) on the hosted site.
- If you prefer a single-file HTML to email or paste as a Gist, I can generate a single-file export that inlines CSS, JS, and seeded images so it's easy to share.

Next steps I can do for you

- Create a single-file (self-contained) HTML export ready to email or paste into a hosting page.
- Prepare a short Netlify deploy guide or runbook tailored to your GitHub permissions.
- Add more seeded content (memories, photos, jokes) if you paste them here and I will insert them into the site.

If you want the single-file export now, say: make single-file and I'll produce it.
