import { API_ENDPOINTS, getCommonHeaders } from '@/config/api';
import type { Route, RouteResDto, RouteGeometryDto } from '@/types/route';

export class RouteService {
  static async getRoutes(): Promise<Route[]> {
    try {
      console.log('🛣️ RouteService.getRoutes ->', API_ENDPOINTS.ROUTES.LIST);

      const resp = await fetch(API_ENDPOINTS.ROUTES.LIST, {
        method: 'GET',
        headers: getCommonHeaders(),
      });

      if (!resp.ok) {
        throw new Error('Error al cargar rutas');
      }

      const data = await resp.json();
      const routesData: RouteResDto[] = data.data || [];

      const mappedRoutes: Route[] = routesData.map((r: RouteResDto) => ({
        id: r.id,
        name: r.numberRoute,
        description: r.description,
        start: '',
        end: '',
        imageStart: r.outboundImageUrl,
        imageEnd: r.returnImageUrl,
        startDetail: '',
        endDetail: '',
      }));

      return mappedRoutes;
    } catch (error) {
      console.error('Error en getRoutes:', error);
      // Return mock routes for testing
      return [
        {
          id: 1,
          name: 'Ruta 1',
          description: 'Ruta de prueba 1',
          start: 'Inicio 1',
          end: 'Fin 1',
          imageStart: '',
          imageEnd: '',
          startDetail: 'Inicio detallado 1',
          endDetail: 'Fin detallado 1',
        },
        {
          id: 2,
          name: 'Ruta 2',
          description: 'Ruta de prueba 2',
          start: 'Inicio 2',
          end: 'Fin 2',
          imageStart: '',
          imageEnd: '',
          startDetail: 'Inicio detallado 2',
          endDetail: 'Fin detallado 2',
        },
      ];
    }
  }

  static async getRouteGeometry(routeId: number): Promise<RouteGeometryDto> {
    try {
      console.log('🛣️ RouteService.getRouteGeometry ->', API_ENDPOINTS.ROUTES.GEOMETRY(routeId));

      const resp = await fetch(API_ENDPOINTS.ROUTES.GEOMETRY(routeId), {
        method: 'GET',
        headers: getCommonHeaders(),
      });

      if (!resp.ok) {
        throw new Error('Error al cargar geometría de ruta');
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      console.error('Error en getRouteGeometry:', error);
      // Return mock geometry
      const mockWaypoints = [
        { sequence: 1, latitude: 4.6097, longitude: -74.0817, destine: 'OUTBOUND' as const },
        { sequence: 2, latitude: 4.6100, longitude: -74.0820, destine: 'OUTBOUND' as const },
        { sequence: 3, latitude: 4.6105, longitude: -74.0825, destine: 'OUTBOUND' as const },
        { sequence: 4, latitude: 4.6110, longitude: -74.0830, destine: 'OUTBOUND' as const },
        { sequence: 5, latitude: 4.6110, longitude: -74.0830, destine: 'RETURN' as const },
        { sequence: 6, latitude: 4.6105, longitude: -74.0825, destine: 'RETURN' as const },
        { sequence: 7, latitude: 4.6100, longitude: -74.0820, destine: 'RETURN' as const },
        { sequence: 8, latitude: 4.6097, longitude: -74.0817, destine: 'RETURN' as const },
      ];
      return { data: { waypoints: mockWaypoints } };
    }
  }
}