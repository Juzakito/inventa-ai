# DEPLOY — Guía oficial de lanzamiento a producción

> Stack: frontend estático (`web/`) en Vercel · API FastAPI lista para Railway/Render/Fly · Postgres/Supabase.
> Tiempo estimado: 30 min (sin contar propagación DNS).

## 1. GitHub (comandos exactos)

```bash
cd Desktop/InventaAI
git init -b main
git add .
git commit -m "feat: lanzamiento v1.0.0 a producción"
gh repo create inventa-ai/inventa-ai --public --source=. --push
# Sin gh CLI: crear repo vacío en github.com → luego:
# git remote add origin https://github.com/<org>/inventa-ai.git
# git push -u origin main
```

Verificar: repo limpio, badge del workflow CI en verde, sin `.env` commiteado
(`git log --all -- .env` debe estar vacío).

## 2. Vercel — configuración exacta

**Opción A (dashboard, recomendada):** vercel.com → Add New → Project → importar
`inventa-ai` → **Root Directory: `./`** (el `vercel.json` ya apunta el output a `web/`)
→ Framework Preset: **Other** → Deploy. Conectar el repo activa **deploys
automáticos en cada push a `main`** (el CI es el gate).

**Opción B (CLI):**
```bash
npm i -g vercel
vercel link   # raíz del repo (Desktop/InventaAI)
vercel --prod
```

| Setting | Valor |
|---|---|
| Framework | Other (estático + build esbuild) |
| Build Command | `npm run build` (bundle → `public/`) |
| Output Directory | `public` (vía `vercel.json`) |
| Install Command | `npm ci` |
| Production Branch | `main` |

**Env vars del frontend:** ninguna requerida (sitio 100% estático).
Cuando se activen: `GA_MEASUREMENT_ID`, `CLARITY_PROJECT_ID`
(Project → Settings → Environment Variables → Production). Ver `.env.example`
para las vars de la **API** (se configuran donde se despliegue `api/`, no en este proyecto).

## 3. Dominio + DNS (registrador → Vercel)

En Vercel: Project → Settings → Domains → añadir `inventa.ai` y `www.inventa.ai`
(HTTPS automático vía Let's Encrypt; `www` redirige a apex por defecto).

| Host | Tipo | Valor | TTL |
|---|---|---|---|
| `@` | A | `76.76.21.21` | 3600 |
| `www` | CNAME | `cname.vercel-dns.com` | 3600 |

Verificación: `nslookup inventa.ai` → `76.76.21.21`; candado HTTPS en ambas URLs;
`http://` redirige a `https://` (HSTS con preload ya configurado en `vercel.json`).

## 4. Analítica (post-deploy, 10 min)

1. **Vercel Analytics**: Project → Analytics → Enable (cero código).
2. **Speed Insights**: Project → Speed Insights → Enable (sustituye el audit Lighthouse manual en cada deploy).
3. **GA4/Search Console**: crear propiedad → pegar ID en el snippet comentado de
   `web/index.html` (`G-XXXXXXX`) → verificar en Search Console + subir `sitemap.xml`.
4. **Clarity**: añadir snippet con `CLARITY_PROJECT_ID`.

## 5. Rollback

Vercel → Deployments → deploy anterior → **Promote to Production** (< 60s).
Rollback de datos: restore PITR de Supabase/RDS (retención 30d).

## 6. Checklist de lanzamiento

- [ ] `npm run lint` + `npm test` + `npm run build` en verde (local y CI)
- [ ] Secret scan limpio · `git log --all -- .env` vacío
- [ ] Deploy de producción en Vercel con dominio + HTTPS + `www` → apex
- [ ] Headers verificados: `curl -sI https://inventa.ai | grep -i "strict\|content-security\|x-frame"`
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.json`, `/favicon.svg` responden 200
- [ ] OG/Twitter validados (validator de X / LinkedIn Post Inspector)
- [ ] Analytics + Speed Insights activos · Search Console verificada
- [ ] **URL final:** https://inventa.ai ✅ lista para tráfico real
