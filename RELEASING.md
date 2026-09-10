# Release Runbook — FE-POS-App

This repo does **not** deploy via GitHub Actions. Disabling that no-op `deploy`
job removed a fake release gate; the real release flow is the Vercel Git
integration below.

## Release flow

1. **Push / open a PR** against `master`. CI (`.github/workflows/ci.yml`)
   runs `lint`, `jest`, and a production `build` (with
   `VITE_BASE_URL=https://api-bisa-nota.vercel.app`).
2. **Wait for CI checks to PASS.** Nothing goes out otherwise.
3. **Merge the PR to `master`.** The Vercel Git integration detects the push
   and runs a production build + deployment automatically (project settings →
   Git integration → Production branch `master`).
4. **Post-deploy health check** (production):
   - Load the app URL (Vercel deployment, e.g. the project's production
     domain) and confirm the login page renders.
5. **Smoke test** the critical flow: log in → open the cashier screen → place
   an order → Kitchen Display shows it → settle the payment.
   - Also verify the API is reachable: `curl -I https://api-bisa-nota.vercel.app`
     should return a live response (that is the separate backend repo).

## Prerequisites on the platform

- Production env var `VITE_BASE_URL` must be set in the Vercel project
  (e.g. `https://api-bisa-nota.vercel.app`).
- Only merge to `master` after CI is green; the Vercel deployment is its own
  gate and can be rolled back from the Vercel dashboard if needed.