import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  isSuccess: boolean;
  title: string;
}

/**
 * 사용자 정의 알림 메시지 모달 컴포넌트
 * @param isOpen 모달 표시 여부
 * @param onClose 모달 닫기 핸들러
 * @param message 모달 본문 메시지
 * @param isSuccess 성공/실패 여부 (아이콘 및 색상 결정)
 * @param title 모달 상단 타이틀
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message, isSuccess, title }) => {
  if (!isOpen) return null;

  // 성공/실패에 따른 스타일 및 아이콘 설정
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    // 배경 오버레이
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
      
      {/* 모달 본체 */}
      <div className="bg-white ml-[300px] rounded-lg shadow-xl p-6 w-11/12 max-w-sm transform transition-all duration-300 scale-100">
        
        {/* 헤더 및 닫기 버튼 */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex flex-col items-center text-center">
          <Icon size={48} className={`mb-4 ${iconColor}`} />
          
          <p className="text-gray-700 font-semibold mb-6 whitespace-pre-line">
            {/* 메시지에 포함된 줄바꿈 문자(\n)를 HTML에서 적용 */}
            {message}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 font-bold text-white rounded-lg transition-colors 
              ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`
            }
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;