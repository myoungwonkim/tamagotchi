# `/notion` — deploy mirror only

**Do not edit HTML/CSS/JS here long-term.**

Canonical source: `notion-template-business/landing/`  
This folder is copied into the GitHub Pages artifact as `/notion/` so `https://nolsoopgames.com/notion/` works.

## Publish (from business repo)

```bash
rsync -a --delete --exclude README.md --exclude '.DS_Store' \
  /Users/myoungwonkim/Desktop/kaffeine/notion-template-business/landing/ \
  /Users/myoungwonkim/Desktop/kaffeine/tamagotchi/notion/

cd /Users/myoungwonkim/Desktop/kaffeine/tamagotchi
git add notion/ .github/workflows/pages.yml
git commit -m "Publish Notion landing mirror under /notion/"
git push origin main
```

`pages.yml` copies `notion/` → `_site/notion/` on each Pages deploy.
