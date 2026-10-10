# Sudoku privacy subdomain deployment

Target: https://sudoku.nolsoopgames.com/privacy.html

Policy source remains home/sudoku/privacy.html. The build script changes the
canonical URL and converts studio navigation and assets to absolute URLs.
Do not edit generated sudoku-site files.

Cloudflare Pages Git setup:
- Repository: myoungwonkim/tamagotchi
- Production branch: main
- Framework: None
- Root directory: repository root
- Build command: python3 scripts/build_sudoku_site.py
- Build output directory: sudoku-site

After successful deployment, add sudoku.nolsoopgames.com in the Pages project's
Custom domains screen. At HostingKR, add a CNAME with host sudoku pointing to the
actual project hostname returned by Cloudflare (without https or any path).
Do not guess the pages.dev hostname. Leave the existing apex DNS records intact.

Activation checklist:
1. Verify HTTPS and the complete policy at the new hostname.
2. Change only Sudoku's link in home/privacy.html to the new address.
3. Replace the old published path with a redirect to the new address.
   Preserve the full policy source in a separate file first and update
   scripts/build_sudoku_site.py to read that source.
4. Update the Play Console privacy-policy URL.

Status when prepared: deployment/DNS setup pending; current public link retained.
