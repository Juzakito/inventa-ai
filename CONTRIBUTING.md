# Contribuir a INVENTA.AI

1. **Branches**: `feat/<tema>`, `fix/<tema>`, `docs/<tema>` desde `main`. Nunca push directo a `main` sin PR.
2. **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
3. **PR checklist**: `npm run lint` + `npm test` + `npm run build` en verde; screenshots si toca UI; sin secretos.
4. **CI**: cada PR corre `.github/workflows/ci.yml`. El merge a `main` despliega a producción vía Vercel automáticamente.
5. **Seguridad**: reportar vulnerabilidades por email (ver `SECURITY.md`), nunca en issues públicos.
