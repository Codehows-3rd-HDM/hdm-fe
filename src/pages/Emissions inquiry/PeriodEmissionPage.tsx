import React, { useState, useMemo } from "react";
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
  Printer,
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// --- 타입 및 Mock Data ---
const COLORS = {
  scope1: "#4a90e2", // 파랑
  scope3: "#f58220", // 주황
};

const PeriodEmissionPage: React.FC = () => {
  // 현재 날짜 기준 기본값 (1개월 전 ~ 오늘)
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  // --- Mock Data 생성 로직 ---
  const data = useMemo(() => {
    const currentScope1 = Math.floor(Math.random() * 5000) + 10000;
    const currentScope3 = Math.floor(Math.random() * 5000) + 15000;
    const currentTotal = currentScope1 + currentScope3;

    const prevScope1 = Math.floor(Math.random() * 5000) + 12000;
    const prevScope3 = Math.floor(Math.random() * 5000) + 16000;
    const prevTotal = prevScope1 + prevScope3;

    const chartData = [
      {
        name: "선택기간",
        scope1: currentScope1,
        scope3: currentScope3,
        total: currentTotal,
      },
      {
        name: "전년도 동기간",
        scope1: prevScope1,
        scope3: prevScope3,
        total: prevTotal,
      },
    ];

    const distance = Math.floor(Math.random() * 500000) + 1000000;

    return { chartData, currentTotal, prevTotal, distance };
  }, [startDate, endDate]);

  const diff = data.currentTotal - data.prevTotal;
  const percent = ((Math.abs(diff) / data.prevTotal) * 100).toFixed(1);
  const isDecreased = diff < 0;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          기간별 탄소 총 배출량 (Scope 1, Scope 3)
        </h2>
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm hover:bg-gray-50"
        >
          <Printer size={16} className="mr-2" /> Print
        </button>
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
              data={data.chartData}
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
                formatter={(val: number | undefined) => val?.toLocaleString()}
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
                {data.prevTotal.toLocaleString()}{" "}
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
                {data.currentTotal.toLocaleString()}{" "}
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
              {data.distance.toLocaleString()}{" "}
              <span className="text-lg">km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodEmissionPage;
