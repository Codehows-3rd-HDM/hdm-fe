import React, { useState, useEffect, useMemo, useRef } from "react";
import { Upload, AlertCircle, Save } from "lucide-react";

// --- 타입 정의 ---
interface NiceParkRow {
  carNumber: string;
  entryDate: string;
  entryTime: string;
}

interface S1Row {
  workDate: string;
  employeeId: string;
  employeeName: string;
}

const DataUploadPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("7");

  const [niceParkData, setNiceParkData] = useState<NiceParkRow[]>([]);
  const [s1Data, setS1Data] = useState<S1Row[]>([]);
  const [isDataExisting, setIsDataExisting] = useState(false);
  const [isDragOverNice, setIsDragOverNice] = useState(false);
  const [isDragOverS1, setIsDragOverS1] = useState(false);

  const niceFileInputRef = useRef<HTMLInputElement>(null);
  const s1FileInputRef = useRef<HTMLInputElement>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1979;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) years.push(y);
    return years;
  }, []);

  useEffect(() => {
    if (selectedYear === "2025" && selectedMonth === "7") {
      setIsDataExisting(true);
      setNiceParkData([
        { carNumber: "178구5586", entryDate: "2025-07-29", entryTime: "17:26:20" },
        { carNumber: "96구3789", entryDate: "2025-07-29", entryTime: "16:45:04" },
        { carNumber: "31조8043", entryDate: "2025-07-29", entryTime: "16:14:33" },
        { carNumber: "825너3484", entryDate: "2025-07-29", entryTime: "16:00:00" },
      ]);

      setS1Data([
        { workDate: "2025-07-01", employeeId: "1000", employeeName: "홍길동" },
        { workDate: "2025-07-02", employeeId: "1000", employeeName: "홍길동" },
        { workDate: "2025-07-03", employeeId: "1000", employeeName: "홍길동" },
      ]);
    } else {
      setIsDataExisting(false);
      setNiceParkData([]);
      setS1Data([]);
    }
  }, [selectedYear, selectedMonth]);

  const handleFileUpload = (file: File, type: "nice" | "s1") => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      return;
    }

    if (type === "nice") {
      const newMockData: NiceParkRow[] = Array.from({ length: 10 }).map((_, i) => ({
        carNumber: `${Math.floor(Math.random() * 100)}가${Math.floor(Math.random() * 10000)}`,
        entryDate: "2025-07-30",
        entryTime: `1${i}:30:00`,
      }));
      setNiceParkData(newMockData);
      alert(`[NicePark] ${file.name} 업로드 완료 (가상)`);
    } else {
      const newMockData: S1Row[] = Array.from({ length: 10 }).map((_, i) => ({
        workDate: `2025-07-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
        employeeId: "2025001",
        employeeName: "김철수",
      }));
      setS1Data(newMockData);
      alert(`[S1] ${file.name} 업로드 완료 (가상)`);
    }
  };

  const handleSubmit = () => {
    if (niceParkData.length === 0 && s1Data.length === 0) {
      alert("업로드할 데이터가 없습니다.");
      return;
    }

    alert("데이터가 성공적으로 등록되었습니다.");
  };

  return (
    <div className="p-8 bg-white font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">출입 데이터 업로드</h2>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 mb-1">연도 선택</span>
            <select
              className="w-28 h-9 border border-gray-300 rounded-md px-2 bg-gray-50"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 mb-1">월 선택</span>
            <select
              className="w-28 h-9 border border-gray-300 rounded-md px-2 bg-gray-50"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">전체</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>

          {isDataExisting && (
            <div className="flex items-center text-red-500 text-sm font-semibold gap-1">
              <AlertCircle size={16} /> 이미 등록된 데이터입니다. 등록 시 기존 데이터는 삭제됩니다.
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex gap-8 mt-4">
        {/* LEFT - NicePark */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-3">나이스파크 데이터</h3>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center cursor-pointer transition-all mb-3 text-gray-600 text-sm
              ${isDragOverNice ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 bg-gray-50"}`}
            onClick={() => niceFileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOverNice(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOverNice(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverNice(false);
              if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0], "nice");
            }}
          >
            <Upload size={18} className="mr-2" /> 나이스파크 파일 업로드
            <input type="file" ref={niceFileInputRef} className="hidden" accept=".xlsx,.xls" />
          </div>

          {niceParkData.length > 0 && (
            <div className="text-xs text-green-600 font-semibold mb-2">{niceParkData.length}개 데이터 로드됨</div>
          )}

          <h4 className="text-xs font-bold text-gray-600 mt-3 mb-2">나이스파크 출입차량 데이터</h4>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-gray-700 font-semibold">차량 번호</th>
                  <th className="p-2 text-left text-gray-700 font-semibold">입차 일자</th>
                  <th className="p-2 text-left text-gray-700 font-semibold">입차 시간</th>
                </tr>
              </thead>
              <tbody>
                {niceParkData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 p-6">데이터가 없습니다. 파일을 업로드해주세요.</td>
                  </tr>
                ) : (
                  niceParkData.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2 text-gray-800">{row.carNumber}</td>
                      <td className="p-2 text-gray-800">{row.entryDate}</td>
                      <td className="p-2 text-gray-800">{row.entryTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT - S1 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-3">에스원 데이터</h3>

          <div
            className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center cursor-pointer transition-all mb-3 text-gray-600 text-sm
              ${isDragOverS1 ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 bg-gray-50"}`}
            onClick={() => s1FileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOverS1(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOverS1(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverS1(false);
              if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0], "s1");
            }}
          >
            <Upload size={18} className="mr-2" /> 에스원 파일 업로드
            <input type="file" ref={s1FileInputRef} className="hidden" accept=".xlsx,.xls" />
          </div>

          {s1Data.length > 0 && (
            <div className="text-xs text-green-600 font-semibold mb-2">{s1Data.length}개 데이터 로드됨</div>
          )}

          <h4 className="text-xs font-bold text-gray-600 mt-3 mb-2">에스원 출입차량 데이터</h4>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-gray-700 font-semibold">근무일자</th>
                  <th className="p-2 text-left text-gray-700 font-semibold">사원번호</th>
                  <th className="p-2 text-left text-gray-700 font-semibold">사원명</th>
                </tr>
              </thead>
              <tbody>
                {s1Data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 p-6">데이터가 없습니다. 파일을 업로드해주세요.</td>
                  </tr>
                ) : (
                  s1Data.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2 text-gray-800">{row.workDate}</td>
                      <td className="p-2 text-gray-800">{row.employeeId}</td>
                      <td className="p-2 text-gray-800">{row.employeeName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8 border-t pt-4 border-gray-200">
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
          onClick={handleSubmit}
        >
          <Save size={18} /> 등록 ({niceParkData.length + s1Data.length})
        </button>
      </div>
    </div>
  );
};

export default DataUploadPage;
