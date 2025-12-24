//지역 좌우로 정렬
import React, { useMemo, useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
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

  // 지역 데이터를 정렬하여 좌측/우측에 표시
  const sortedRegions = useMemo(() => {
    const regions = Object.keys(REGION_MAPPING).map(engName => {
      const regionName = REGION_MAPPING[engName];
      const norm = normalize(regionName);
      const value = normalizedDataMap[norm] ?? 0;
      return { regionName, value };
    });
    return regions.sort((a, b) => b.value - a.value);
  }, [normalizedDataMap]);

  const leftRegions = sortedRegions.slice(0, 10);
  // const rightRegions = sortedRegions.slice(9);

  return (
    <div className={`w-full ${containerHeight} relative bg-white rounded-xl shadow-md overflow-hidden flex`}>
      {/* 좌측 지역 리스트 */}
      <div className="w-48 border-r border-gray-200 p-4 overflow-y-auto">
        <h4 className="text-sm font-bold text-gray-700 mb-3">지역별 배출량</h4>
        <div className="space-y-2">
          {leftRegions.map(({ regionName, value }) => (
            <div key={regionName} className="flex justify-between items-center text-xs font-stretch-200%">
              <span className="font-bold text-gray-600">{regionName}</span>
              <span className="text-gray-800 font-semibold">{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 중앙 지도 */}
      <div className="flex-1 relative">
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
              geographies.map((geo: any) => {
                const engName = geo.properties.name;
                const regionName = REGION_MAPPING[engName] || engName;
                const norm = normalize(String(regionName));
                const value = normalizedDataMap[norm] ?? 0;

                return (
                  <Geography
                    key={geo.rsmKey}
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

      {/* 우측 지역 리스트 */}
      {/* <div className="w-48 border-l border-gray-200 p-4 overflow-y-auto">
        <h4 className="text-sm font-bold text-gray-700 mb-3 invisible">지역별 배출량</h4>
        <div className="space-y-2">
          {rightRegions.map(({ regionName, value }) => (
            <div key={regionName} className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-600">{regionName}</span>
              <span className="text-gray-800 font-semibold">{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default KoreaMapChart;
