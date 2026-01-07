import React from "react";
import ReactDOM from "react-dom";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // 확인 버튼 클릭 시 실행할 함수
  message: string;
  title: string;
  isWarning?: boolean; // 에러/경고 상황인지 여부 (선택사항)
  children?: React.ReactNode; // 추가
  size?: "sm" | "lg"; // 리스트 뜰 때 창 좀 넓게 쓰려면
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title,
  isWarning = false,
  children,
  size = "sm",
}) => {
  if (!isOpen) return null;

  const Icon = isWarning ? AlertTriangle : CheckCircle;
  const iconColor = isWarning ? "text-red-500" : "text-blue-500";

  // 반응형 너비 클래스 (모바일/태블릿/데스크톱 대응)
  const maxWidthClass =
    size === "lg"
      ? "max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
      : "max-w-[95vw] sm:max-w-sm md:max-w-md";

  const modalContent = (
    // 배경 (Overlay)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* 모달 박스 - 반응형 너비 및 패딩 */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} transform transition-all duration-300 scale-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]`}
        style={{ padding: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        {/* 헤더 - 반응형 폰트 크기 */}
        <div className="flex justify-between items-start border-b shrink-0 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 본문 영역 - 스크롤 가능 */}
        <div className="flex flex-col items-center text-center overflow-y-auto flex-1">
          <Icon
            size={36}
            className={`sm:w-12 sm:h-12 mb-3 sm:mb-4 ${iconColor} shrink-0`}
          />

          <p className="text-gray-700 font-semibold mb-4 sm:mb-6 whitespace-pre-wrap text-xs sm:text-sm md:text-base leading-relaxed">
            {message}
          </p>

          {/* children 영역 - 반응형 처리 */}
          {children && (
            <div className="w-full text-left mb-4 sm:mb-6">{children}</div>
          )}
        </div>

        {/* 버튼 영역 - 반응형 간격 및 패딩 */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 shrink-0 mt-auto pt-2">
          <button
            onClick={onClose}
            className="flex-1 font-bold text-sm sm:text-base text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors py-2 sm:py-2.5 px-4"
          >
            취소
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 font-bold text-sm sm:text-base text-white rounded-lg transition-colors py-2 sm:py-2.5 px-4
              ${
                isWarning
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;
