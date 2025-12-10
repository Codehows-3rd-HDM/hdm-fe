import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Printer, Download, ChevronDown } from 'lucide-react';
import KoreaMapChart from '../../components/analysis/KoreaMapChart'; 

// --- Mock Data ---
// 1. 지도 데이터 (지역별 합계)
const MOCK_MAP_DATA = [
  { region: '경기', value: 25400 },
  { region: '울산', value: 18000 },
  { region: '경남', value: 15000 },
  { region: '충남', value: 9200 },
  { region: '부산', value: 8100 },
  { region: '서울', value: 5000 },
  { region: '인천', value: 6500 },
  { region: '대구', value: 4200 },
  { region: '경북', value: 7800 },
];

// 2. 협력사 데이터 (수십 개 시뮬레이션)
const MOCK_COMPANY_DATA = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `협력사 ${String.fromCharCode(65 + (i % 26))}${i}`, // A0, B1...
  value: Math.floor(Math.random() * 5000) + 500, // 배출량
  address: i % 2 === 0 ? '경기도 성남시' : '울산광역시 북구',
  ratio: 0 // 나중에 계산
})).sort((a, b) => b.value - a.value); // 배출량 순 정렬

// 비율 계산
const totalEmission = MOCK_COMPANY_DATA.reduce((acc, curr) => acc + curr.value, 0);
MOCK_COMPANY_DATA.forEach(d => d.ratio = parseFloat(((d.value / totalEmission) * 100).toFixed(1)));


const CompanyEmissionPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery] = useState('');

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const DB_START_YEAR = 2018

    // --- 연도 옵션 생성 (DB 시작년도 ~ 현재년도) ---
    const yearOptions = useMemo(() => {
        const options = [];
        for (let y = currentYear; y >= DB_START_YEAR; y--) {
            options.push(y.toString());
        }
        return options;
    }, [currentYear]);

  // 필터링
  const filteredData = useMemo(() => {
    return MOCK_COMPANY_DATA.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // 차트 너비 동적 계산 (데이터 개수 * 60px)
  // 데이터가 많으면 차트가 옆으로 길어지고, 부모 div에서 스크롤 발생
  const chartWidth = Math.max(filteredData.length * 60, 800); 

  return (
    <div className="p-8 min-h-screen bg-f4f7f9 font-sans">
      
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">협력사별 탄소 배출량</h2>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-bold text-gray-700 shadow-sm hover:bg-gray-50">
            <Printer size={16} className="mr-2" /> Print
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-bold shadow-sm hover:bg-green-700">
            <Download size={16} className="mr-2" /> Excel
          </button>
        </div>
      </div>

  {/* 필터 영역 */}
      <div className="flex gap-6 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 print:hidden">
        {/* 연도 선택 */}
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">▼ 연도 선택</label>
            <div className="relative">
                <select 
                    value={selectedYear} 
                    onChange={(e) => {
                        setSelectedYear(e.target.value);
                        if(e.target.value === 'all') setSelectedMonth('all');
                    }}
                    className="w-32 p-2 pr-8 border border-gray-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                    <option value="all">전체</option>
                    {yearOptions.map(y => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
        </div>
        
        {/* 월 선택 */}
        {selectedYear !== 'all' && (
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">▼ 월 선택</label>
                <div className="relative">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-32 p-2 pr-8 border border-gray-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="all">전체</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}월</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
        )}
      </div>

      {/* 상단 차트 영역 */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 h-[500px]">
        
        {/* 1. 지도 차트 (좌측 40%) */}
        <div className="lg:w-5/12 rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
            <KoreaMapChart data={MOCK_MAP_DATA} />
        </div>

        {/* 2. 협력사별 가로 스크롤 막대 차트 (우측 60%) */}
        <div className="lg:w-7/12 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4">협력사별 탄소 배출량 순위</h3>
            
            {/* 스크롤 컨테이너 */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                <div style={{ width: `${chartWidth}px`, height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip formatter={(val: number) => val.toLocaleString()} />
                            
                            <Bar dataKey="value" name="배출량" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {/* 상위 5개만 강조색 */}
                                {filteredData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index < 5 ? '#2563eb' : '#93c5fd'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* 하단 데이터 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">상세 데이터 목록 ({filteredData.length}건)</h3>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-center w-16">No.</th>
                        <th className="px-6 py-3">협력사명</th>
                        <th className="px-6 py-3 text-right">탄소 배출량 (tCO2eq)</th>
                        <th className="px-6 py-3 text-right">비율 (%)</th>
                        <th className="px-6 py-3">주소</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.map((row, index) => (
                        <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 text-center font-medium">{index + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                            <td className="px-6 py-4 text-right">{row.value.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">{row.ratio}%</td>
                            <td className="px-6 py-4 text-gray-500">{row.address}</td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">검색 결과가 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default CompanyEmissionPage;