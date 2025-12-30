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
}) => {
  //const [localData, setLocalData] = useState<{ region: string; value: number }[]>(propData ?? []);

  // api 전 더미데이터 반환
  // useEffect(() => {
  //   let mounted = true;
  //   const load = async () => {
  //     if (propData && propData.length > 0) {
  //       setLocalData(propData);
  //       return;
  //     }
  //     try {
  //       const d = await fetchRegionalEmissionData();
  //       if (mounted) setLocalData(d);
  //     } catch (e) {
  //       console.error('Failed to fetch regional data', e);
  //     } finally {
  //       // finished
  //     }
  //   };
  //   load();
  //   return () => { mounted = false; };
  // }, [propData]);

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
      // Dark theme: low=청록색, high=파란색 (차분한 그라데이션)
      return scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#475569", "#60a5fa"]);
    } else {
      // Light theme: original light blue->dark blue
      return scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#E0F2FE", "#1E3A8A"]);
    }
  }, [maxValue, theme]);

  const containerHeight = large ? "h-[550px]" : "h-[535px]";
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
        className={`w-[500px] p-8 overflow-y-auto ${
          theme === "dark"
            ? "border-r border-white/20 bg-white/5 text-white"
            : "border-r border-gray-200 bg-linear-to-b from-gray-50 to-white text-gray-800"
        }`}
      >
        <h4
          className={`text-4xl font-extrabold mb-5 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          지역별 배출량
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
                {value.toLocaleString(undefined, {
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
                        fill: theme === "dark" ? "#3b82f6" : "#F59E0B",
                        cursor: "default",
                      },
                      pressed: {
                        fill: theme === "dark" ? "#2563eb" : "#D97706",
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
