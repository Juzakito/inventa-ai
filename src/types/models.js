/**
 * INVENTA.AI — Modelos de dominio (src/types/models.js)
 * Contratos JSDoc del frontend. La validación runtime vive en el motor;
 * la validación de tipos estricta (tsc) entra en v2.0 (ver docs/AUDIT.md).
 *
 * @typedef {Object} SKU
 * @property {string} id - "SKU-001"
 * @property {string} name
 * @property {string} cat - categoría
 * @property {string} supplier - clave de SUPPLIERS
 * @property {number} price - precio venta PEN
 * @property {number} cost - costo PEN
 * @property {number} stock - unidades actuales
 * @property {number} min - stock mínimo maestro
 * @property {number} max - stock máximo maestro
 * @property {number} lead - lead time en días
 * @property {number} daily - venta diaria promedio
 * @property {number} cv - coeficiente de variación (0-1)
 * @property {number} margin - margen %
 * @property {"A"|"B"|"C"} abc
 * @property {"X"|"Y"|"Z"} xyz
 *
 * @typedef {Object} Replenishment
 * @property {number} demandH - demanda del horizonte
 * @property {number} avgDaily
 * @property {number} safety - safety stock (95%)
 * @property {number} rop - punto de reorden
 * @property {number} daysCover - cobertura en días
 * @property {number} suggested - cantidad sugerida
 * @property {"critical"|"risk"|"excess"|"ok"} status
 * @property {number} lossRisk - margen en riesgo PEN
 * @property {number} investment - inversión requerida PEN
 *
 * @typedef {Object} PurchaseOrder
 * @property {string} id - "OC-2026-184"
 * @property {string} supKey
 * @property {string} supplier
 * @property {string} items
 * @property {number} total
 * @property {"pending"|"approved"|"rejected"|"received"} status
 *
 * @typedef {"owner"|"buyer"|"viewer"} Role
 */
export {};
