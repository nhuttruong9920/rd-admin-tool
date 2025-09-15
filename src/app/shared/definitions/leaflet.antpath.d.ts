import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Polyline {
    class AntPath extends Polyline {
      constructor(
        routes: Routes | L.LatLng[] | L.LatLngTuple[],
        options: Options
      );
      pause(): void;
      resume(): void;
      reverse(): void;
      map(callback: (...args: unknown[]) => void): void;
    }

    type Routes = Coordinate[];
    type Coordinate = [number, number];

    interface Options {
      id?: string;
      paused?: boolean;
      reverse?: boolean;
      hardwareAccelerated?: boolean;
      pulseColor?: string;
      dashArray?: [number, number] | string;
      color?: string;
      weight?: number;
      use?: L.circle | L.curve | L.polygon | L.rectangle;
      fillColor?: string;
      fillOpacity?: number;
      radius?: number;
      opacity?: number;
      delay?: number;
    }
  }
}
