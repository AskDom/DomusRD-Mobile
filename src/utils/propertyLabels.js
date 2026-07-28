// Mismo mapeo que PropertiesContext.js del web — el backend guarda los
// enums en mayúsculas (APARTAMENTO, VENTA...), esto los pasa a español legible.
const TYPE_MAP = { APARTAMENTO: "Apartamento", CASA: "Casa", VILLA: "Villa" };
const STATUS_MAP = { VENTA: "Venta", RENTA: "Renta", VENDIDO: "Vendido", RENTADO: "Rentado" };

export const typeLabel = (type) => TYPE_MAP[type] || type;
export const statusLabel = (status) => STATUS_MAP[status] || status;
