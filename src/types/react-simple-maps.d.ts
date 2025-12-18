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
  export const Geographies: React.FC<any>;
  export const Geography: React.FC<any>;
  export const Graticule: React.FC<any>;
  export const Sphere: React.FC<any>;
  export const ZoomableGroup: React.FC<any>;
}