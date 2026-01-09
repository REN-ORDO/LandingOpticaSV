
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

/**
 * Función genérica para obtener datos de Strapi
 * @param {string} endpoint - El endpoint de la API (ej: 'hero', 'servicios')
 * @returns {Promise<Object>} - Los datos formateados
 */
export async function fetchFromStrapi(endpoint) {
    try {
        const response = await fetch(`${STRAPI_URL}/api/${endpoint}?populate=*`);
        if (!response.ok) {
            throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
        }
        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error(`Error en Strapi API (${endpoint}):`, error);
        return null;
    }
}