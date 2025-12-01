import React, { useState, useMemo, useRef } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Search, Printer, Download, CheckSquare, Square } from 'lucide-react';
import type { AnalysisColumn, AnalysisData, ScopeType } from '../../types/analysis';
// import { useReactToPrint } from 'react-to-print'; // (선택사항) 일단 window.print() 사용

// --- 스타일 및 상수 ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const SCOPE_TABS: { id: ScopeType; label: string }[] = [
  { id: 'total', label: '총 배출량' },
  { id: 'scope1', label: 'Scope 1' },
  { id: 'scope3', label: 'Scope 3' },
  { id: 'other', label: '기타' },
];

interface CarbonAnalysisTemplateProps {
  title: string;
  hasScopeTabs?: boolean; // 1번 탭 기능 유무 (운행목적, 연료별: true / 나머지: false)
  columns: AnalysisColumn[];
  initialData: AnalysisData[]; // 초기 데이터 (Mock)
}

const CarbonAnalysisTemplate: React.FC<CarbonAnalysisTemplateProps> = ({
  title,
  hasScopeTabs = false,
  columns,
  initialData
}) => {
  // --- 상태 관리 ---
  const [selectedScope, setSelectedScope] = useState<ScopeType>('total');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // 차트 선택 상태 (체크박스)
  // 초기값: 데이터 상위 3개 선택
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const top3 = initialData.sort((a, b) => b.totalEmission - a.totalEmission).slice(0, 3).map(d => d.name);
    return new Set(top3);
  });
  const [chartSearchQuery, setChartSearchQuery] = useState(''); // 5번 영역 검색

  const componentRef = useRef<HTMLDivElement>(null); // 프린트 영역 참조

  // --- 데이터 필터링 로직 (Mock) ---
  // 실제로는 API 호출 시 scope, year, month를 파라미터로 넘겨야 함
  // 여기서는 UI 동작 확인을 위해 데이터를 그대로 쓰거나 약간 변형하는 흉내만 냄
  
  const processedData = useMemo(() => {
    let data = [...initialData];

    // 1. 탭 필터 (Mock: 탭에 따라 데이터 수치를 임의로 조정하여 변화를 줌)
    if (hasScopeTabs && selectedScope !== 'total') {
        data = data.map(item => ({
            ...item,
            totalEmission: Math.floor(item.totalEmission * (selectedScope === 'scope1' ? 0.4 : 0.6)),
            monthlyTrend: item.monthlyTrend?.map(v => Math.floor(v * (selectedScope === 'scope1' ? 0.4 : 0.6)))
        }));
    }

    // 6. 메인 검색 필터
    if (searchQuery) {
        data = data.filter(item => {
            if (searchColumn === 'all') {
                // 숫자 제외하고 검색 (name, address 등 문자열 필드만)
                return Object.entries(item).some(([key, val]) => {
                    if (typeof val === 'string') return val.toLowerCase().includes(searchQuery.toLowerCase());
                    return false;
                });
            } else {
                return String((item as any)[searchColumn]).toLowerCase().includes(searchQuery.toLowerCase());
            }
        });
    }

    // 7. 정렬
    if (sortConfig) {
        data.sort((a, b) => {
            const aVal = (a as any)[sortConfig.key];
            const bVal = (b as any)[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return data;
  }, [initialData, selectedScope, searchQuery, searchColumn, sortConfig, hasScopeTabs]);


  // --- 차트 데이터 준비 ---
  // 파이 차트용 (비율 높은 순 정렬)
  const pieChartData = useMemo(() => {
    return [...processedData].sort((a, b) => b.totalEmission - a.totalEmission);
  }, [processedData]);

  // 라인 차트용 (월별 데이터 변환)
  // Recharts LineChart는 [{ name: '1월', '출퇴근': 100, '납품': 200 }, ...] 형태가 필요
  const lineChartData = useMemo(() => {
    if (selectedMonth !== 'all') return []; // 월별 선택 시 라인 차트 숨김

    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    return months.map((month, idx) => {
        const row: any = { name: month };
        // 체크된 아이템들의 해당 월 데이터 매핑
        processedData.forEach(item => {
            if (checkedItems.has(item.name)) {
                row[item.name] = item.monthlyTrend ? item.monthlyTrend[idx] : 0;
            }
        });
        return row;
    });
  }, [processedData, selectedMonth, checkedItems]);

  // --- 이벤트 핸들러 ---
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
        key,
        direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePrint = () => {
    window.print(); // 간단한 브라우저 프린트 사용 (CSS @media print로 제어)
  };

  const handleDownloadExcel = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = processedData.map(d => columns.map(c => (d as any)[c.id]).join(',')).join('\n');
    const csvContent = `\ufeff${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_${selectedYear}.csv`;
    link.click();
  };

  const toggleChartItem = (name: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setCheckedItems(newSet);
  };
  
  const toggleAllChartItems = (check: boolean) => {
      if (check) setCheckedItems(new Set(processedData.map(d => d.name)));
      else setCheckedItems(new Set());
  };

  //Recharts v2 이상에서는 <Legend payload>가 타입에서 막혀 있어서 바로 못 씀. 커스템 Legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    // payload: [{ value: name, color, payload: { name, totalEmission, ratio, ... } }]
    const sorted = [...payload]
        .sort((a, b) => b.payload.totalEmission - a.payload.totalEmission) // 정렬
        .slice(0, 5); // 상위 4개

    return (
        <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            width: '100%', 
            fontSize: '15px' 
        }}>
            {sorted.map((entry: any, index: number) => (
                <li 
                    key={`legend-item-${index}`} 
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px'
                    }}
                >
                    {/* square icon */}
                    <span 
                        style={{
                            width: 12,
                            height: 12,
                            backgroundColor: entry.color,
                            borderRadius: '3px' // square
                        }}
                    />

                    {/* label formatting */}
                    <span style={{ color: '#333' }}>
                        {entry.value} : <b>{entry.payload.ratio}%</b>
                    </span>
                </li>
            ))}
        </ul>
    );
};




  // --- 렌더링 ---
  return (
    <div ref={componentRef} style={{ padding: '30px', minHeight: '100%', fontFamily: 'Malgun Gothic, sans-serif' }}>
      
      {/* 헤더 (타이틀 & 버튼) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{title}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={btnStyle('white', '#333', true)}>
            <Printer size={16} style={{ marginRight: '5px' }} /> Print
          </button>
          <button onClick={handleDownloadExcel} style={btnStyle('white', '#28a745', true)}>
            <Download size={16} style={{ marginRight: '5px' }} /> Excel
          </button>
        </div>
      </div>

      {/* Scope 탭 (조건부 렌더링) */}
      {hasScopeTabs && (
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          {SCOPE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedScope(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: selectedScope === tab.id ? '3px solid #007bff' : '3px solid transparent',
                fontWeight: selectedScope === tab.id ? 'bold' : 'normal',
                color: selectedScope === tab.id ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 연도/월 선택 필터 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>▼ 연도 선택</label>
            <select 
                value={selectedYear} 
                onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if(e.target.value === 'all') setSelectedMonth('all'); // 연도 전체면 월도 전체로 강제
                }}
                style={selectStyle}
            >
                <option value="all">전체</option>
                {Array.from({ length: 2025 - 1979 + 1 }, (_, i) => 2025 - i).map(y => (
                    <option key={y} value={y}>{y}년</option>
                ))}
            </select>
        </div>
        
        {/* 연도가 '전체'가 아닐 때만 월 선택 활성화 */}
        {selectedYear !== 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>▼ 월 선택</label>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={selectStyle}
                >
                    <option value="all">전체</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}월</option>
                    ))}
                </select>
            </div>
        )}
      </div>

      {/* 차트 영역 */}
      {/* 데이터가 있을 때만 표시 */}
      {processedData.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', height: '500px' }}>
            
            {/* 파이 차트 (항상 표시, 중앙 정렬) */}
            <div style={{ 
                flex: selectedMonth === 'all' ? 1 : '0 0 100%', // 월 선택 시 전체 너비 사용
                backgroundColor: '#fff', borderRadius: '8px', padding: '20px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
                <h4 style={{ position: 'absolute', top: '20px', left: '20px', margin: 0 }}>
                    {selectedYear === 'all' ? '전체' : selectedYear}년 {selectedMonth === 'all' ? '연간' : `${selectedMonth}월`} {title}
                </h4>
                {/* 파이 차트 중앙 텍스트 */}
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>100%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            dataKey="totalEmission"
                            nameKey="name"
                            cx="50%" cy="55%"
                            innerRadius={80} outerRadius={120}
                            paddingAngle={2}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            content={<CustomLegend />}
                        />

                        <RechartsTooltip formatter={(value: number) => value.toLocaleString()} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 라인 차트 (월이 '전체'일 때만 표시) */}
            {selectedMonth === 'all' && (
                <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 20px 0' }}>{selectedYear}년 월별 추이</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip formatter={(value: number) => value.toLocaleString()} />
                            <Legend />
                            {Array.from(checkedItems).map((key, idx) => (
                                <Line 
                                    key={key} type="monotone" dataKey={key} 
                                    stroke={COLORS[initialData.findIndex(d => d.name === key) % COLORS.length]} 
                                    activeDot={{ r: 8 }} strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* 차트 데이터 선택 사이드바 (월이 '전체'일 때만 표시) */}
            {selectedMonth === 'all' && (
                <div style={{ width: '250px', backgroundColor: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '10px', position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="항목 검색" 
                            value={chartSearchQuery}
                            onChange={(e) => setChartSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '8px 30px 8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} 
                        />
                        <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9' }} onClick={() => toggleAllChartItems(checkedItems.size !== processedData.length)}>
                            {checkedItems.size === processedData.length ? <CheckSquare size={16} color="#007bff" /> : <Square size={16} color="#ccc" />}
                            <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '13px' }}>전체 선택</span>
                        </div>
                        {processedData
                            .filter(d => d.name.toLowerCase().includes(chartSearchQuery.toLowerCase()))
                            .map((item) => (
                                <div 
                                    key={item.name} 
                                    onClick={() => toggleChartItem(item.name)}
                                    style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    {checkedItems.has(item.name) ? <CheckSquare size={16} color={COLORS[initialData.indexOf(item) % COLORS.length]} /> : <Square size={16} color="#ccc" />}
                                    <span style={{ marginLeft: '8px', fontSize: '13px' }}>{item.name}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
      )}

      {/* 메인 검색바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
        <span style={{ fontWeight: 'bold', color: '#007bff' }}>{title.split(' ')[0]} {title.split(' ')[1]}</span>
        <select 
            value={searchColumn} 
            onChange={(e) => setSearchColumn(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
            <option value="all">전체 검색</option>
            {columns.filter(c => c.format !== 'number' && c.format !== 'percent').map(c => (
                <option key={c.id} value={c.id}>{c.header}</option>
            ))}
        </select>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input 
                type="text" 
                placeholder="검색어 입력" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 35px 8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
            <Search size={18} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        </div>
      </div>

      {/* 7, 8. 데이터 테이블 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>No.</th>
                    {columns.map(col => (
                        <th 
                            key={col.id} 
                            onClick={() => col.sortable && handleSort(col.id)}
                            style={{ 
                                padding: '12px', 
                                textAlign: col.align || 'center', 
                                cursor: col.sortable ? 'pointer' : 'default',
                                width: col.width
                            }}
                        >
                            {col.header}
                            {col.sortable && sortConfig?.key === col.id && (
                                <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {processedData.length > 0 ? (
                    processedData.map((row, idx) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{idx + 1}</td>
                            {columns.map(col => {
                                const val = (row as any)[col.id];
                                let displayVal = val;
                                if (col.format === 'number') displayVal = val?.toLocaleString();
                                if (col.format === 'percent') displayVal = `${val}%`;
                                
                                return (
                                    <td key={col.id} style={{ padding: '12px', textAlign: col.align || 'center' }}>
                                        {displayVal}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length + 1} style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                            데이터가 없습니다.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 스타일 헬퍼 ---
const btnStyle = (bg: string, color: string, border: boolean) => ({
    padding: '8px 15px',
    backgroundColor: bg,
    color: color,
    border: border ? `1px solid ${color === '#333' ? '#ccc' : color}` : 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px'
});

const selectStyle = {
    padding: '8px',
    width: '120px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer'
};

export default CarbonAnalysisTemplate;