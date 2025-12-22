import { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, Save, Edit3, ArrowLeft, CheckCircle, 
  AlertCircle, BarChart3,
  Database, Target
} from 'lucide-react';

// =============================================================================
// [2] API Layer with Mock Data
// =============================================================================

const carbonApi = {
  // 목표 데이터 조회
  fetchTargets: async (_year: number): Promise<FullTargetState> => {
    // 실제: await axiosInstance.get(`/targets/${year}`)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          Total: { total: 12000, monthly: generateDummyMonthly(12000) },
          Scope1: { total: 5000, monthly: generateDummyMonthly(5000) },
          Scope3: { total: 7000, monthly: generateDummyMonthly(7000) }
        });
      }, 300);
    });
  },
  // 기준실적이 있는 연도 목록 조회
  fetchAvailableBaseYears: async (): Promise<number[]> => {
    // 실제: await axiosInstance.get('/base-years')
    return [2020, 2021, 2022, 2023, 2024];
  },
  // 특정 연도의 실제 배출량 실적 조회
  fetchActualsByYear: async (_year: number): Promise<MonthlyData[]> => {
    // 실제: await axiosInstance.get(`/actuals/${year}`)
    return generateDummyMonthly(14000 + (Math.random() * 2000), 0.15);
  },
  // 신규 목표 저장
  saveTargets: async (_year: number, _data: FullTargetState) => {
    // 실제: await axiosInstance.post(`/targets/${year}`, data)
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
};

const generateDummyMonthly = (total: number, variance = 0.1): MonthlyData[] => {
  const base = total / 12;
  let currentSum = 0;
  const data = Array.from({ length: 11 }, (_, i) => {
    const val = Math.round(base + (Math.random() - 0.5) * (base * variance));
    currentSum += val;
    return { month: i + 1, value: val };
  });
  data.push({ month: 12, value: Math.max(0, Math.round(total - currentSum)) });
  return data;
};

// =============================================================================
// [3] Type Definitions
// =============================================================================

type EmissionCategory = 'Total' | 'Scope1' | 'Scope3';
type RegistrationType = 'ratio' | 'manual';
type DistributionType = 'actual' | 'equal';

interface MonthlyData { month: number; value: number; }
interface TargetData { total: number; monthly: MonthlyData[]; }
interface FullTargetState { Total: TargetData; Scope1: TargetData; Scope3: TargetData; }

// =============================================================================
// [4] Main App Component
// =============================================================================

export default function App() {
  const [view, setView] = useState<'list' | 'register'>('list');
  const [activeTab, setActiveTab] = useState<EmissionCategory>('Total');
  const [isLoading, setIsLoading] = useState(false);
  
  // -- 조회 페이지 상태 --
  const [listYear, setListYear] = useState<number>(new Date().getFullYear());
  const [targetState, setTargetState] = useState<FullTargetState | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // -- 신규 등록 페이지 상태 --
  const [regYear, setRegYear] = useState<number>(new Date().getFullYear() + 1);
  const [baseYear, setBaseYear] = useState<number>(new Date().getFullYear() - 1);
  const [availableBaseYears, setAvailableBaseYears] = useState<number[]>([]);
  const [baseActuals, setBaseActuals] = useState<MonthlyData[]>([]);
  const [regType, setRegType] = useState<RegistrationType>('ratio');
  const [reductionRatio, setReductionRatio] = useState<number>(95);
  const [distType, setDistType] = useState<DistributionType>('actual');

  // =============================================================================
  // [5] Effects
  // =============================================================================

  // 조회 페이지 데이터 로드
  useEffect(() => {
    if (view === 'list') {
      const load = async () => {
        setIsLoading(true);
        const data = await carbonApi.fetchTargets(listYear);
        setTargetState(data);
        setIsLoading(false);
      };
      load();
    }
  }, [listYear, view]);

  // 등록 페이지 초기화 및 기준연도 조회
  useEffect(() => {
    if (view === 'register') {
      const loadRegInfo = async () => {
        const years = await carbonApi.fetchAvailableBaseYears();
        setAvailableBaseYears(years);
        if (years.length > 0 && !years.includes(baseYear)) setBaseYear(years[years.length-1]);
        
        // 초기 목표 데이터 셋업 (비어있는 상태)
        setTargetState({
          Total: { total: 0, monthly: Array.from({length:12}, (_,i)=>({month:i+1, value:0})) },
          Scope1: { total: 0, monthly: Array.from({length:12}, (_,i)=>({month:i+1, value:0})) },
          Scope3: { total: 0, monthly: Array.from({length:12}, (_,i)=>({month:i+1, value:0})) },
        });
      };
      loadRegInfo();
    }
  }, [view]);

  // 등록 페이지에서 기준연도 변경 시 실적 로드
  useEffect(() => {
    if (view === 'register' && baseYear) {
      carbonApi.fetchActualsByYear(baseYear).then(setBaseActuals);
    }
  }, [baseYear, view]);

  // 등록 페이지에서 등록연도 변경 시 기존 데이터 체크
  useEffect(() => {
    if (view === 'register' && regYear) {
       // 실제로는 서버에 해당 연도 데이터가 있는지 체크하고 불러올 수 있음
       carbonApi.fetchTargets(regYear).then(setTargetState);
    }
  }, [regYear, view]);

  // =============================================================================
  // [6] Computations
  // =============================================================================

  const currentData = targetState ? targetState[activeTab] : null;

  const monthlySum = useMemo(() => {
    if (!currentData) return 0;
    return currentData.monthly.reduce((acc, cur) => acc + Number(cur.value || 0), 0);
  }, [currentData]);

  const diffAmount = useMemo(() => {
    if (!currentData) return 0;
    return currentData.total - monthlySum;
  }, [currentData, monthlySum]);

  const baseActualTotal = useMemo(() => {
    return baseActuals.reduce((acc, cur) => acc + cur.value, 0);
  }, [baseActuals]);

  // Y축 가이드라인 수치 계산
  const yAxisMarkers = useMemo(() => {
    if (!currentData) return [];
    const maxVal = Math.max(
      ...currentData.monthly.map(m => m.value), 
      ...baseActuals.map(a => a.value),
      1000
    );
    const step = Math.ceil(maxVal / 5 / 100) * 100;
    return Array.from({length: 6}, (_, i) => i * step).reverse();
  }, [currentData, baseActuals]);

  const getBarHeight = (val: number) => {
    if (yAxisMarkers.length === 0) return '0%';
    const max = yAxisMarkers[0];
    return `${(val / max) * 100}%`;
  };

  // =============================================================================
  // [7] Handlers
  // =============================================================================

  const handleValueChange = (index: number, val: string) => {
    if (!targetState) return;
    const nVal = val === '' ? 0 : parseInt(val);
    const next = { ...targetState };
    next[activeTab].monthly[index].value = nVal;
    setTargetState(next);
  };

  const handleTotalChange = (val: string) => {
    if (!targetState) return;
    const nVal = val === '' ? 0 : parseInt(val);
    const next = { ...targetState };
    next[activeTab].total = nVal;
    setTargetState(next);
  };

  const applyRatioDistribution = () => {
    if (!targetState || baseActuals.length === 0) return;
    const factor = reductionRatio / 100;
    const newTotal = Math.round(baseActualTotal * factor);
    let tempSum = 0;
    const newMonthly = baseActuals.map((m, i) => {
      if (i === 11) return { month: 12, value: 0 };
      const val = Math.round(m.value * factor);
      tempSum += val;
      return { month: m.month, value: val };
    });
    newMonthly[11].value = newTotal - tempSum;
    
    const next = { ...targetState };
    next[activeTab] = { total: newTotal, monthly: newMonthly };
    setTargetState(next);
  };

  const handleFinalSubmit = async () => {
    if (!targetState) return;
    setIsLoading(true);
    await carbonApi.saveTargets(regYear, targetState);
    setIsLoading(false);
    setListYear(regYear); // 등록한 연도로 세팅
    setView('list');      // 목록으로 전환
  };

  if (!targetState || !currentData) return <div className="p-20 text-center font-bold text-slate-400">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <div className="w-full max-w-[1700px] mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sky-600 mb-2">
              <div className="p-2 bg-sky-100 rounded-lg"><BarChart3 size={24} /></div>
              <span className="font-black tracking-widest text-sm uppercase opacity-70">Carbon Management System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {view === 'list' ? '목표 조회 및 수정' : '신규 배출 목표 등록'}
            </h1>
          </div>
          
          <button 
            onClick={() => { setView(view === 'list' ? 'register' : 'list'); setIsEditMode(false); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 ${
              view === 'list' 
              ? 'bg-slate-900 text-white shadow-slate-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {view === 'list' ? <><PlusCircle size={20} /> 목표 신규 등록</> : <><ArrowLeft size={20} /> 목록으로 돌아가기</>}
          </button>
        </header>

        {/* Main Card */}
        <main className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          
          {/* Tabs */}
          <nav className="flex bg-slate-50/50 border-b border-slate-100 p-2">
            {(['Total', 'Scope1', 'Scope3'] as EmissionCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsEditMode(false); }}
                className={`px-12 py-5 font-black text-sm rounded-2xl transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'Total' ? '전체 배출량' : tab}
              </button>
            ))}
          </nav>

          <div className="p-8 md:p-14">
            {view === 'list' ? (
              /* ================================================================= LIST VIEW */
              <div className="space-y-12">
                <section className="flex flex-col lg:flex-row gap-8">
                  {/* Summary Card */}
                  <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 w-full md:w-auto text-center md:text-left">
                      <div className="space-y-1">
                        <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Target Year Selection</p>
                        <select 
                          value={listYear}
                          onChange={(e) => setListYear(Number(e.target.value))}
                          className="bg-transparent border-none text-3xl font-black text-sky-400 outline-none cursor-pointer hover:text-sky-300 transition-colors scrollbar-hide"
                        >
                          {Array.from({length: 21}, (_, i) => 2015 + i).map(y => (
                            <option key={y} value={y} className="text-slate-900">{y}년도 목표</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Total Annual Target</p>
                        {isEditMode ? (
                          <div className="flex items-center gap-2 border-b-2 border-sky-500 pb-1 max-w-[300px] mx-auto md:mx-0">
                            <input 
                              type="number"
                              value={currentData.total}
                              onChange={(e) => handleTotalChange(e.target.value)}
                              className="bg-transparent text-5xl font-black text-white outline-none w-full"
                            />
                            <span className="text-xl font-bold text-slate-500">t</span>
                          </div>
                        ) : (
                          <div className="text-5xl font-black tracking-tighter">
                            {currentData.total.toLocaleString()} <span className="text-xl text-slate-500 font-bold">tCO₂eq</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-64">
                      {isEditMode ? (
                        <>
                          <button onClick={() => setIsEditMode(false)} className="w-full py-4 rounded-2xl font-black bg-slate-800 hover:bg-slate-700 transition-all">수정 취소</button>
                          <button 
                            onClick={() => setIsEditMode(false)}
                            disabled={diffAmount !== 0}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 disabled:opacity-30 transition-all"
                          >
                            <Save size={20} /> 저장하기
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setIsEditMode(true)} className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-5 rounded-2xl font-black hover:bg-sky-400 transition-all shadow-xl shadow-sky-900/20">
                          <Edit3 size={20} /> 데이터 수정 모드
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Diff Status */}
                  <div className={`lg:w-80 rounded-[2.5rem] p-10 border-2 flex flex-col justify-center items-center text-center transition-all ${diffAmount === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className={`p-4 rounded-full mb-4 ${diffAmount === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {diffAmount === 0 ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${diffAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>목표 합계 오차</p>
                    <div className={`text-4xl font-black ${diffAmount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {diffAmount > 0 ? `+${diffAmount.toLocaleString()}` : diffAmount.toLocaleString()}
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                  {/* Chart with Y-Axis */}
                  <div className="xl:col-span-8 space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2 text-slate-400">
                      <div className="w-1.5 h-6 bg-sky-500 rounded-full" /> 월별 분포 그래프
                    </h3>
                    <div className="h-[450px] flex gap-4 bg-slate-50/50 rounded-[2.5rem] p-10 relative border border-slate-100">
                      {/* Y-Axis Markers */}
                      <div className="flex flex-col justify-between h-[calc(100%-40px)] text-[10px] font-black text-slate-400 w-12 pt-1 pb-1">
                        {yAxisMarkers.map(m => <div key={m}>{m >= 1000 ? (m/1000).toFixed(1)+'k' : m}</div>)}
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between gap-3 relative border-l border-b border-slate-200">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {yAxisMarkers.map(m => <div key={m} className="w-full border-t border-slate-200/50 h-0" />)}
                        </div>

                        {currentData.monthly.map((m, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                            <div 
                              className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative ${isEditMode ? 'bg-sky-400' : 'bg-slate-300 group-hover:bg-sky-500'}`}
                              style={{ height: getBarHeight(m.value) }}
                            >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-30">
                                {m.value.toLocaleString()} t
                              </div>
                            </div>
                            <span className="absolute -bottom-8 text-[11px] font-black text-slate-400">{m.month}월</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grid Table */}
                  <div className="xl:col-span-4 space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <h3 className="text-xl font-black">데이터 입력</h3>
                      <span className="text-xs font-bold text-slate-400">Unit: tCO₂eq</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentData.monthly.map((m, i) => (
                        <div key={i} className={`p-4 rounded-[1.5rem] border-2 transition-all ${isEditMode ? 'bg-white border-sky-400 shadow-lg shadow-sky-50 ring-4 ring-sky-50' : 'bg-slate-50 border-transparent'}`}>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">{m.month}월</label>
                          <input
                            type="number"
                            value={m.value}
                            readOnly={!isEditMode}
                            onChange={(e) => handleValueChange(i, e.target.value)}
                            className="w-full bg-transparent text-xl font-black outline-none text-slate-700"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-8 bg-slate-900 rounded-[2rem] flex justify-between items-center text-white shadow-xl shadow-slate-200">
                      <span className="font-bold text-slate-500 uppercase tracking-tighter text-sm">Monthly Sum</span>
                      <span className="text-3xl font-black">{monthlySum.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================================================================= REGISTER VIEW */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                
                {/* Registration Controls */}
                <aside className="xl:col-span-4 space-y-8">
                  <div className="bg-slate-50/80 rounded-[3rem] p-10 border border-slate-200 space-y-10 sticky top-10">
                    <div className="space-y-6">
                      <h4 className="text-lg font-black flex items-center gap-2 text-slate-700">
                        <Target size={22} className="text-sky-600" /> 신규 목표 설정
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">등록 대상 연도</label>
                          <select 
                            value={regYear}
                            onChange={(e) => setRegYear(Number(e.target.value))}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-black text-xl outline-none focus:border-sky-500 transition-all"
                          >
                            {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(y => (
                              <option key={y} value={y}>{y}년 신규 목표</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => setRegType('ratio')}
                            className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${regType === 'ratio' ? 'bg-white border-sky-500 shadow-xl shadow-sky-100' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                          >
                            <span className="font-bold">기준실적 대비 설정</span>
                            <div className={`w-6 h-6 rounded-full border-[6px] ${regType === 'ratio' ? 'border-sky-500' : 'border-slate-200'}`} />
                          </button>
                          <button 
                            onClick={() => setRegType('manual')}
                            className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${regType === 'manual' ? 'bg-white border-sky-500 shadow-xl shadow-sky-100' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                          >
                            <span className="font-bold">직접 수동 입력</span>
                            <div className={`w-6 h-6 rounded-full border-[6px] ${regType === 'manual' ? 'border-sky-500' : 'border-slate-200'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {regType === 'ratio' && (
                      <div className="space-y-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">비교 기준 연도 실적 (DB 조회)</label>
                          <select 
                            value={baseYear}
                            onChange={(e) => setBaseYear(Number(e.target.value))}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-black text-xl outline-none focus:border-sky-500 transition-all"
                          >
                            {availableBaseYears.map(y => <option key={y} value={y}>{y}년 실적 데이터</option>)}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">목표 감축률 (%)</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={reductionRatio}
                              onChange={(e) => setReductionRatio(Number(e.target.value))}
                              className="flex-1 bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-black text-2xl text-sky-600 outline-none focus:border-sky-500"
                            />
                            <button 
                              onClick={applyRatioDistribution}
                              className="px-8 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-100"
                            >
                              비율 적용
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">자동 분배 방식</label>
                          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl">
                            <button onClick={() => setDistType('actual')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${distType === 'actual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>실적 비율</button>
                            <button onClick={() => setDistType('equal')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${distType === 'equal' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>1/12 균등</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                {/* Simulation Chart */}
                <div className="xl:col-span-8 space-y-10">
                  <section className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                      <h3 className="text-2xl font-black">시뮬레이션 그래프</h3>
                      <div className="flex gap-6 mb-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900"></div><span className="text-[11px] font-black text-slate-500">{baseYear}년 실적</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-500"></div><span className="text-[11px] font-black text-slate-500">{regYear}년 목표</span></div>
                      </div>
                    </div>

                    <div className="h-[450px] w-full bg-slate-50/50 rounded-[3rem] p-12 border border-slate-200 flex items-end justify-between gap-5 relative overflow-hidden shadow-inner">
                      {/* Y-Axis Labeling */}
                      <div className="flex flex-col justify-between h-[calc(100%-40px)] text-[10px] font-black text-slate-400 absolute left-4 top-12 bottom-12 pointer-events-none">
                        {yAxisMarkers.map(m => <div key={m}>{m >= 1000 ? (m/1000).toFixed(1)+'k' : m}</div>)}
                      </div>

                      {/* SVG Line Chart for Actuals (진하게 변경) */}
                      <svg className="absolute inset-0 w-full h-full p-12 pl-14 pointer-events-none" viewBox="0 0 1000 320" preserveAspectRatio="none">
                        <path
                          d={`M ${baseActuals.map((m, i) => `${(i * 88) + 12},${320 - (m.value / yAxisMarkers[0]) * 320}`).join(' L ')}`}
                          fill="none"
                          stroke="#0f172a" /* 진한 네이비 */
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-sm"
                        />
                        {baseActuals.map((m, i) => (
                          <circle key={i} cx={(i * 88) + 12} cy={320 - (m.value / yAxisMarkers[0]) * 320} r="7" fill="#0f172a" />
                        ))}
                      </svg>

                      {/* Bar Chart for Targets */}
                      <div className="flex-1 flex items-end justify-between gap-4 h-full pl-4 border-l border-b border-slate-200">
                        {currentData.monthly.map((m, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                            <div 
                              className="w-full bg-sky-500/90 rounded-t-xl transition-all duration-700 hover:bg-sky-600 shadow-lg shadow-sky-500/20"
                              style={{ height: getBarHeight(m.value) }}
                            />
                            <span className="absolute -bottom-8 text-[10px] font-black text-slate-400">{m.month}월</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 flex justify-between items-center shadow-sm">
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">연간 총 목표 설정</p>
                        <div className="flex items-baseline gap-2">
                          <input 
                            type="number"
                            value={currentData.total}
                            onChange={(e) => handleTotalChange(e.target.value)}
                            className="text-4xl font-black text-sky-600 outline-none w-48 bg-sky-50 rounded-2xl px-4 py-1"
                          />
                          <span className="text-xl font-bold text-slate-400">t</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-10 rounded-[2.5rem] flex justify-between items-center transition-all shadow-xl ${diffAmount === 0 ? 'bg-slate-900 shadow-slate-200' : 'bg-amber-500 shadow-amber-200'}`}>
                      <div className="text-white space-y-1">
                        <p className="text-[11px] font-black opacity-50 uppercase tracking-widest">Monthly Diff</p>
                        <p className="text-3xl font-black">{diffAmount === 0 ? '정합성 일치' : `${diffAmount.toLocaleString()} t`}</p>
                      </div>
                      {diffAmount === 0 ? <CheckCircle className="text-emerald-400" size={44} /> : <AlertCircle className="text-white animate-pulse" size={44} />}
                    </div>
                  </section>

                  {/* Register Grid */}
                  <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
                      {currentData.monthly.map((m, i) => (
                        <div key={i} className="p-6 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors">
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">{m.month}월 목표</label>
                          <input 
                            type="number"
                            value={m.value}
                            onChange={(e) => handleValueChange(i, e.target.value)}
                            className="w-full bg-transparent text-xl font-black text-slate-700 outline-none"
                          />
                          <div className="mt-2 text-[10px] font-bold text-slate-300">Prev: {baseActuals[i]?.value.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-10 bg-slate-900 flex justify-between items-center text-white">
                      <div className="flex items-center gap-4">
                        <Database className="text-sky-500" />
                        <span className="font-black text-lg">전체 등록 연도: {regYear}년</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-40 uppercase font-black">Total Expected</p>
                        <p className="text-3xl font-black text-sky-400">{monthlySum.toLocaleString()} <span className="text-sm">t</span></p>
                      </div>
                    </div>
                  </div>

                  <footer className="flex justify-end gap-6 pt-4 pb-16">
                    <button onClick={() => setView('list')} className="px-12 py-6 rounded-2xl font-black text-slate-400 hover:bg-slate-100 transition-all">등록 취소</button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={diffAmount !== 0 || monthlySum === 0 || isLoading}
                      className="px-20 py-6 bg-sky-600 text-white font-black rounded-[2rem] shadow-2xl shadow-sky-300 hover:bg-sky-700 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3"
                    >
                      {isLoading ? '저장 중...' : <><Save size={24} /> 최종 목표 등록 완료</>}
                    </button>
                  </footer>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}