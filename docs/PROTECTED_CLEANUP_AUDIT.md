# Protected Cleanup Audit

This guard is intentionally isolated from the Vercel build command.

## Rules

1. It runs only in GitHub Actions for pull requests targeting `main`.
2. It inspects deleted source files against the PR base commit.
3. It blocks deletion of known protected modules.
4. It resolves static relative imports, including extension and index variants.
5. It does not modify `package.json`, `next.config.js`, or the Vercel build command.
6. Production deployment remains controlled by the existing Vercel pipeline.
7. A cleanup PR must pass both the dependency audit and the independent Next.js production build before merge.

The audit is deliberately conservative. Dynamic/runtime dependencies still require manual review when the static graph cannot prove safety.
