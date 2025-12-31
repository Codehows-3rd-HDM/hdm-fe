declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps {
  projection?: 
    | "geoMercator"
    | "geoEqualEarth"
    | "geoAzimuthalEqualArea"
    | "geoAzimuthalEquidistant"
    | "geoConicConformal"
    | "geoConicEqualArea"
    | "geoConicEquidistant"
    | "geoEquirectangular"
    | "geoOrthographic"
    | "geoStereographic"
    | "geoTransverseMercator";

  projectionConfig?: {
    scale?: number;              // 지도 확대 배율
    center?: [number, number];   // 중심 좌표 [경도, 위도]
    rotate?: [number, number, number]; // 선택적 회전 값
  };

  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;

  /** React children (예: <Geographies>, <Geography> 등) */
  children?: React.ReactNode;
}
  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<{
    geography: string | object;
    children: (args: { geographies: unknown[] }) => React.ReactNode;
  }>;
  export const Geography: React.FC<{
    geography: unknown;
    style?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  export const Graticule: React.FC<Record<string, unknown>>;
  export const Sphere: React.FC<Record<string, unknown>>;
  export const ZoomableGroup: React.FC<Record<string, unknown>>;
}