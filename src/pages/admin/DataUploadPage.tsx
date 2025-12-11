import React, { useState, useMemo, useRef, useEffect } from "react";
import { Upload, AlertCircle, Save } from "lucide-react";
import * as XLSX from "xlsx";

// --- 타입 정의 ---
interface NiceParkRow {
  carNumber: string;
  accessDate: string; // 입차 일자
  accessTime: string; // 입차 시간
}

interface S1Row {
  memberId: string;
  employeeName: string;
  accessDate: string; // 근무 일자
  // accessTime: string; // 출근 시간
}

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const DataUploadPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("0"); // 기본값

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

  // 1. [S1용] 날짜만 필요할 때 (시간 버림, 날짜 밀림 방지)
  const formatDate = (val: any) => {
    if (!val) return "";

    // 엑셀에서 날짜 객체(Date)로 넘어왔을 때
    if (val instanceof Date) {
      // 시차 보정 (UTC시간을 한국 시간으로 밀어줌)
      // 엑셀(UTC 0시) -> 한국(09시)로 인식되게 만들어서 날짜가 전날로 가는 걸 막음
      const offset = val.getTimezoneOffset() * 60000;
      const dateOffset = new Date(val.getTime() - offset);

      const year = dateOffset.getFullYear();
      const month = String(dateOffset.getMonth() + 1).padStart(2, "0");
      const day = String(dateOffset.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
    // 2. 혹시 문자로 들어오면 (예: "2025/10/29")
    // 최대한 "-"로 맞춰줌
    return String(val).replace(/\//g, "-").trim();
  };

  // 2. [나이스파크용] 날짜+시간 전부 필요할 때 시간 포맷팅 (HH:mm:ss) (시간 왜곡 절대 방지!)
  const formatTimeOnly = (val: any) => {
    if (!val) return "00:00:00"; // 없으면 0시

    if (val instanceof Date) {
      // 엑셀에서 시간만 있는 셀도 Date 객체(1899년...)로 옴
      // 시차 보정 후 시간 부분만 뚝 떼어냄
      const offset = val.getTimezoneOffset() * 60000;
      const dateOffset = new Date(val.getTime() - offset);

      // "2025-10-29T17:26:20.000Z" -> "17:26:20"
      return dateOffset.toISOString().split("T")[1].split(".")[0];
    }

    // 문자로 오면 그대로 리턴 (혹시 모를 공백 제거)
    return String(val).trim();
  };

  // useEffect(() => {
  //   if (selectedYear === "2025" && selectedMonth === "7") {
  //     setIsDataExisting(true);
  //     setNiceParkData([
  //       { carNumber: "178구5586", entryDate: "2025-07-29", entryTime: "17:26:20" },
  //       { carNumber: "96구3789", entryDate: "2025-07-29", entryTime: "16:45:04" },
  //       { carNumber: "31조8043", entryDate: "2025-07-29", entryTime: "16:14:33" },
  //       { carNumber: "825너3484", entryDate: "2025-07-29", entryTime: "16:00:00" },
  //     ]);

  //     setS1Data([
  //       { workDate: "2025-07-01", employeeId: "1000", employeeName: "홍길동" },
  //       { workDate: "2025-07-02", employeeId: "1000", employeeName: "홍길동" },
  //       { workDate: "2025-07-03", employeeId: "1000", employeeName: "홍길동" },
  //     ]);
  //   } else {
  //     setIsDataExisting(false);
  //     setNiceParkData([]);
  //     setS1Data([]);
  //   }
  // }, [selectedYear, selectedMonth]);

  // ✅ [추가] 연도/월 변경 시 데이터 존재 여부 체크 (백엔드 연동)
  useEffect(() => {
    const checkDataExistence = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        // (가정) 백엔드에 요청 보냄
        const res = await fetch(
          `${BASE_URL}/admin/excel/check?year=${selectedYear}&month=${selectedMonth}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const result = await res.json();
          // result.exists가 true면 경고!
          setIsDataExisting(result.exists);
        }
      } catch (err) {
        console.error("데이터 확인 중 오류:", err);
      }
    };

    checkDataExistence();
  }, [selectedYear, selectedMonth]); // 연도나 월이 바뀌면 실행됨

  // 엑셀 파일 파싱, 업로드
  const handleFileUpload = (file: File, type: "nice" | "s1") => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 첫 행을 헤더로 인식해서 JSON 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // 타입별 데이터 매핑 (한글->영어)
      if (type === "nice") {
        const mappedData: NiceParkRow[] = jsonData
          .map((row: any) => ({
            carNumber: row["차량번호"] || row["차량 번호"],
            accessDate: formatDate(row["입차일자"] || row["입차 일자"]),
            accessTime: formatTimeOnly(row["입차시간"] || row["입차 시간"]),
          }))
          .filter((item) => item.carNumber && item.accessDate); // 빈 데이터 필터링

        setNiceParkData(mappedData);
        alert(`[NicePark] ${file.name} 파싱 완료 (${mappedData.length}건)`);
      } else if (type === "s1") {
        const mappedData: S1Row[] = jsonData
          .map((row: any) => ({
            memberId: row["사원번호"],
            employeeName: row["이름"],
            // ✅ [핵심 3] 여기도 formatDate 씌우기!
            accessDate: formatDate(row["근무일자"]),
            // accessTime: row["출근시간"],
          }))
          .filter((item) => item.memberId && item.accessDate); // 빈 데이터 필터링

        setS1Data(mappedData);
        alert(`[에스원] ${file.name} 파싱 완료 (${mappedData.length}건)`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDragOverNice = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverNice(true);
  };
  const onDropNice = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverNice(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], "nice");
    }
  };

  const onDragOverS1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverS1(true);
  };
  const onDropS1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverS1(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], "s1");
    }
  };

  // 서버 전송 핸들러 (등록 클릭 시)
  const handleSubmit = async () => {
    if (niceParkData.length === 0 && s1Data.length === 0) {
      alert("업로드할 데이터가 없습니다.");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return; // 혹은 로그인 페이지로 리다이렉트
    }

    try {
      if (niceParkData.length > 0) {
        const resNice = await fetch(
          `${BASE_URL}/admin/excel/upload/nicepark?year=${selectedYear}&month=${selectedMonth}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(niceParkData),
          }
        );

        if (!resNice.ok) throw new Error("나이스파크 업로드 실패");
      }

      if (s1Data.length > 0) {
        const resS1 = await fetch(
          `${BASE_URL}/admin/excel/upload/s1?year=${selectedYear}&month=${selectedMonth}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(s1Data),
          }
        );

        if (!resS1.ok) throw new Error("에스원 업로드 실패");
      }
      alert("데이터가 성공적으로 등록되었습니다!");
      // 성공 후 초기화
      setNiceParkData([]);
      setS1Data([]);

      // ✅ [추가] 업로드 성공했으니 데이터 존재 여부 다시 체크 (경고창 띄우기 위해)
      setIsDataExisting(true);
    } catch (err: any) {
      console.error(err);
      alert(`오류 발생: ${err.message}`);
    }
  };

  return (
    <div className="p-8 bg-white font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          출입 데이터 업로드
        </h2>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              연도 선택
            </span>
            <select
              className="w-28 h-9 border border-gray-300 rounded-md px-2 bg-gray-50"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              월 선택
            </span>
            <select
              className="w-28 h-9 border border-gray-300 rounded-md px-2 bg-gray-50"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="0">전체</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>

          {isDataExisting && (
            <div className="flex items-center text-red-600 text-sm font-bold gap-2 mt-2 p-3 border border-red-200 rounded">
              <AlertCircle size={20} />
              <span>
                {selectedMonth === "0"
                  ? `⚠️ [주의] ${selectedYear}년도의 모든 기존 데이터(1월~12월)가 삭제되고 덮어씌워집니다!`
                  : `ℹ️ ${selectedYear}년 ${selectedMonth}월 데이터가 이미 존재합니다. 업로드 시 덮어씁니다.`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex gap-8 mt-4">
        {/* LEFT - NicePark */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-3">
            나이스파크 데이터
          </h3>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center cursor-pointer transition-all mb-3 text-gray-600 text-sm
              ${
                isDragOverNice
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-gray-50"
              }`}
            onClick={() => niceFileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverNice(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOverNice(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverNice(false);
              if (e.dataTransfer.files.length > 0)
                handleFileUpload(e.dataTransfer.files[0], "nice");
            }}
          >
            <Upload size={18} className="mr-2" /> 나이스파크 파일 업로드
            <input
              type="file"
              ref={niceFileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={(e) => {
                // 파일이 선택되었는지 확인하고 핸들러 호출
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0], "nice");
                  // (선택 사항) 같은 파일을 다시 올릴 때를 대비해 value 초기화
                  e.target.value = "";
                }
              }}
            />
          </div>

          {niceParkData.length > 0 && (
            <div className="text-xs text-green-600 font-semibold mb-2">
              {niceParkData.length}개 데이터 로드됨
            </div>
          )}

          <h4 className="text-xs font-bold text-gray-600 mt-3 mb-2">
            나이스파크 출입차량 데이터
          </h4>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    차량 번호
                  </th>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    입차 일자
                  </th>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    입차 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {niceParkData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 p-6">
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  niceParkData.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2 text-gray-800">{row.carNumber}</td>
                      <td className="p-2 text-gray-800">{row.accessDate}</td>
                      <td className="p-2 text-gray-800">{row.accessTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT - S1 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-3">
            에스원 데이터
          </h3>

          <div
            className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center cursor-pointer transition-all mb-3 text-gray-600 text-sm
              ${
                isDragOverS1
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-gray-50"
              }`}
            onClick={() => s1FileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverS1(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOverS1(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverS1(false);
              if (e.dataTransfer.files.length > 0)
                handleFileUpload(e.dataTransfer.files[0], "s1");
            }}
          >
            <Upload size={18} className="mr-2" /> 에스원 파일 업로드
            <input
              type="file"
              ref={s1FileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0], "s1");
                  e.target.value = "";
                }
              }}
            />
          </div>

          {s1Data.length > 0 && (
            <div className="text-xs text-green-600 font-semibold mb-2">
              {s1Data.length}개 데이터 로드됨
            </div>
          )}

          <h4 className="text-xs font-bold text-gray-600 mt-3 mb-2">
            에스원 출입차량 데이터
          </h4>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    사원번호
                  </th>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    사원명
                  </th>
                  <th className="p-2 text-left text-gray-700 font-semibold">
                    근무일자
                  </th>
                </tr>
              </thead>
              <tbody>
                {s1Data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 p-6">
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  s1Data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2 text-gray-800">{row.accessDate}</td>
                      <td className="p-2 text-gray-800">{row.memberId}</td>
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
