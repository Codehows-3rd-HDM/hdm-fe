import React, { useState, useMemo, useRef, useEffect } from "react";
import { Upload, AlertCircle, Save, X, Search } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import AlertModal from "../../components/Modal";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";

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

  const [isDataExisting, setIsDataExisting] = useState(false);
  const [isDragOverNice, setIsDragOverNice] = useState(false);
  const [isDragOverS1, setIsDragOverS1] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); //확인 모달 열기, 닫기
  const [confirmMessage, setConfirmMessage] = useState(""); // 확인 모달에 띄울 멘트

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    title: "",
    message: "",
    isSuccess: true,
  });

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

  // ✅ [추가] 연도/월 변경 시 데이터 존재 여부 체크 (백엔드 연동)
  useEffect(() => {
    const checkDataExistence = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        // (가정) 백엔드에 요청 보냄
        const res = await axios.get(`${BASE_URL}/admin/excel/check`, {
          params: {
            year: selectedYear,
            month: selectedMonth,
          },
          // 2. 헤더 (토큰)
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 3. 결과 처리 (JSON 변환 필요 없음!)
        // res.data 안에 백엔드가 보낸 { exists: true } 객체가 바로 들어있음
        if (res.data && res.data.exists) {
          setIsDataExisting(true);
        } else {
          setIsDataExisting(false);
        }
      } catch (err) {
        console.error("데이터 확인 중 오류:", err);
      }
    };

    checkDataExistence();
  }, [selectedYear, selectedMonth]); // 연도나 월이 바뀌면 실행됨

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
      const invalidIdxSet = new Set(response.map((data) => data.idx));
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
      const invalidIdxSet = new Set(response.map((data) => data.idx));
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
      alert("업로드할 데이터가 없습니다.");
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

        confirmMsg += `[나이스파크]\n총 ${totalCount}건 (정상: ${successCount}건 / ⚠️오류: ${invalidCount}건)\n`;

        if (invalidCount > 0) hasError = true;
      }

      // --- [에스원 검사] ---
      if (s1Data.length > 0) {
        if (confirmMsg) confirmMsg += "\n"; // 줄바꿈

        // 이미 만들어둔 함수 호출
        const invalidCount = (await checkAndSetS1State(s1Data)) || 0;

        const totalCount = s1Data.length;
        const successCount = totalCount - invalidCount;

        confirmMsg += `[에스원]\n총 ${totalCount}건 (정상: ${successCount}건 / ⚠️오류: ${invalidCount}건)\n`;

        if (invalidCount > 0) hasError = true;
      }

      // 3. 최종 메시지 조합
      confirmMsg += "\n--------------------------\n";
      if (hasError) {
        confirmMsg +=
          "⚠️ 기준 정보 미등록 데이터가 포함되어 있습니다.\n(기준 정보 미등록 데이터는 저장되지 않습니다.)\n\n그래도 진행하시겠습니까?";
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
  const handleFileUpload = (file: File, type: "nice" | "s1") => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("엑셀 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 첫 행을 헤더로 인식해서 JSON 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // [수정] 변수를 미리 선언, if문 밖에서도 살리기
      let mappedData: any[] = [];

      let idxCnt = 1;
      // 타입별 데이터 매핑 (한글->영어)
      if (type === "nice") {
        mappedData = jsonData
          .map((row: any) => ({
            idx: idxCnt++,
            carNumber: row["차량번호"] || row["차량 번호"],
            accessDate: formatDate(row["입차일자"] || row["입차 일자"]),
            accessTime: formatTimeOnly(row["입차시간"] || row["입차 시간"]),
            isInvalid: false,
          }))
          .filter((item) => item.carNumber && item.accessDate); // 빈 데이터 필터링

        // const invalidCnt = await checkAndSetNiceparkState(mappedData);
        // alert(
        //   `[NicePark] ${file.name} 파싱 완료 (${mappedData.length}건) 기준정보 미등록(${invalidCnt}건 업로드 불가)`
        // );
      } else if (type === "s1") {
        mappedData = jsonData
          .map((row: any) => ({
            idx: idxCnt++,
            memberId: row["사원번호"],
            employeeName: row["이름"],
            // ✅ [핵심 3] 여기도 formatDate 씌우기!
            accessDate: formatDate(row["근무일자"]),
            // accessTime: row["출근시간"],
            isInvalid: false,
          }))
          .filter((item) => item.memberId && item.accessDate); // 빈 데이터 필터링
      }

      // ---------------------------------------------------------
      // [추가] 2. 연도/월 일치 여부 검사 (핵심 로직)
      // ---------------------------------------------------------

      if (mappedData.length > 0) {
        const invalidRow = mappedData.find((row) => {
          // row.accessDate는 "YYYY-MM-DD" 형태임 (formatDate 함수 거침)
          if (!row.accessDate) return false;

          const [rowYear, rowMonth] = row.accessDate.split("-"); // ["2025", "07", "29"]

          // 1) 연도 체크
          if (rowYear !== selectedYear) {
            return true; // 불일치 발견!
          }

          // 2) 월 체크 (selectedMonth가 "0"(전체)이 아닐 때만 검사)
          if (selectedMonth !== "0") {
            // rowMonth는 "07", selectedMonth는 "7" 일 수 있으므로 정수로 변환해서 비교
            if (parseInt(rowMonth) !== parseInt(selectedMonth)) {
              return true; // 불일치 발견!
            }
          }
          return false; // 통과
        });

        // 불일치 데이터가 발견되었다면?
        if (invalidRow) {
          const [rowYear, rowMonth] = invalidRow.accessDate.split("-");

          let errorMsg = `🚨 날짜 불일치!\n\n선택하신 날짜: [${selectedYear}년`;
          if (selectedMonth !== "0") errorMsg += ` ${selectedMonth}월`;
          errorMsg += `]\n파일 내 날짜: [${rowYear}년 ${rowMonth}월 데이터 포함]`;

          errorMsg += `\n\n선택한 연도/월과 일치하는 엑셀 파일만 업로드해주세요.`;

          alert(errorMsg);

          // input 초기화 (같은 파일 다시 올릴 수 있게)
          if (type === "nice" && niceFileInputRef.current)
            niceFileInputRef.current.value = "";
          if (type === "s1" && s1FileInputRef.current)
            s1FileInputRef.current.value = "";

          return; // 여기서 함수 즉시 종료 (화면에 데이터 안 보여줌)
        }
      }

      // ---------------------------------------------------------
      // 3. 검증 통과 시 로직 진행 (기존 코드)
      // ---------------------------------------------------------
      if (type === "nice") {
        // 타입 단언 (any -> NiceParkRow[])
        const niceRows = mappedData as NiceParkRow[];

        // [추가] 검색어 초기화
        setNiceSearchTerm("");

        const invalidCnt = await checkAndSetNiceparkState(niceRows);
        alert(
          `[NicePark] ${file.name} 파싱 완료 (${niceRows.length}건)\n(기준정보 미등록: ${invalidCnt}건 업로드 불가)`
        );
      } else if (type === "s1") {
        // 타입 단언 (any -> S1Row[])
        const s1Rows = mappedData as S1Row[];

        // [추가] 검색어 초기화
        setS1SearchTerm("");

        const invalidCnt = await checkAndSetS1State(s1Rows);
        alert(
          `[에스원] ${file.name} 파싱 완료 (${s1Rows.length}건)\n(기준정보 미등록: ${invalidCnt}건 업로드 불가)`
        );
      }
    };
    //     const invalidCnt = await checkAndSetS1State(mappedData);
    //     alert(
    //       `[에스원] ${file.name} 파싱 완료 (${mappedData.length}건) 기준정보 미등록(${invalidCnt}건 업로드 불가)`
    //     );
    //   }
    // };
    reader.readAsArrayBuffer(file);
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

        await axios.post(
          `${BASE_URL}/admin/excel/upload/nicepark`,
          niceParkData, // Body
          {
            params: {
              year: selectedYear,
              month: selectedMonth,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // (3) 결과 메시지 직접 조립 (백엔드 응답 무시)
        let msg = `[나이스파크] ✅총 ${total}건 중 💾${success}건 저장 완료`;
        if (invalid > 0) {
          msg += `\n(⚠️ 기준정보 미등록 🗑️${invalid}건 제외)`;
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
        let msg = `[에스원] ✅총 ${total}건 중 💾${success}건 저장 완료`;
        if (invalid > 0) {
          msg += `\n(⚠️ 기준정보 미등록 🗑️${invalid}건 제외)`;
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

      setAlertModalOpen(true);

      // 성공 후 초기화
      setNiceParkData([]);
      setS1Data([]);

      // ✅ [추가] 업로드 성공했으니 데이터 존재 여부 다시 체크 (경고창 띄우기 위해)
      setIsDataExisting(true);
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
      setAlertModalOpen(true);
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
            <div className="text-xs text-green-600 font-semibold mb-2">
              {niceParkData.length}개 데이터 로드됨
            </div>
          )}

          {/* 🟢 나이스파크 헤더 (제목 + 검색창 + 범례) */}
          <div className="flex justify-between items-end mb-2">
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
                  className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-32 transition-all"
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
              <div className="flex items-center gap-1 text-xs ml-2">
                <span className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></span>
                <span className="text-gray-400 text-[10px]">
                  : 기준정보 미등록 (저장 불가)
                </span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md h-96 overflow-y-auto">
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
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-3">
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
            <div className="text-xs text-green-600 font-semibold mb-2">
              {s1Data.length}개 데이터 로드됨
            </div>
          )}

          {/* 🔵 에스원 헤더 (제목 + 검색창 + 범례) */}
          <div className="flex justify-between items-end mb-2">
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
                  className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-32 transition-all"
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
              <div className="flex items-center gap-1 text-xs ml-2">
                <span className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></span>
                <span className="text-gray-400 text-[10px]">
                  : 기준정보 미등록(저장 불가)
                </span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md h-96 overflow-y-auto">
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
      <div className="flex justify-end mt-8 border-t pt-4 border-gray-200">
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
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
          <div className="mt-4 border rounded-lg bg-red-50 p-3 text-left">
            <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
              ⚠️ 등록 제외 리스트 ({totalInvalidCount}건)
              <span className="text-xs font-normal text-gray-500">
                (기준정보 미등록 데이터)
              </span>
            </h4>

            <div className="space-y-4">
              {/* ================= 나이스파크 ================= */}
              {invalidNiceRows.length > 0 && (
                <div className="border rounded-lg bg-white p-3">
                  <h5 className="text-sm font-bold text-red-600 mb-2">
                    🚗 나이스파크 등록 제외 차량 ({invalidNiceRows.length}건)
                  </h5>

                  <div className="max-h-48 overflow-y-auto border border-red-200 rounded">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-red-100 sticky top-0">
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
                <div className="border rounded-lg bg-white p-3">
                  <h5 className="text-sm font-bold text-red-600 mb-2">
                    🏭 에스원 등록 제외 이력 ({invalidS1Rows.length}건)
                  </h5>

                  <div className="max-h-48 overflow-y-auto border border-red-200 rounded">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-red-100 sticky top-0">
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
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={alertState.title}
        message={alertState.message}
        isSuccess={alertState.isSuccess}
      />
    </div>
  );
};

export default DataUploadPage;
