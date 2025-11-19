// Interface que define la estructura de una ruta de transporte público
export interface Route {
  id: number;
  name: string;
  description: string;
  start: string;
  end: string;
  imageStart: string;
  imageEnd: string;
  startDetail: string;
  endDetail: string;
}

export interface RouteResDto {
  id: number;
  numberRoute: string;
  description: string;
  totalDistance: number;
  waypoints: number;
  outboundImageUrl: string;
  returnImageUrl: string;
}

export interface RouteGeometryDto {
  data: {
    waypoints: Waypoint[];
  };
}

export interface Waypoint {
  sequence: number;
  destine: 'OUTBOUND' | 'RETURN';
  latitude: number;
  longitude: number;
}