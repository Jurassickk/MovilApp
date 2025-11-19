import React, { createContext, useContext, useState } from 'react';
import { RouteService } from '@/services/routeService';

interface RouteData {
  id: number;
  outboundPoints: [number, number][] | null;
  returnPoints: [number, number][] | null;
}

interface RouteContextType {
  routes: RouteData[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>;
  selectedRoutes: number[];
  setSelectedRoutes: React.Dispatch<React.SetStateAction<number[]>>;
  focusedRoute: number | null;
  setFocusedRoute: React.Dispatch<React.SetStateAction<number | null>>;
  addRoute: (routeId: number, outboundPoints: [number, number][] | null, returnPoints: [number, number][] | null) => void;
  removeRoute: (routeId: number) => void;
  loadRoute: (routeId: number) => Promise<void>;
  clearRoutes: () => void;
}

const RouteContext = createContext<RouteContextType | null>(null);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [focusedRoute, setFocusedRoute] = useState<number | null>(null);

  const addRoute = (routeId: number, outboundPoints: [number, number][] | null, returnPoints: [number, number][] | null) => {
    setRoutes(prev => {
      const existing = prev.find(r => r.id === routeId);
      if (existing) {
        return prev.map(r => r.id === routeId ? { ...r, outboundPoints, returnPoints } : r);
      }
      return [...prev, { id: routeId, outboundPoints, returnPoints }];
    });
  };

  // Carga y cachea la geometría de la ruta si no existe
  const loadRoute = async (routeId: number) => {
    const exists = routes.find(r => r.id === routeId && r.outboundPoints && r.returnPoints);
    if (exists) return;

    try {
      const data = await RouteService.getRouteGeometry(routeId);
      const waypoints = data.data?.waypoints || [];

      const outboundPoints = waypoints
        .filter((w: any) => w.destine === 'OUTBOUND')
        .sort((a: any, b: any) => a.sequence - b.sequence)
        .map((w: any) => [w.longitude, w.latitude] as [number, number]);

      const returnPoints = waypoints
        .filter((w: any) => w.destine === 'RETURN')
        .sort((a: any, b: any) => a.sequence - b.sequence)
        .map((w: any) => [w.longitude, w.latitude] as [number, number]);

      addRoute(routeId, outboundPoints, returnPoints);
    } catch (err) {
      console.error('loadRoute error:', err);
      // En caso de error añadimos la ruta sin puntos para mantener el id
      addRoute(routeId, null, null);
    }
  };

  const removeRoute = (routeId: number) => {
    console.debug('[RouteContext] removeRoute ->', routeId);
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    setSelectedRoutes(prev => prev.filter(id => id !== routeId));
  };

  const clearRoutes = () => {
    console.debug('[RouteContext] clearRoutes called');
    setRoutes([]);
    setSelectedRoutes([]);
  };

  return (
    <RouteContext.Provider value={{
      routes,
      setRoutes,
      selectedRoutes,
      setSelectedRoutes,
      focusedRoute,
      setFocusedRoute,
      addRoute,
      removeRoute,
      loadRoute,
      clearRoutes
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutePoints() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoutePoints debe usarse dentro de RouteProvider');
  return ctx;
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute debe usarse dentro de RouteProvider');
  return {
    selectedRoutes: ctx.selectedRoutes,
    setSelectedRoutes: ctx.setSelectedRoutes,
    focusedRoute: ctx.focusedRoute,
    setFocusedRoute: ctx.setFocusedRoute,
    addRoute: ctx.addRoute,
    removeRoute: ctx.removeRoute,
    clearRoutes: ctx.clearRoutes,
    routes: ctx.routes,
    loadRoute: ctx.loadRoute
  };
}