import React, { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";

// 대한민국 TopoJSON
const KOREA_TOPO_JSON =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo.json";

interface MapData {
  region: string;
  value: number;
}

interface KoreaMapChartProps {
  data: MapData[];
}

// TopoJSON 영문명 → 실제 지역 한글명 매핑
const REGION_MAPPING: Record<string, string> = {
  Seoul: "서울",
  Busan: "부산",
  Daegu: "대구",
  Incheon: "인천",
  Gwangju: "광주",
  Daejeon: "대전",
  Ulsan: "울산",
  "Sejong-si": "세종",
  "Gyeonggi-do": "경기",
  "Gangwon-do": "강원",
  "Chungcheongbuk-do": "충북",
  "Chungcheongnam-do": "충남",
  "Jeollabuk-do": "전북",
  "Jeollanam-do": "전남",
  "Gyeongsangbuk-do": "경북",
  "Gyeongsangnam-do": "경남",
  "Jeju-do": "제주",
};

const KoreaMapChart: React.FC<KoreaMapChartProps> = ({ data }) => {
  const dataMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[curr.region] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const colorScale = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    return scaleLinear<string>()
      .domain([0, maxValue])
      .range(["#E0F2FE", "#1E3A8A"]);
  }, [data]);

  return (
    <div className="w-full h-[550px] relative bg-white rounded-xl shadow-md overflow-hidden">
      <h3 className="absolute top-4 left-1/2 -translate-x-1/2 text-lg font-bold z-10 text-gray-700">
        지역별 배출량 분포
      </h3>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 5200,         // 대한민국에 최적화된 배율
          center: [127.8, 36], // 한반도 중심
        }}
        width={800}
        height={600}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={KOREA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const engName = geo.properties.name;
                const regionName = REGION_MAPPING[engName] || engName;
                const value = dataMap[regionName] ?? 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={`${regionName}: ${value.toLocaleString()} tCO₂eq`}
                    style={{
                      default: {
                        fill: value > 0 ? colorScale(value) : "#F3F4F6",
                        stroke: "#fff",
                        strokeWidth: 0.7,
                        outline: "none",
                      },
                      hover: {
                        fill: "#F59E0B",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#D97706",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <Tooltip
        id="map-tooltip"
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "12px",
          zIndex: 50,
        }}
      />

      <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-white/90 p-2 rounded-md shadow-sm text-xs border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#1E3A8A] rounded-sm"></span> High
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#E0F2FE] rounded-sm"></span> Low
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F3F4F6] rounded-sm border border-gray-200"></span>No Data
        </div>
      </div>
    </div>
  );
};

export default KoreaMapChart;
