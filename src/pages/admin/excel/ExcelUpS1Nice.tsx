import React, { useState, useMemo, useRef, useEffect } from "react";
import { Upload, AlertCircle, Save, X, Search } from "lucide-react";
import axios from "axios";
import Modal from "../../../components/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import { parseExcelFile } from "./utils/Parsing";
import { mapToNiceParkData, mapToS1Data } from "./utils/Mappers";
import LoadingSpinner from "../../../components/LoadingSpinner";

// --- 타입 정의 ---
interface NiceParkRow {
  idx: number;
  carNumber: string;
  accessDate: string; // 입차 일자
  accessTime: string; // 입차 시간
  isInvalid: boolean;
}

interface S1Row {
  idx: number;
  memberId: string;
  employeeName: string;
  accessDate: string; // 근무 일자
  // accessTime: string; // 출근 시간
  isInvalid: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const DataUploadPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("0"); // 기본값

  const [niceParkData, setNiceParkData] = useState<NiceParkRow[]>([]);
  const [s1Data, setS1Data] = useState<S1Row[]>([]);

  const [isNiceDataExisting, setIsNiceDataExisting] = useState(false);
  const [isS1DataExisting, setIsS1DataExisting] = useState(false);
  const [isDragOverNice, setIsDragOverNice] = useState(false);
  const [isDragOverS1, setIsDragOverS1] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); //확인 모달 열기, 닫기
  const [confirmMessage, setConfirmMessage] = useState(""); // 확인 모달에 띄울 멘트

  const [ModalOpen, setModalOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    title: "",
    message: "",
    isSuccess: true,
  });
  const openAlertModal = (
    title: string,
    message: string,
    isSuccess: boolean
  ) => {
    // 여기서 위의 setAlertState를 갖다 씁니다.
    setAlertState({
      title,
      message,
      isSuccess,
    });
    // 여기서 위의 setModalOpen을 갖다 씁니다.
    setModalOpen(true);
  };

  const niceFileInputRef = useRef<HTMLInputElement>(null);
  const s1FileInputRef = useRef<HTMLInputElement>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1979;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) years.push(y);
    return years;
  }, []);

  const [niceSearchTerm, setNiceSearchTerm] = useState(""); // 왼쪽(나이스) 검색어
  const [s1SearchTerm, setS1SearchTerm] = useState(""); // 오른쪽(S1) 검색어

  // 로딩 상태 관리 (true면 스피너 뜸, false면 안 뜸)
  const [isLoading, setIsLoading] = useState(false);

  // ✅ [수정] 연도/월 변경 시, 업로드된 데이터가 있다면 무조건 초기화
  useEffect(() => {
    // 데이터가 있을 때만 동작 (없으면 신경 안 씀)
    if (niceParkData.length > 0 || s1Data.length > 0) {
      // 1. 사용자에게 알림 (선택 사항: 너무 귀찮으면 alert 빼도 됨)
      alert(
        "기준 날짜가 변경되어 미리보기 데이터가 초기화됩니다.\n파일을 다시 업로드해주세요."
      );

      // 2. 데이터 싹 비우기
      setNiceParkData([]);
      setS1Data([]);

      // [추가] 검색어 비우기
      setNiceSearchTerm("");
      setS1SearchTerm("");

      // 3. 파일 input 초기화 (같은 파일 다시 선택 가능하도록)
      if (niceFileInputRef.current) niceFileInputRef.current.value = "";
      if (s1FileInputRef.current) s1FileInputRef.current.value = "";
    }
  }, [selectedYear, selectedMonth]); // 연도나 월이 바뀔 때마다 실행됨

  // ✅ 데이터 존재 여부 확인 (파일이 있거나, 날짜가 바뀔 때 실행)
  useEffect(() => {
    const checkDataExistence = async () => {
      // 1. 연도가 없으면 체크 안 함
      if (!selectedYear) return;

      const token = sessionStorage.getItem("token");
      if (!token) return;

      // 2. 초기화
      setIsNiceDataExisting(false);
      setIsS1DataExisting(false);

      // 3. 나이스파크가 업로드되어 있을 때만 체크
      if (niceParkData.length > 0) {
        try {
          const res = await axios.get(`${BASE_URL}/admin/excel/check`, {
            params: {
              year: selectedYear,
              month: selectedMonth,
              source: "NICE", // 꼬리표 부착
            },
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsNiceDataExisting(res.data.exists);
        } catch (err) {
          console.error("나이스 데이터 확인 중 오류:", err);
        }
      }

      // 4. 에스원이 업로드되어 있을 때만 체크
      if (s1Data.length > 0) {
        try {
          const res = await axios.get(`${BASE_URL}/admin/excel/check`, {
            params: {
              year: selectedYear,
              month: selectedMonth,
              source: "S1", // 꼬리표
            },
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsS1DataExisting(res.data.exists);
        } catch (err) {
          console.error("S1 데이터 확인 중 오류:", err);
        }
      }
    };

    checkDataExistence();

    // 의존성 배열: 이 값들이 변할 때마다 위 로직이 재실행됨
  }, [niceParkData, s1Data, selectedYear, selectedMonth]);

  //niceparkData || s1Data 유효성 검증
  //1. 나이스파크 데이터 내 차량번호가 DB에 기준정보로 등록 되어있는지 여부
  const checkAndSetNiceparkState = async (
    rows: NiceParkRow[]
  ): Promise<number | void> => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      // (가정) 백엔드에 요청 보냄
      const res = await axios.post(
        `${BASE_URL}/admin/excel/is-valid/nicepark`,
        rows,
        // 2. 헤더 (토큰)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = res.data;
      const invalidIdxSet = new Set(
        response.map((data: { idx: any }) => data.idx)
      );
      const checkedNiceParkData = rows.map((row) => {
        if (invalidIdxSet.has(row.idx)) {
          return {
            ...row,
            isInvalid: true,
          };
        }
        return row;
      });
      setNiceParkData(checkedNiceParkData);
      return invalidIdxSet.size;
    } catch (err) {
      console.error("데이터 확인 중 오류:", err);
    }
  };
  //2. s1 데이터 내 사원번호가 DB에 기준정보로 등록 되어있는지 여부
  const checkAndSetS1State = async (rows: S1Row[]): Promise<number | void> => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      // (가정) 백엔드에 요청 보냄
      const res = await axios.post(
        `${BASE_URL}/admin/excel/is-valid/s1`,
        rows,
        // 2. 헤더 (토큰)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = res.data;
      const invalidIdxSet = new Set(
        response.map((data: { idx: any }) => data.idx)
      );
      const checkedS1Data = rows.map((row) => {
        if (invalidIdxSet.has(row.idx)) {
          return {
            ...row,
            isInvalid: true,
          };
        }
        return row;
      });
      setS1Data(checkedS1Data);
      return invalidIdxSet.size;
    } catch (err) {
      console.error("데이터 확인 중 오류:", err);
    }
  };

  // [1단계] 등록 버튼 클릭 -> (작성해둔 함수 재사용) -> 모달 띄우기
  const handleCheckBeforeUpload = async () => {
    // 1. 데이터 없음 체크
    if (niceParkData.length === 0 && s1Data.length === 0) {
      // [수정] 데이터 없을 때 alert -> 경고 모달
      openAlertModal(
        "데이터 없음",
        "업로드할 데이터가 없습니다.\n먼저 엑셀 파일을 업로드해주세요.",
        false
      );
      return;
    }

    // 2. 검증 수행 및 메시지 생성
    try {
      let confirmMsg = "";
      let hasError = false;

      // --- [나이스파크 검사] ---
      if (niceParkData.length > 0) {
        // 이미 만들어둔 함수 호출 (State 갱신 + 에러 개수 반환)
        const invalidCount =
          (await checkAndSetNiceparkState(niceParkData)) || 0;

        const totalCount = niceParkData.length;
        const successCount = totalCount - invalidCount;

        confirmMsg += `[나이스파크]\n총 ${totalCount}건 (등록가능: ${successCount}건 / 등록불가: ${invalidCount}건)\n`;

        if (invalidCount > 0) hasError = true;
      }

      // --- [에스원 검사] ---
      if (s1Data.length > 0) {
        if (confirmMsg) confirmMsg += "\n"; // 줄바꿈

        // 이미 만들어둔 함수 호출
        const invalidCount = (await checkAndSetS1State(s1Data)) || 0;

        const totalCount = s1Data.length;
        const successCount = totalCount - invalidCount;

        confirmMsg += `[에스원]\n총 ${totalCount}건 (등록가능: ${successCount}건 / 등록불가: ${invalidCount}건)\n`;

        if (invalidCount > 0) hasError = true;
      }

      // 3. 최종 메시지 조합
      confirmMsg += "\n--------------------------\n";
      if (hasError) {
        confirmMsg +=
          "기준 정보 미등록 데이터가 포함되어 있습니다.\n(기준 정보 미등록 데이터는 저장되지 않습니다.)\n\n그래도 진행하시겠습니까?";
      } else {
        confirmMsg += "모든 데이터가 유효합니다.\n등록하시겠습니까?";
      }

      // 4. 모달 열기
      setConfirmMessage(confirmMsg);
      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("검사 프로세스 오류:", error);
      alert("데이터 검증 중 오류가 발생했습니다.");
    }
  };

  // 엑셀 파일 파싱, 업로드
  const handleFileUpload = async (file: File, type: "nice" | "s1") => {
    setIsLoading(true);
    try {
      // 1️. 엑셀 파싱 (parsing.ts)
      const { normalizedData } = await parseExcelFile(file);

      // 2. 타입별 매핑
      let mappedData: (NiceParkRow | S1Row)[] = [];

      if (type === "nice") {
        mappedData = mapToNiceParkData(normalizedData);
      } else if (type === "s1") {
        mappedData = mapToS1Data(normalizedData);
      }

      // 3️. 연/월 검증
      const invalidRow = mappedData.find((row) => {
        if (!row.accessDate) return false;

        const [y, m] = row.accessDate.split("-");

        const rowYear = parseInt(y);
        const rowMonth = parseInt(m);

        // [추가] 숫자가 아니면(빈칸, 헤더 등) 그냥 검사 안 하고 통과!
        if (isNaN(rowYear) || isNaN(rowMonth)) return false;

        if (rowYear !== parseInt(selectedYear)) return true;

        if (selectedMonth !== "0" && rowMonth !== parseInt(selectedMonth))
          return true;

        return false;
      });

      if (invalidRow) {
        // [수정] alert -> 모달 (실패일 때)
        openAlertModal(
          "날짜 불일치",
          "선택한 연/월과 엑셀 데이터가 일치하지 않습니다.\n파일의 날짜를 확인해주세요.",
          false
        );
        return;
      }

      // 4. 검증 + 상태 반영
      if (type === "nice") {
        setNiceSearchTerm("");
        const invalidCnt = await checkAndSetNiceparkState(
          mappedData as NiceParkRow[]
        );
        // [수정] alert -> 모달 (성공일 때)
        openAlertModal(
          "나이스파크 로드 완료",
          `총 ${mappedData.length}건이 로드되었습니다.\n(등록불가 : ${invalidCnt}건)`,
          true
        );
      }

      if (type === "s1") {
        setS1SearchTerm("");
        const invalidCnt = await checkAndSetS1State(mappedData as S1Row[]);
        // [수정] alert -> 모달 (성공일 때)
        openAlertModal(
          "에스원 로드 완료",
          `총 ${mappedData.length}건이 로드되었습니다.\n(등록불가: ${invalidCnt}건)`,
          true
        );
      }
    } catch (e: any) {
      // [수정] 에러 발생 시 모달
      openAlertModal(
        "파일 처리 오류",
        e.message || "파일 처리 중 알 수 없는 오류가 발생했습니다.",
        false
      );
    }
    setIsLoading(false);
  };

  // const onDragOverNice = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragOverNice(true);
  // };
  // const onDropNice = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragOverNice(false);
  //   if (e.dataTransfer.files.length > 0) {
  //     handleFileUpload(e.dataTransfer.files[0], "nice");
  //   }
  // };

  // const onDragOverS1 = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragOverS1(true);
  // };
  // const onDropS1 = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragOverS1(false);
  //   if (e.dataTransfer.files.length > 0) {
  //     handleFileUpload(e.dataTransfer.files[0], "s1");
  //   }
  // };

  // 서버 전송 핸들러 (등록 클릭 시)
  const handleSubmit = async () => {
    // 확인 모달부터 닫기
    setIsConfirmModalOpen(false);

    // [시작] 스피너 켜기 (화면 잠금)
    setIsLoading(true);

    // 1. 데이터 빈 값 체크
    if (niceParkData.length === 0 && s1Data.length === 0) {
      alert("업로드할 데이터가 없습니다.");
      return;
    }

    // 2. 토큰 체크
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return; // 혹은 로그인 페이지로 리다이렉트
    }

    // 결과 메시지를 담을 변수
    const resultMessages: string[] = [];

    try {
      if (niceParkData.length > 0) {
        // 1. 프론트엔드에서 미리 계산 (전체 - 에러 = 저장될 개수)
        const total = niceParkData.length;
        const invalid = niceParkData.filter((row) => row.isInvalid).length;
        const success = total - invalid;

        const res = await axios.post(
          `${BASE_URL}/admin/excel/upload/nicepark`,
          niceParkData,
          {
            params: { year: selectedYear, month: selectedMonth },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // (3) 결과 메시지 직접 조립 (백엔드 응답 무시)
        let msg = `[나이스파크] 총 ${total}건 중 ${success}건 저장 완료`;
        if (invalid > 0) {
          msg += `\n(기준정보 미등록 ${invalid}건 제외)`;
        }
        // 백엔드에서 온 "임직원 제외" 추가
        if (res.data.startsWith("EXCLUDED:")) {
          const s1Cars = res.data.replace("EXCLUDED:", "");
          msg += `\n(임직원 차량 추가 제외: ${s1Cars})`;
        }

        resultMessages.push(msg);
      }

      if (s1Data.length > 0) {
        // (1) 프론트엔드에서 개수 계산
        const total = s1Data.length;
        const invalid = s1Data.filter((row) => row.isInvalid).length;
        const success = total - invalid;

        await axios.post(`${BASE_URL}/admin/excel/upload/s1`, s1Data, {
          params: {
            year: selectedYear,
            month: selectedMonth,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // (3) 결과 메시지 직접 조립
        let msg = `[에스원] 총 ${total}건 중 ${success}건 저장 완료`;
        if (invalid > 0) {
          msg += `\n(기준정보 미등록 ${invalid}건 제외)`;
        }
        resultMessages.push(msg);
      }

      //alert("데이터가 성공적으로 등록되었습니다!");

      console.log("백엔드 응답 데이터:", resultMessages);

      setAlertState({
        title: "업로드 결과 확인",
        message: resultMessages.join("\n\n"),
        isSuccess: true,
      });

      setModalOpen(true);

      // 성공 후 초기화
      setNiceParkData([]);
      setS1Data([]);

      // 기존 setIsDataExisting(true); 삭제하고 아래 코드로 대체
      // 방금 업로드를 성공했으니, 해당 데이터가 DB에 존재한다고 상태 업데이트
      if (niceParkData.length > 0) setIsNiceDataExisting(true);
      if (s1Data.length > 0) setIsS1DataExisting(true);
    } catch (error: any) {
      console.error("업로드 실패:", error);

      // Axios 에러 처리
      let errorMessage = "데이터 업로드 중 오류가 발생했습니다.";

      if (error.response) {
        // 서버가 에러 응답(4xx, 5xx)을 준 경우
        errorMessage =
          error.response.data?.message ||
          `서버 오류 (${error.response.status})`;
      } else if (error.request) {
        // 요청은 갔으나 응답이 없는 경우
        errorMessage = "서버와 통신할 수 없습니다.";
      }

      setAlertState({
        title: "업로드 실패",
        message: errorMessage,
        isSuccess: false,
      });
      setModalOpen(true);
    } finally {
      // [끝] 성공하든 실패하든 무조건 스피너 끄기
      setIsLoading(false);
    }
  };

  // 2. [나이스파크] 필터링 로직 (차량번호 검색)
  // niceData는 현재 나이스파크 테이블에 뿌려주고 있는 원본 데이터 배열 변수명입니다.
  const filteredNiceData = niceParkData.filter((row: any) => {
    if (!niceSearchTerm) return true; // 검색어 없으면 다 보여줌
    const lowerTerm = niceSearchTerm.toLowerCase();
    // 안전하게 옵셔널 체이닝(?.) 사용
    return row.carNumber?.toLowerCase().includes(lowerTerm);
  });

  // 3. [에스원] 필터링 로직 (이름 or 사번 검색)
  // s1Data는 현재 에스원 테이블에 뿌려주고 있는 원본 데이터 배열 변수명입니다.
  const filteredS1Data = s1Data.filter((row: any) => {
    if (!s1SearchTerm) return true;
    const lowerTerm = s1SearchTerm.toLowerCase();

    // 이름 검색 (변수명 driverName 확인 필요)
    const nameMatch = row.employeeName?.toLowerCase().includes(lowerTerm);
    // 사번 검색 (변수명 driverId 확인 필요)
    const idMatch = row.memberId?.toString().toLowerCase().includes(lowerTerm);

    return nameMatch || idMatch;
  });

  // [추가] 렌더링 직전에 '등록 불가 데이터'만 싹 긁어모으기
  const invalidNiceRows = niceParkData.filter((row) => row.isInvalid);
  const invalidS1Rows = s1Data.filter((row) => row.isInvalid);
  const totalInvalidCount = invalidNiceRows.length + invalidS1Rows.length;

  return (
    <div className="p-8 font-sans bg-white">
      {/*로딩 중일 때 화면 전체 덮어버림 */}
      {isLoading && <LoadingSpinner />}

      {/* Header */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          출입 데이터 업로드
        </h2>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-2">
          <div className="flex flex-col">
            <span className="mb-1 text-xs font-semibold text-gray-600">
              연도 선택
            </span>
            <select
              className="px-2 border border-gray-300 rounded-md w-28 h-9 bg-gray-50"
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
            <span className="mb-1 text-xs font-semibold text-gray-600">
              월 선택
            </span>
            <select
              className="px-2 border border-gray-300 rounded-md w-28 h-9 bg-gray-50"
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
          <div className="flex flex-col gap-2">
            {/* 1. 나이스파크 데이터 중복 경고 (파란색) */}
            {niceParkData.length > 0 && isNiceDataExisting && (
              <div className="flex items-center gap-2 p-3 mt-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                <AlertCircle size={20} />
                <span>
                  {selectedMonth === "0"
                    ? `[주의] ${selectedYear}년도의 기존 '나이스파크' 데이터가 모두 삭제되고 덮어씌워집니다!`
                    : `[알림] ${selectedYear}년 ${selectedMonth}월 '나이스파크' 데이터가 이미 존재합니다. 업로드 시 덮어씁니다.`}
                </span>
              </div>
            )}

            {/* 2. 에스원 데이터 중복 경고 (주황색) */}
            {s1Data.length > 0 && isS1DataExisting && (
              <div className="flex items-center gap-2 p-3 mt-2 text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded">
                <AlertCircle size={20} />
                <span>
                  {selectedMonth === "0"
                    ? `[주의] ${selectedYear}년도의 기존 '에스원' 데이터가 모두 삭제되고 덮어씌워집니다!`
                    : `[알림] ${selectedYear}년 ${selectedMonth}월 '에스원' 데이터가 이미 존재합니다. 업로드 시 덮어씁니다.`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex gap-8 mt-4">
        {/* LEFT - NicePark */}
        <div className="flex flex-col flex-1">
          <h3 className="mb-3 text-sm font-bold text-gray-600">
            나이스파크 출입차량 데이터
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
            <div className="mb-2 text-xs font-semibold text-green-600">
              {niceParkData.length}개 데이터 로드됨
            </div>
          )}

          {/* 나이스파크 헤더 (제목 + 검색창 + 범례) */}
          <div className="flex items-end justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-600">
              나이스파크 출입차량 데이터
            </h4>

            <div className="flex items-center gap-2">
              {/* 검색창 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="차량번호 검색"
                  value={niceSearchTerm}
                  onChange={(e) => setNiceSearchTerm(e.target.value)}
                  className="w-32 py-1 pr-2 text-xs transition-all border border-gray-300 rounded pl-7 focus:outline-none focus:border-blue-500"
                />
                <Search
                  className="absolute left-2 top-1.5 text-gray-400"
                  size={12}
                />
                {niceSearchTerm && (
                  <button
                    onClick={() => setNiceSearchTerm("")}
                    className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 범례 */}
              <div className="flex items-center gap-1 ml-2 text-xs">
                <span className="w-3 h-3 border border-red-200 rounded-sm bg-red-50"></span>
                <span className="text-gray-400 text-[10px]">
                  : 기준정보 미등록 (저장 불가)
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto border border-gray-200 rounded-md h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    차량번호
                  </th>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    입차일자
                  </th>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    입차시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {niceParkData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400">
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  filteredNiceData.map((row, i) => (
                    <tr
                      key={i}
                      className={`
                        border-t border-gray-100 
                        ${
                          row.isInvalid
                            ? "bg-red-50 hover:bg-red-100 text-red-800"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
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
        <div className="flex flex-col flex-1">
          <h3 className="mb-3 text-sm font-bold text-gray-600">
            에스원 출퇴근 데이터
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
            <div className="mb-2 text-xs font-semibold text-green-600">
              {s1Data.length}개 데이터 로드됨
            </div>
          )}

          {/* 에스원 헤더 (제목 + 검색창 + 범례) */}
          <div className="flex items-end justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-600">
              에스원 출퇴근 데이터
            </h4>

            <div className="flex items-center gap-2">
              {/* 검색창 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름/사번 검색"
                  value={s1SearchTerm}
                  onChange={(e) => setS1SearchTerm(e.target.value)}
                  className="w-32 py-1 pr-2 text-xs transition-all border border-gray-300 rounded pl-7 focus:outline-none focus:border-blue-500"
                />
                <Search
                  className="absolute left-2 top-1.5 text-gray-400"
                  size={12}
                />
                {s1SearchTerm && (
                  <button
                    onClick={() => setS1SearchTerm("")}
                    className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 범례 */}
              <div className="flex items-center gap-1 ml-2 text-xs">
                <span className="w-3 h-3 border border-red-200 rounded-sm bg-red-50"></span>
                <span className="text-gray-400 text-[10px]">
                  : 기준정보 미등록(저장 불가)
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto border border-gray-200 rounded-md h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    사원번호
                  </th>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    사원명
                  </th>
                  <th className="p-2 font-semibold text-left text-gray-700">
                    근무일자
                  </th>
                </tr>
              </thead>
              <tbody>
                {s1Data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400">
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  filteredS1Data.map((row, i) => (
                    <tr
                      key={i}
                      className={`
                        border-t border-gray-100 
                        ${
                          row.isInvalid
                            ? "bg-red-50 hover:bg-red-100 text-red-800"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      <td className="p-2 text-gray-800">{row.memberId}</td>
                      <td className="p-2 text-gray-800">{row.employeeName}</td>
                      <td className="p-2 text-gray-800">{row.accessDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 mt-8 border-t border-gray-200">
        <button
          className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
          onClick={handleCheckBeforeUpload}
        >
          <Save size={18} /> 등록 ({niceParkData.length + s1Data.length})
        </button>
      </div>

      {/* 1. [등록 확인용] 새로 만든 ConfirmModal 사용 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSubmit}
        title="등록 확인"
        message={confirmMessage}
        isWarning={confirmMessage.includes("오류")}
        size={totalInvalidCount > 0 ? "lg" : "sm"}
      >
        {/* 등록 제외 데이터가 하나라도 있을 때만 표시 */}
        {totalInvalidCount > 0 && (
          <div className="p-3 mt-4 text-left border rounded-lg bg-red-50">
            <h4 className="flex items-center gap-2 mb-3 text-sm font-bold text-red-600">
              등록 제외 리스트 ({totalInvalidCount}건)
              <span className="text-xs font-normal text-gray-500">
                (기준정보 미등록 데이터)
              </span>
            </h4>

            <div className="space-y-4">
              {/* ================= 나이스파크 ================= */}
              {invalidNiceRows.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <h5 className="mb-2 text-sm font-bold text-red-600">
                    나이스파크 등록 제외 차량 ({invalidNiceRows.length}건)
                  </h5>

                  <div className="overflow-y-auto border border-red-200 rounded max-h-48">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-red-100">
                        <tr>
                          <th className="p-2 text-left">차량번호</th>
                          <th className="p-2 text-left">입차일시</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invalidNiceRows.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2 font-bold">{row.carNumber}</td>
                            <td className="p-2">
                              {row.accessDate} {row.accessTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= 에스원 ================= */}
              {invalidS1Rows.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <h5 className="mb-2 text-sm font-bold text-red-600">
                    에스원 등록 제외 이력 ({invalidS1Rows.length}건)
                  </h5>

                  <div className="overflow-y-auto border border-red-200 rounded max-h-48">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-red-100">
                        <tr>
                          <th className="p-2 text-left">사원번호</th>
                          <th className="p-2 text-left">출입일자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invalidS1Rows.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2 font-bold">{row.memberId}</td>
                            <td className="p-2">{row.accessDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ConfirmModal>

      <Modal
        isOpen={ModalOpen}
        onClose={() => setModalOpen(false)}
        title={alertState.title}
        message={alertState.message}
        isSuccess={alertState.isSuccess}
      />
    </div>
  );
};

export default DataUploadPage;
