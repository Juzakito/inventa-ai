# INVENTA.AI — App móvil (Expo React Native, iOS + Android)

Enfoque: **una sola codebase** que reutiliza la API (`api/main.py`). Push para
alertas de quiebre, aprobación biométrica de OCs, dashboard resumido y Copilot por voz.

## Estructura

```
mobile/
  App.tsx            ← tabs: Hoy | Aprobar | Copilot | Más
  src/api.ts         ← cliente tipado de la API (fetch + JWT)
  src/push.ts        ← Expo Push: 'quiebre en 2.9d', 'OC lista', 'desembolso aprobado'
  eas.json           ← builds OTA iOS/Android
```

## Pantallas
1. **Hoy**: 4 KPIs + radar (crítico/exceso/oportunidad) + CTA aprobar.
2. **Aprobar**: swipe-right = aprobar OC (FaceID), swipe-left = rechazar; envía por WhatsApp.
3. **Copilot**: chat + voz; mismas respuestas justificadas del backend (`POST /copilot/chat`).
4. **Financiamiento**: ofertas ordenadas por costo total, solicitud con 1 tap.

## Ejemplo — cliente API tipado (src/api.ts)

```ts
const BASE = "https://api.inventa.ai";
export const api = {
  forecast: (sku: string, h = 30) => fetch(`${BASE}/forecast/${sku}?horizon=${h}`).then(r => r.json()),
  replenishment: () => fetch(`${BASE}/replenishment`).then(r => r.json()),
  approveOC: (id: string, jwt: string) => fetch(`${BASE}/orders/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${jwt}` } }),
  chat: (q: string, jwt: string) => fetch(`${BASE}/copilot/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ question: q }) }).then(r => r.json()),
};
```

## Notificaciones (ejemplo de reglas)
- `days_cover < lead_time` → push crítica + WhatsApp al dueño.
- OC generada > S/ 10,000 → push con aprobar/rechazar inline.
- Desembolso aprobado → push + actualización del plan de compras.
