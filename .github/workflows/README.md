# PR CI logs

This workflow runs on pull requests targeting main/master. It installs dependencies with `npm ci` and runs `npm run build` to ensure the branch builds successfully before merge.

If your project uses a different package manager (yarn/pnpm) or requires additional steps (tests, lint), update `.github/workflows/ci.yml` accordingly.
