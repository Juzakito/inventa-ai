# DNS — inventa.ai → Vercel

| Host | Tipo | Valor | TTL |
|---|---|---|---|
| `@` | A | `76.76.21.21` | 3600 |
| `www` | CNAME | `cname.vercel-dns.com` | 3600 |

HTTPS automático (Let's Encrypt). `www` → apex. HSTS preload activo vía `vercel.json`.
Verificación: `nslookup inventa.ai` → `76.76.21.21`.
