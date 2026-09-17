# Rollback

1. Vercel → Deployments → deploy anterior → **Promote to Production** (< 60s).
2. Si el problema es código: `git revert <sha>` + push (el CI redespliega).
3. Datos: restore PITR de Supabase/RDS (retención 30d).
4. Comunicar en el canal #incidentes con: hora, impacto, causa, fix.
