//지역 좌우로 정렬
import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
//import { fetchRegionalEmissionData } from "../../apis/mapApi";

// 대한민국 TopoJSON
const KOREA_TOPO_JSON =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo.json";

interface KoreaMapChartProps {
  data?: { region: string; value: number }[];
  large?: boolean; // CompanyEmissionPage passes `large` prop
  defaultFitAll?: boolean; // Show full country on load
  theme?: "dark" | "light"; // Dark theme for dashboard, light for other pages
  showNoDecimals?: boolean; // Remove decimals from value display (for dashboard)
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

const KoreaMapChart: React.FC<KoreaMapChartProps> = ({
  data: propData,
  large = false,
  defaultFitAll = false,
  theme = "light",
  showNoDecimals = false,
}) => {

  const data = useMemo(() => propData || [], [propData]);

  const maxValue = Math.max(
    ...(data.length > 0 ? data.map((d) => d.value) : [1]),
    1
  );
  const minValue = Math.min(
    ...(data.length > 0 ? data.map((d) => d.value) : [0]),
    0
  );

  // Normalize region names for more robust matching (remove suffixes, spaces)
  const normalize = (name: string) => {
    if (!name) return "";
    return name
      .replace(/\s+/g, "")
      .replace(/(특별자치도|특별자치시|광역시|특별시|도|시)$/g, "");
  };

  const normalizedDataMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[normalize(curr.region)] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  // 색상 스케일: theme에 따라 분기
  const colorScale = useMemo(() => {
    if (theme === "dark") {
      // Dark theme: use more yellow than target color (#fbbf24)
      return scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#fef3c7", "#facc15"]); // low: amber-100, high: yellow-400
    } else {
      // Light theme: original light blue->dark blue
      return scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#E0F2FE", "#1E3A8A"]);
    }
  }, [maxValue, theme]);

  const containerHeight = large ? "h-[550px]" : "h-[565px]";
  const projectionScale = defaultFitAll ? 6000 : large ? 8500 : 7000;
  const projectionCenter = defaultFitAll ? [127.5, 36.3] : [127.8, 36.4];

  // 지역 데이터를 정렬하여 좌측에 표시 (실제 데이터 값 기준 상위 10개)
  const sortedRegions = useMemo(() => {
    // 실제 데이터를 풍네임으로 표시하고 값을 기준으로 정렬
    return data
      .map((item) => ({
        regionName: item.region, // 풍네임 사용
        value: item.value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 9);
  }, [data]);

  const leftRegions = sortedRegions;
  // const rightRegions = sortedRegions.slice(9);

  return (
    <div
      className={`w-full ${containerHeight} relative rounded-xl shadow-md overflow-hidden flex ${
        theme === "dark"
          ? "bg-linear-to-br from-gray-900 to-gray-800"
          : "bg-white"
      }`}
    >
      {/* 좌측 지역 리스트 */}
      <div
        className={`w-125 p-8 overflow-y-auto ${
          theme === "dark"
            ? "border-r border-white/20 bg-white/5 text-white"
            : "border-r border-gray-200 bg-linear-to-b from-gray-50 to-white text-gray-800"
        }`}
      >
        <h4
          className={`text-3xl font-extrabold mb-5 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          협력사 지역별 배출량
        </h4>
        <div className="space-y-4">
          {leftRegions.map(({ regionName, value }) => (
            <div
              key={regionName}
              className="flex justify-between items-center gap-3"
            >
              <span
                className={`font-extrabold text-2xl ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                }`}
              >
                {regionName}
              </span>
              <span
                className={`font-extrabold text-2xl whitespace-nowrap ${
                  theme === "dark" ? "text-sky-400" : "text-gray-900"
                }`}
              >
                {showNoDecimals
                  ? Math.floor(value).toLocaleString()
                  : value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
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
            center: projectionCenter as [number, number],
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
                        fill:
                          value > 0
                            ? colorScale(value)
                            : theme === "dark"
                            ? "#0f172a"
                            : "#F3F4F6",
                        stroke: theme === "dark" ? "#ffffff" : "#fff",
                        strokeWidth: 0.7,
                        outline: "none",
                      },
                      hover: {
                        fill: theme === "dark" ? "#f59e0b" : "#F59E0B",
                        cursor: "default",
                      },
                      pressed: {
                        fill: theme === "dark" ? "#fbbf24" : "#D97706",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* 범례 */}
        <div
          className={`absolute bottom-4 right-4 flex flex-col gap-3 p-4 rounded-md shadow-lg text-base ${
            theme === "dark"
              ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
              : "bg-white/95 border border-gray-200 text-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-sm"
              style={{ backgroundColor: colorScale(maxValue) }}
            ></span>
            <span className="font-extrabold">High</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-sm"
              style={{ backgroundColor: colorScale(minValue) }}
            ></span>
            <span className="font-extrabold">Low</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-sm border ${
                theme === "dark"
                  ? "bg-[#0f172a] border-white/30"
                  : "bg-[#F3F4F6] border-gray-300"
              }`}
            ></span>
            <span className="font-extrabold">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KoreaMapChart;
