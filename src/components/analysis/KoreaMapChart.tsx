import React, { useMemo, useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { geoCentroid } from "d3-geo";
import { fetchRegionalEmissionData } from "../../apis/mapApi";

// 대한민국 TopoJSON
const KOREA_TOPO_JSON =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo.json";

interface KoreaMapChartProps {
  data?: { region: string; value: number }[];
  large?: boolean; // CompanyEmissionPage passes `large` prop
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

const KoreaMapChart: React.FC<KoreaMapChartProps> = ({ data: propData, large = false }) => {
  const [localData, setLocalData] = useState<{ region: string; value: number }[]>(propData ?? []);

  // api 전 더미데이터 반환
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (propData && propData.length > 0) {
        setLocalData(propData);
        return;
      }
      try {
        const d = await fetchRegionalEmissionData();
        if (mounted) setLocalData(d);
      } catch (e) {
        console.error('Failed to fetch regional data', e);
      } finally {
        // finished
      }
    };
    load();
    return () => { mounted = false; };
  }, [propData]);

  const data = localData;

  const maxValue = Math.max(...(data.length > 0 ? data.map((d) => d.value) : [1]), 1);
  const minValue = Math.min(...(data.length > 0 ? data.map((d) => d.value) : [0]), 0);
  
  // Normalize region names for more robust matching (remove suffixes, spaces)
  const normalize = (name: string) => {
    if (!name) return '';
    return name
      .replace(/\s+/g, '')
      .replace(/(특별자치도|특별자치시|광역시|특별시|도|시)$/g, '');
  };

  const normalizedDataMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[normalize(curr.region)] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxValue])
      .range(["#E0F2FE", "#1E3A8A"]);
  }, [maxValue]);

  const containerHeight = large ? 'h-[1100px]' : 'h-[535px]';
  const projectionScale = large ? 8500 : 7000;

  // 좌우 리스트 대신 지도에 직선(리더 라인)과 라벨로 표시

  return (
    <div className={`w-full ${containerHeight} relative bg-white rounded-xl shadow-md overflow-hidden`}>
      {/* 중앙 지도 + 리더 라인 라벨 */}
      <div className="w-full h-full relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: projectionScale,
            center: [127.8, 36.4],
          }}
          width={700}
          height={600}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={KOREA_TOPO_JSON}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {({ geographies }: { geographies: any[] }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geographies.map((geo: any, i: number) => {
                const engName = geo.properties.name;
                const regionName = REGION_MAPPING[engName] || engName;
                const norm = normalize(String(regionName));
                const value = normalizedDataMap[norm] ?? 0;
                const centroid = geoCentroid(geo as any);
                const lon = centroid[0];
                const isLeft = lon < 127.8; // 중심 경도 기준 좌/우 분기
                const dx = isLeft ? -120 : 120; // 좌우로 직선 길이
                const dy = ((i % 5) - 2) * 8; // 경미한 수직 오프셋으로 겹침 완화

                return (
                  <React.Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      style={{
                        default: {
                          fill: value > 0 ? colorScale(value) : "#F3F4F6",
                          stroke: "#fff",
                          strokeWidth: 0.7,
                          outline: "none",
                        },
                        hover: {
                          fill: "#F59E0B", // hover color (orange)
                          cursor: "default",
                        },
                        pressed: {
                          fill: "#D97706",
                        },
                      }}
                    />
                    <Annotation
                      subject={centroid as [number, number]}
                      dx={dx}
                      dy={dy}
                      connectorProps={{ stroke: "#9CA3AF", strokeWidth: 1 }}
                    >
                      <text
                        x={isLeft ? -8 : 8}
                        y={0}
                        textAnchor={isLeft ? "end" : "start"}
                        alignmentBaseline="middle"
                        fill="#1F2937"
                        fontSize={11}
                        fontWeight={600}
                      >
                        {`${regionName}: ${value.toLocaleString()}`}
                      </text>
                    </Annotation>
                  </React.Fragment>
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* 범례 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-white/90 p-2 rounded-md shadow-sm text-xs border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorScale(maxValue) }}></span> High
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorScale(minValue) }}></span> Low
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#F3F4F6] rounded-sm border border-gray-200"></span>No Data
          </div>
        </div>
      </div>

      {/* 좌우 리스트 제거, 지도만 표시 */}
    </div>
  );
};

export default KoreaMapChart;
