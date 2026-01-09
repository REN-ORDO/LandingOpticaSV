
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

/**
 * Función genérica para obtener datos de Strapi
 * @param {string} endpoint - El endpoint de la API (ej: 'hero', 'servicios')
 * @returns {Promise<Object>} - Los datos formateados
 */
export async function fetchFromStrapi(endpoint) {
    const url = `${STRAPI_URL}/api/${endpoint}?populate=*`;
    console.log(`[Strapi] Fetching: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            console.error(`[Strapi] Error ${response.status}: ${response.statusText} at ${url}`);
            return null;
        }

        const json = await response.json();
        console.log(`[Strapi] Success! Data received for ${endpoint}:`, json);

        return json.data;
    } catch (error) {
        console.error(`[Strapi] Critical Error (${endpoint}):`, error);
        return null;
    }
}
