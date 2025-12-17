// components/ConfirmModal.tsx
import React from "react";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // 👈 확인 버튼 클릭 시 실행할 함수
  message: string;
  title: string;
  isWarning?: boolean; // 👈 에러/경고 상황인지 여부 (선택사항)
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title,
  isWarning = false, // 기본값은 false
}) => {
  if (!isOpen) return null;

  // 경고(오류)가 있으면 주황색/빨간색, 일반적인 확인이면 파란색/초록색 등
  const Icon = isWarning ? AlertTriangle : CheckCircle;
  const iconColor = isWarning ? "text-red-500" : "text-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white ml-[300px] rounded-lg shadow-xl p-6 w-11/12 max-w-sm transform transition-all duration-300 scale-100">
        {/* 헤더 */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 메시지 */}
        <div className="flex flex-col items-center text-center">
          <Icon size={48} className={`mb-4 ${iconColor}`} />
          <p className="text-gray-700 font-semibold mb-6 whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* 버튼 영역 (취소 / 확인) */}
        <div className="flex justify-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            취소
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 font-bold text-white rounded-lg transition-colors 
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
};

export default ConfirmModal;
