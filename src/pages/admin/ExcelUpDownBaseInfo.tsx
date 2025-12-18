import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Save, AlertCircle, X } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import Modal from "../../components/Modal";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const ExcelManagementPage: React.FC = () => {
  // --- [UI 상태] ---
  const [isDragOver, setIsDragOver] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]); // 파싱된 엑셀 데이터
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- [모달 상태] ---
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    title: "",
    message: "",
    isSuccess: true,
  });

  // --- [1. 엑셀 파일 읽기 로직 (모달에서 가져옴)] ---
  const handleFileRead = (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      }) as any[];

      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0])); // 헤더 추출
        setExcelData(jsonData); // 데이터 저장
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 드래그 앤 드롭 핸들러
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  // 초기화 (취소 버튼용)
  const handleReset = () => {
    setExcelData([]);
    setHeaders([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // const openUploadModal = () => {
  //   setUploadModalOpen(true);
  // };

  // ✅ [핵심 로직] 엑셀 파싱 및 서버 전송
  //const handleFileUpload = async (excelData: any[]) => {
  // 1. 모달 닫기
  //   setUploadModalOpen(false);

  // const reader = new FileReader();

  // reader.onload = async (e) => {
  //   try {
  //     const data = e.target?.result;
  //     if (!data) throw new Error("파일을 읽을 수 없습니다.");
  //     const workbook = XLSX.read(data, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const jsonData = XLSX.utils.sheet_to_json(sheet);

  // --- [2. 서버 전송 로직 (기존 페이지 로직 유지)] ---
  const handleServerUpload = async () => {
    if (excelData.length === 0) {
      alert("업로드할 데이터가 없습니다.");
      return;
    }

    // 2. 데이터 매핑
    const requestData = excelData.map((row: any) => ({
      // [기초 정보]
      purposeName: row["운행\r\n목적"] || "",
      scope: row["Scope"] ? String(row["Scope"]) : "3",
      fuelName: row["연료 종류"] || "",
      emissionFactor: row["탄소\r\n배출\r\n계수"] || 0,

      // [업체 정보]
      companyName: row["업체"] || "",
      address: row["주소"] || "",
      supplyTypeName: row["공급유형"] || "",
      supplyCustomerName: row["공급고객"] || "",

      // [핵심] 거리 값 하나를 보내면 백엔드가 알아서 나눔!
      distanceInput: row["편도거리\r\n(km)"] || row["편도거리"] || 0,

      // [차종 정보]
      bigCategory: row["차종구분 \r\n(대분류)"] || "",
      smallCategory: row["차종구분 \r\n(소분류)"] || "",
      efficiency: row["연비\r\n(ℓ/km)"] || 0,

      // [차량 정보]
      carNumber: row["차량 번호"] || "",
      carModelName: row["차종"] || "",
      driverMemberId: row["사원\r\n번호"] || "", // 👈 사원번호 변수명 체크 완료!
      //emplyeeName: row["소유주"] || ""
    }));

    console.log("서버 전송 데이터:", requestData);

    try {
      // 서버 전송 시작
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      // Axios POST 요청
      await axios.post(
        `${BASE_URL}/admin/excel/upload/base-info`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // 명시해주면 더 좋음
          },
        }
      );

      // 성공 처리
      setAlertState({
        title: "업로드 성공",
        message: `총 ${requestData.length}건이 성공적으로 등록되었습니다! 🎉`,
        isSuccess: true,
      });
      setAlertModalOpen(true);

      // 성공후 초기화
      handleReset();
    } catch (error: any) {
      console.error("업로드 실패:", error);
      let errorMessage = "서버 저장 중 오류가 발생했습니다.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "로그인 세션이 만료되었습니다.";
        } else {
          errorMessage = error.response.data?.message || "서버 에러 발생";
        }
      } else if (error.request) {
        errorMessage = "서버와 통신할 수 없습니다.";
      }

      setAlertState({
        title: "업로드 실패",
        message: errorMessage,
        isSuccess: false,
      });
      setAlertModalOpen(true);
    }
  };

  const handleExcelDownload = async () => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    const res = await axios.get(`${BASE_URL}/admin/excel/download/base-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "기준정보_전체.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-8 font-sans max-w-5/6 bg-gray-50">
      {/* 1. Header Area */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            통합 기준정보 관리
          </h2>
          <p className="text-gray-500">
            업체, 차량, 차종 등 모든 기준정보를 엑셀 파일 하나로 일괄
            등록합니다.
          </p>
        </div>

        {/* 우측 상단 다운로드 버튼 (기존 유지) */}
        <button
          onClick={handleExcelDownload}
          className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <FileSpreadsheet size={16} className="mr-2 text-green-600" />
          기준정보 엑셀 다운로드
        </button>
      </div>

      {/* 2. Upload Area (드래그 앤 드롭) */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div
          className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragOver
              ? "border-blue-500 bg-blue-50 text-blue-500"
              : "border-gray-300 bg-gray-50 text-gray-600"
          }`}
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload
            size={40}
            className={`mb-2 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
          />
          <span className="text-lg font-bold">클릭하여 엑셀 파일 업로드</span>
          <span className="mt-1 text-sm text-gray-500">
            또는 파일을 여기로 드래그하세요
          </span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) =>
              e.target.files && handleFileRead(e.target.files[0])
            }
          />
        </div>
      </div>

      {/* 3. Preview & Action Area */}
      {excelData.length > 0 ? (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          {/* 테이블 헤더 & 버튼 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="flex items-center font-bold text-gray-700">
              <span className="px-2 py-1 mr-2 text-xs text-green-800 bg-green-100 rounded-full">
                {excelData.length}건
              </span>
              데이터 미리보기
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 rounded text-sm hover:bg-gray-100 flex items-center"
              >
                <X size={14} className="mr-1" /> 취소
              </button>
              <button
                onClick={handleServerUpload}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow-sm"
              >
                <Save size={16} className="mr-2" /> 최종 등록
              </button>
            </div>
          </div>

          {/* 테이블 본문 */}
          <div className="overflow-x-auto max-h-[800px] block w-full max-w-[calc(100vw-150px)]">
            <table className="w-full text-sm text-left border-collapse whitespace-nowrap min-w-max">
              <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                    {headers.map((header) => (
                      <td
                        key={header}
                        className="px-6 py-3 text-gray-700 whitespace-nowrap"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // 데이터 없을 때 안내 메시지
        <div className="p-12 text-center text-gray-400 bg-white border border-gray-200 border-dashed rounded-xl">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-300">
            업로드된 데이터가 없습니다.
          </p>
          <p className="text-sm text-gray-400">
            위 영역을 클릭하여 엑셀 파일을 추가해주세요.
          </p>
        </div>
      )}

      {/* 결과 알림 모달 */}
      <Modal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={alertState.title}
        message={alertState.message}
        isSuccess={alertState.isSuccess}
      />
    </div>
  );
};

export default ExcelManagementPage;
