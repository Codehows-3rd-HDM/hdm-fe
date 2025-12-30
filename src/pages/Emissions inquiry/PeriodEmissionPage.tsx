import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// --- 타입 및 Mock Data ---
const COLORS = {
  scope1: "#4a90e2", // 파랑
  scope3: "#f58220", // 주황
};

const PeriodEmissionPage: React.FC = () => {
  // 1. 날짜 상태 관리
  // 현재 날짜 기준 기본값 (1개월 전 ~ 오늘)
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  // 2. 차트 및 통계 데이터 상태 관리
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    currentTotal: 0,
    prevTotal: 0,
    distance: 0,
  });

  // const distance = Math.floor(Math.random() * 500000) + 1000000;

  // 3. API 호출 (useEffect)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // DTO 변수명(startDate, endDate)과 파라미터 키값을 정확히 일치시킴
        const response = await axios.get(`${BASE_URL}/view/period`, {
          params: {
            startDate: startDate,
            endDate: endDate,
          },
        });

        const { current, lastYear } = response.data;

        // ✅ 백엔드 데이터를 차트용 포맷으로 변환
        // (Recharts는 배열 형태의 데이터를 좋아함)
        const mappedChartData = [
          {
            name: "선택기간",
            scope1: current.scope1 || 0,
            scope3: current.scope3 || 0,
            total: current.totalEmission || 0,
          },
          {
            name: "전년도 동기간",
            scope1: lastYear.scope1 || 0,
            scope3: lastYear.scope3 || 0,
            total: lastYear.totalEmission || 0,
          },
        ];

        setChartData(mappedChartData);

        // 하단 카드용 요약 데이터 저장
        setSummary({
          currentTotal: current.totalEmission || 0,
          prevTotal: lastYear.totalEmission || 0,
          distance: current.totalDistance || 0,
        });
      } catch (error) {
        console.error("탄소배출량 데이터 조회 실패:", error);
        // 에러 시 0으로 초기화하거나 알림 처리
        setChartData([]);
        setSummary({ currentTotal: 0, prevTotal: 0, distance: 0 });
      }
    };

    // 날짜가 모두 있을 때만 호출
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]); // 날짜 변경 시 자동 재호출

  // 4. 증감률 계산 (summary 상태값 기준)
  const diff = summary.currentTotal - summary.prevTotal;
  // 분모가 0이면 계산 불가하므로 0 처리
  const percent =
    summary.prevTotal === 0
      ? summary.currentTotal > 0
        ? "100"
        : "0"
      : ((Math.abs(diff) / summary.prevTotal) * 100).toFixed(1);

  const isDecreased = diff < 0;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          기간별 탄소 총 배출량 (Scope 1, Scope 3)
        </h2>
      </div>

      {/* 기간 선택 */}
      <div className="p-5 mb-6 bg-white shadow-md rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
          <CalendarIcon size={18} className="mr-2" /> 기간 선택
        </h3>

        <div className="flex items-end gap-8">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 px-3 py-2 text-sm font-bold border rounded-md cursor-pointer bg-gray-50"
            />
          </div>

          <span className="pb-2 font-bold text-gray-600">to</span>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 px-3 py-2 text-sm font-bold border rounded-md cursor-pointer bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* 하단 콘텐츠 */}
      <div className="flex items-stretch gap-6">
        {/* 차트 */}
        <div className="bg-white rounded-xl shadow-md p-5 flex-1 min-h-[400px] flex flex-col">
          <h3 className="mb-6 font-semibold text-center text-gray-600">
            기간별 탄소배출량
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fontWeight: "bold" }}
              />
              <YAxis />
              <Tooltip
                formatter={(val: any) => [val?.toLocaleString(), ""]}
                cursor={{ fill: "transparent" }}
              />
              <Legend />
              <Bar
                dataKey="scope1"
                name="Scope 1"
                stackId="a"
                fill={COLORS.scope1}
              >
                <LabelList
                  dataKey="scope1"
                  position="center"
                  fill="white"
                  fontSize={12}
                  formatter={(val: any) =>
                    typeof val === "number" && val > 0
                      ? val.toLocaleString()
                      : ""
                  }
                />
              </Bar>
              <Bar
                dataKey="scope3"
                name="Scope 3"
                stackId="a"
                fill={COLORS.scope3}
              >
                <LabelList
                  dataKey="scope3"
                  position="center"
                  fill="white"
                  fontSize={12}
                  formatter={(val: any) =>
                    typeof val === "number" && val > 0
                      ? val.toLocaleString()
                      : ""
                  }
                />
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#333"
                  fontWeight="bold"
                  formatter={(val: any) =>
                    typeof val === "number" ? val.toLocaleString() : ""
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 정보 카드 */}
        <div className="w-[350px] flex flex-col gap-6">
          {/* 카드 1 */}
          <div className="flex flex-col justify-center p-5 bg-white shadow-md rounded-xl">
            <div className="mb-6">
              <div className="mb-1 text-sm text-gray-600">
                전년도 동기간 배출량
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {summary.prevTotal.toLocaleString()}{" "}
                <span className="text-lg">tCO2eq</span>
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm text-gray-600">
                선택기간 총 배출량
              </div>
              <div
                className={`text-3xl font-bold ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.currentTotal.toLocaleString()}{" "}
                <span className="text-lg text-gray-800">tCO2eq</span>
              </div>
              <div
                className={`flex items-center mt-1 font-bold text-sm ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
              >
                {isDecreased ? (
                  <TrendingDown size={18} className="mr-1" />
                ) : (
                  <TrendingUp size={18} className="mr-1" />
                )}
                {Math.abs(diff).toLocaleString()} tCO2eq ({percent}%)
              </div>
            </div>
          </div>

          {/* 카드 2 */}
          <div className="bg-white rounded-xl shadow-md p-5 h-[150px] flex flex-col justify-center">
            <div className="mb-2 text-sm text-gray-600">
              선택기간 총 운행거리
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {summary.distance.toLocaleString()}{" "}
              <span className="text-lg">km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodEmissionPage;
