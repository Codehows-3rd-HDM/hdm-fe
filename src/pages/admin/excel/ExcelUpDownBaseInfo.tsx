import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Save, AlertCircle, X } from "lucide-react";
import axios from "axios";
import Modal from "../../../components/Modal";
import Breadcrumb from "../../../components/Breadcrumb";
import { getBreadcrumbItems } from "../../../utils/breadcrumbHelper";
import { parseExcelFile } from "./utils/Parsing";
import { mapToBaseInfoData } from "./utils/Mappers";
import LoadingSpinner from "../../../components/LoadingSpinner";

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

  // 로딩 상태 관리 (true면 스피너 뜸, false면 안 뜸)
  const [isLoading, setIsLoading] = useState(false);

  // 행 색깔 결정 로직 (진하게 설정)
  const getRowClass = (status?: string) => {
    switch (status) {
      case "NEW":
        return "bg-green-100 hover:bg-green-200 transition-colors"; // 신규
      case "UPDATED":
        return "bg-blue-100 hover:bg-blue-200 transition-colors"; // 수정
      default:
        return "hover:bg-gray-50 transition-colors"; // 유지
    }
  };

  // --- [엑셀 검증 로직] ---
  const checkPreviewStatus = async (parsedData: any[]) => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    try {
      // 1. 서버 비교 요청
      const res = await axios.post(
        `${BASE_URL}/admin/excel/upload/base-info/check`,
        mapToBaseInfoData(parsedData),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkResults = res.data;

      // 2. 데이터 합치기
      const mergedData = parsedData.map((row, index) => {
        // 백엔드 응답 매칭
        const result =
          checkResults.find((r: any) => r.carNumber === row.carNumber) ||
          checkResults[index];

        // [수정] DB에서 날짜 꺼내오기
        // 설명: result.dbData는 백엔드가 보내준 "현재 DB에 저장된 정보"입니다.
        const dbStoredDate = result?.dbData?.calcBaseDate || "";

        return {
          ...row,
          rowStatus: result?.rowStatus || "UNCHANGED",
          message: result?.message || "",
          // dbData는 이제 굳이 필요 없지만, 나중에 혹시 쓸까봐 남겨만 둠 (화면엔 안 뿌림)
          dbData: result?.dbData || {},

          // [핵심 수정]
          // 1순위: 엑셀 파일에 적혀있는 날짜 (row.calcBaseDate)
          // 2순위: DB에 저장되어 있는 날짜 (dbStoredDate)
          // 3순위: 빈값 ("")
          calcBaseDate: row.calcBaseDate || dbStoredDate || "",
        };
      });

      setExcelData(mergedData);

      // [중요] 엑셀 헤더 설정 (내부 변수인 rowStatus, dbData 등은 제외하고 순수 엑셀 헤더만)
      if (parsedData.length > 0) {
        const allHeaders = Object.keys(parsedData[0]); // 엑셀의 모든 헤더 가져옴

        // 필터링: "co2 배출량"이 포함된 헤더는 제외!
        const filteredHeaders = allHeaders.filter(
          (header) => !header.includes("co2") && !header.includes("배출량")
        );

        setHeaders(filteredHeaders);
      }
    } catch (e: any) {
      console.error("검증 실패:", e);
      alert("서버 검증 중 오류가 발생했습니다.");
      setExcelData(parsedData);
      // 에러나도 헤더는 설정
      if (parsedData.length > 0) setHeaders(Object.keys(parsedData[0]));
    }
  };

  // --- [1. 엑셀 파일 읽기 로직 (모달에서 가져옴)] ---
  const handleFileRead = async (file: File) => {
    try {
      setIsLoading(true);
      const { normalizedData } = await parseExcelFile(file);

      if (normalizedData.length > 0) {
        // 1. 반드시 포함되어야 하는 '필수 헤더'
        const REQUIRED_HEADERS = [
          "차량번호",
          "사원번호",
          "협력사명",
          "공급유형",
          "공급고객",
          "Scope",
          "운행목적",
          "주소",
          "편도거리(km)",
          "차종",
          "차종구분(대분류)",
          "차종구분(소분류)",
          "연료종류",
          "연비(ℓ/km)",
          "탄소배출계수",
        ];

        // 엑셀에서 읽어온 실제 헤더들 (normalize로 인해 공백은 이미 제거된 상태)
        const excelHeaders = Object.keys(normalizedData[0]);

        // 2. 필수 항목이 모두 들어있는지 검사
        const missing = REQUIRED_HEADERS.filter(
          (h) => !excelHeaders.includes(h)
        );

        if (missing.length > 0) {
          // 필수 항목이 하나라도 없으면 입구 컷!
          setAlertState({
            title: "필수 항목 누락",
            message: `엑셀 양식에 필수 항목 [${missing.join(
              ", "
            )}]이(가) 없습니다.\n헤더 이름을 확인해주세요.`,
            isSuccess: false,
          });
          setAlertModalOpen(true);
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // 3. 검증 통과!
        // 이제 'headers' 상태값에는 화면에 보여줄 항목만 설정하거나, 전체를 설정
        // 우리는 Mapper에서 지정한 것만 가져갈 것이므로 excelHeaders 전체를 넘겨도 안전
        setHeaders(excelHeaders);
        await checkPreviewStatus(normalizedData);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
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

  // [핵심 로직] 엑셀 파싱 및 서버 전송
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
  // --- [최종 서버 업로드] ---
  const handleServerUpload = async () => {
    // 1. 저장할 데이터만 골라내기 (신규 or 수정)
    // "UNCHANGED"는 서버로 보낼 필요가 없음 (서버 부하 감소)
    const targetData = excelData.filter(
      (row) => row.rowStatus === "NEW" || row.rowStatus === "UPDATED"
    );

    if (targetData.length === 0) {
      alert("변경되거나 신규로 등록할 데이터가 없습니다.");
      return;
    }

    // 스피너 켜기 (화면 잠금)
    setIsLoading(true);

    // 2. 골라낸 데이터만 포맷팅 (Mapper)
    const requestData = mapToBaseInfoData(targetData);

    console.log("서버로 날아가는 데이터:", requestData);

    // 로그로 확인해보세요. 훨씬 가벼워졌을 겁니다.
    console.log(
      `전체 ${excelData.length}건 중 저장 대상 ${requestData.length}건 전송`
    );

    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/admin/excel/upload/base-info`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAlertState({
        title: "업로드 성공",
        message: `총 ${requestData.length}건이 성공적으로 저장되었습니다!`,
        isSuccess: true,
      });
      setAlertModalOpen(true);

      // 성공 후 초기화
      handleReset();
    } catch (error: any) {
      console.error("업로드 실패:", error);
      let errorMessage = "서버 저장 중 오류가 발생했습니다.";
      if (error.response)
        errorMessage = error.response.data?.message || "서버 에러 발생";
      setAlertState({
        title: "업로드 실패",
        message: errorMessage,
        isSuccess: false,
      });
      setAlertModalOpen(true);
    } finally {
      // 성공하든 실패하든 무조건 스피너 끄기!
      setIsLoading(false);
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

  // [신규] 날짜 입력 핸들러
  const handleDateChange = (index: number, newDate: string) => {
    setExcelData((prev) => {
      const newData = [...prev];
      const currentRow = newData[index];

      // 1. 날짜 업데이트
      const updatedRow = {
        ...currentRow,
        calcBaseDate: newDate,
      };

      // 2. [핵심] 상태 업데이트 로직 추가!
      // 신규(NEW)인 건 건드리지 말고, 기존 데이터(UNCHANGED)인 경우만 '수정(UPDATED)'으로 변경
      if (updatedRow.rowStatus === "UNCHANGED") {
        updatedRow.rowStatus = "UPDATED";
        updatedRow.message = "기준일 입력됨"; // 비고란에도 표시해주면 더 좋음
      }

      newData[index] = updatedRow;
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 min-w-0 flex flex-col">
      <div className="w-full h-full relative flex-1 flex flex-col" style={{ padding: 'var(--padding-container)' }}>
        {/* 로딩 중일 때 화면 전체 덮어버림 */}
        {isLoading && <LoadingSpinner />}

        <Breadcrumb items={getBreadcrumbItems('/admin/excel/manage')} />

        {/* 1. Header Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              통합 기준정보 관리
            </h2>
            <p className="text-gray-500">
              업체, 차량, 차종 등 모든 기준정보를 엑셀 파일 하나로 일괄
              등록합니다.
            </p>
          </div>
          <button
            onClick={handleExcelDownload}
            className="flex-shrink-0 flex items-center text-sm font-bold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            style={{ padding: 'var(--padding-btn)' }}
          >
            <FileSpreadsheet size={16} className="mr-2 text-green-600" />
            기준정보 엑셀 다운로드
          </button>
        </div>

        {/* 2. Upload Area */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl" style={{ padding: 'var(--padding-card)', marginBottom: 'var(--spacing-lg)' }}>
          <div
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragOver
                ? "border-blue-500 bg-blue-50 text-blue-500"
                : "border-gray-300 bg-gray-50 text-gray-600"
            }`}
            style={{ height: '8rem' }}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload
              size={40}
              className={`mb-2 ${
                isDragOver ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span className="text-lg font-bold">클릭하여 엑셀 파일 업로드</span>
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
          // [수정 3] 테이블 영역이 남은 높이를 꽉 채우도록 flex-1 적용 (선택 사항)
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[70vh] min-h-0">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 flex-shrink-0" style={{ padding: 'var(--spacing-md)' }}>
              <h3 className="flex items-center font-bold text-gray-700">
                <span className="px-2 py-1 mr-2 text-xs text-green-800 bg-green-100 rounded-full">
                  {excelData.length}건
                </span>
                데이터 검증 및 미리보기
              </h3>
              <div className="flex gap-2" style={{ gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={handleReset}
                  className="border border-gray-300 bg-white text-gray-600 rounded text-sm hover:bg-gray-100 flex items-center"
                  style={{ padding: '0.375rem 0.75rem' }}
                >
                  <X size={14} className="mr-1" /> 취소
                </button>
                <button
                  onClick={handleServerUpload}
                  className="bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow-sm"
                  style={{ padding: '0.375rem 1rem' }}
                >
                  <Save size={16} className="mr-2" /> 등록
                </button>
              </div>
            </div>

            <div className="flex text-sm text-gray-600 border-b bg-white flex-shrink-0" style={{ gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-green-100 border border-green-200 rounded"></span>{" "}
                신규
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></span>{" "}
                수정
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-white border border-gray-200 rounded"></span>{" "}
                동일
              </span>
            </div>

            {/* [수정 4] max-h 대신 flex-1로 남은 공간 꽉 채우기 + 오버플로우 발생 시 스크롤 */}
            <div className="relative w-full overflow-auto flex-1">
              <table className="w-full table-auto text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-gray-100 border-b shadow-sm">
                  <tr>
                    <th className="sticky left-0 z-30 bg-gray-100 text-center w-20 min-w-[80px] whitespace-nowrap border-r" style={{ padding: '0.75rem 1rem' }}>
                      상태
                    </th>

                    {/* 2. [추가] 기준일 헤더 (수동 추가) */}
                    <th className="text-center min-w-[140px] whitespace-nowrap bg-gray-100 font-bold text-blue-700" style={{ padding: '0.75rem 1rem' }}>
                      차량등록일
                    </th>

                    {headers.map((header) => (
                      <th
                        key={header}
                        className="text-center min-w-[150px] whitespace-nowrap bg-gray-100"
                        style={{ padding: '0.75rem 1rem' }}
                      >
                        {header}
                      </th>
                    ))}
                    <th className="sticky right-0 z-30 bg-gray-100 text-center min-w-[160px] border-l" style={{ padding: '0.75rem 1rem' }}>
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {excelData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`${getRowClass(
                        row.rowStatus
                      )} hover:bg-gray-50`}
                    >
                      <td className="sticky left-0 z-10 bg-white text-center border-r" style={{ padding: '0.75rem 1rem' }}>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold border
                          ${
                            row.rowStatus === "NEW"
                              ? "bg-green-200 text-green-900 border-green-300"
                              : row.rowStatus === "UPDATED"
                              ? "bg-blue-200 text-blue-900 border-blue-300"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {row.rowStatus === "NEW"
                            ? "신규"
                            : row.rowStatus === "UPDATED"
                            ? "수정"
                            : "동일"}
                        </span>
                      </td>

                      {/* 2. [추가] 차량등록일 입력창 (<input type="date">) */}
                      <td className="text-center" style={{ padding: '0.75rem 0.5rem' }}>
                        <input
                          type="date"
                          value={row.calcBaseDate || ""} // 값이 없으면 빈칸
                          // [수정] 신규(NEW)가 아니면 잠금(disabled)
                          disabled={row.rowStatus !== "NEW"}
                          onChange={(e) =>
                            handleDateChange(idx, e.target.value)
                          }
                          className={`
                            w-full text-xs border rounded outline-none transition-all
                            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                            ${
                              // [우선순위 1] 기존 데이터(NEW가 아님) -> 회색 배경 & 잠김 커서
                              row.rowStatus !== "NEW"
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                                : // [우선순위 2] 신규 데이터인데 값이 없음 -> 빨간 배경
                                !row.calcBaseDate
                                ? "bg-red-50 border-red-300 text-red-600 font-bold cursor-pointer"
                                : // [우선순위 3] 신규 데이터이고 값도 있음 -> 흰 배경 (일반)
                                  "bg-white border-gray-300 text-gray-700 cursor-pointer"
                            }                          style={{ padding: 'var(--padding-input-sm)' }}                          `}
                          // 값이 없으면 빨간색으로 "입력해!"라고 티를 냅니다.
                        />
                      </td>

                      {headers.map((header) => (
                        <td
                          key={header}
                          className="text-center min-w-[150px] break-words"
                          style={{ padding: '0.75rem 1rem' }}
                        >
                          {row[header]}
                        </td>
                      ))}

                      <td
                        className={`sticky right-0 z-10 text-xs text-gray-500 text-center min-w-[160px] border-l whitespace-nowrap
                        ${
                          // 1. 신규일 때 (보통 연한 초록색 배경)
                          row.rowStatus === "NEW"
                            ? "bg-green-100" // 여기에 줄(tr) 색상과 똑같은 색을 넣으세요!
                            : // 2. 수정일 때 (보통 연한 파란색 배경)
                            row.rowStatus === "UPDATED"
                            ? "bg-blue-100 " // 여기에 줄(tr) 색상과 똑같은 색을 넣으세요!
                            : // 3. 그 외 (흰색)
                              "bg-white"
                        }`}
                        style={{ padding: '0.75rem 1rem' }}
                      >
                        {row.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 bg-white border border-gray-200 border-dashed rounded-xl" style={{ padding: '3rem' }}>
            <AlertCircle size={48} className="mx-auto opacity-20" style={{ marginBottom: 'var(--spacing-md)' }} />
            <p className="text-lg font-medium text-gray-300">
              업로드된 데이터가 없습니다.
            </p>
          </div>
        )}

        <Modal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          title={alertState.title}
          message={alertState.message}
          isSuccess={alertState.isSuccess}
        />
      </div>
    </div>
  );
};

export default ExcelManagementPage;
