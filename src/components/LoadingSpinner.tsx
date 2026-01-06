import ReactDOM from "react-dom";

const LoadingSpinner = () => {
  const modalContent = (
    // 1. 전체 화면을 덮는 배경 (z-50으로 제일 위에 띄움, 클릭 방지)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm">
      {/* 2. 뱅글뱅글 도는 원 (Tailwind animate-spin 사용) */}
      <div className="border-4 border-blue-200 border-solid rounded-full animate-spin border-t-blue-600" style={{ width: '4rem', height: '4rem' }}></div>
    </div>
  );
  // 2. createPortal을 사용해 document.body로 날려버립니다.
  // 이제 이 녀석은 HTML 구조상 맨 아래에 위치하게 되어 사이드바 영향을 안 받습니다.
  return ReactDOM.createPortal(modalContent, document.body);
};

export default LoadingSpinner;
