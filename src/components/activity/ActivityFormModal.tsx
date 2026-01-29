import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Modal from "../Modal";
import { type ReductionActivity } from "../../types/activity";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  initialData?: ReductionActivity | null;
  onSave: (
    data: ReductionActivity,
    file: File[] | null,
  ) => Promise<void> | void;
}

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<ReductionActivity>({
    id: 0,
    periodStart: "",
    periodEnd: "",
    activityName: "",
    activityDetails: "",
    costAmount: 0,
    expectedEffect: "",
    imageUrl: "",
    imageUrls: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
  }>({ open: false, title: "", message: "", isSuccess: true });

  const displayImages: string[] =
    formData.imageUrls && formData.imageUrls.length > 0
      ? formData.imageUrls
      : formData.imageUrl
        ? [formData.imageUrl]
        : [];

  const viewerImages: string[] = preview.length > 0 ? preview : displayImages;

  const isReadOnly = mode === "view";

  useEffect(() => {
    if (!isOpen) return;

    // 모달 오픈 시 초기화
    if (initialData && (mode === "edit" || mode === "view")) {
      setFormData(initialData);
      // 기존 이미지 미리보기 (상세 조회/수정 시)
      if (initialData.imageUrls?.length) {
        setPreview(initialData.imageUrls);
      } else if (initialData.imageUrl) {
        setPreview([initialData.imageUrl]);
      } else {
        setPreview([]);
      }
    } else {
      setFormData({
        id: 0,
        periodStart: "",
        periodEnd: "",
        activityName: "",
        activityDetails: "",
        costAmount: 0,
        expectedEffect: "",
        imageUrl: "",
        imageUrls: [],
      });
      setPreview([]);
    }
    setImageFiles([]);
    setImageViewerOpen(false);
    setCurrentImageIndex(0);
    setZoomLevel(1);
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (!isOpen) return;

    // ESC 키: 뷰어 우선 닫기, 없으면 상세 모달 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (imageViewerOpen) {
          e.preventDefault();
          setImageViewerOpen(false);
          return;
        }
        if (isReadOnly) {
          e.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, imageViewerOpen, isReadOnly, onClose]);

  if (!isOpen) return null;

  const handleImageClick = (index: number) => {
    if (viewerImages.length === 0) return;
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setImageViewerOpen(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : viewerImages.length - 1,
    );
    setZoomLevel(1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < viewerImages.length - 1 ? prev + 1 : 0,
    );
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length == 0) return;

    setImageFiles(files);

    // 이미지 미리보기 생성
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then((urls) => setPreview(urls));

    e.target.value = "";
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.periodStart) newErrors.periodStart = "시작일을 입력하세요";
    if (!formData.periodEnd) newErrors.periodEnd = "종료일을 입력하세요";

    // 날짜 유효성 검사
    if (formData.periodStart && formData.periodEnd) {
      const start = new Date(formData.periodStart);
      const end = new Date(formData.periodEnd);
      if (start > end) {
        newErrors.dateRange = "시작일은 종료일보다 늦을 수 없습니다";
      }
    }

    if (!formData.activityName.trim())
      newErrors.activityName = "활동명을 입력하세요";
    if (!formData.activityDetails.trim())
      newErrors.activityDetails = "활동 내역을 입력하세요";
    if (formData.costAmount <= 0)
      newErrors.costAmount = "소요금액은 0보다 커야 합니다";
    // if (!formData.expectedEffect.trim()) newErrors.expectedEffect = '기대효과를 입력하세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData, imageFiles.length > 0 ? imageFiles : null);
      onClose();
    } catch (error) {
      console.error("Activity save error", error);
      setNotice({
        open: true,
        title: "저장 실패",
        message: "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        isSuccess: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-1000">
      <div
        className="bg-white rounded-lg max-h-[90vh] overflow-y-auto relative"
        style={{ width: "37.5rem", padding: "var(--padding-card)" }}
      >
        {/* 헤더 */}
        <div
          className="border-b border-gray-200 relative"
          style={{
            marginBottom: "var(--spacing-lg)",
            paddingBottom: "var(--spacing-md)",
          }}
        >
          <h2 className="text-xl font-bold">
            {mode === "create"
              ? "활동 등록"
              : mode === "edit"
                ? "활동 수정"
                : "활동 상세 정보"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === "create"
              ? "새로운 저감활동을 등록하세요"
              : "등록된 활동 내역을 확인합니다"}
          </p>
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4"
          >
            <X size={24} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="flex flex-col" style={{ gap: "var(--spacing-lg)" }}>
          {/* 활동 기간 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              활동기간
            </label>
            <div
              className="flex items-center"
              style={{ gap: "var(--spacing-sm)" }}
            >
              <input
                type="date"
                name="periodStart"
                value={formData.periodStart}
                onChange={handleChange}
                disabled={isReadOnly}
                className={`flex-1 rounded border text-sm ${
                  isReadOnly ? "bg-gray-100" : "bg-white"
                }`}
                style={{ padding: "var(--padding-input-sm)" }}
              />
              <span>~</span>
              <input
                type="date"
                name="periodEnd"
                value={formData.periodEnd}
                onChange={handleChange}
                disabled={isReadOnly}
                className={`flex-1 rounded border text-sm ${
                  isReadOnly ? "bg-gray-100" : "bg-white"
                }`}
                style={{ padding: "var(--padding-input-sm)" }}
              />
            </div>
            {errors.periodStart && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.periodStart}
              </p>
            )}
            {errors.periodEnd && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.periodEnd}
              </p>
            )}
            {errors.dateRange && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.dateRange}
              </p>
            )}
          </div>

          {/* 활동명 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              활동명
            </label>
            <input
              type="text"
              name="activityName"
              value={formData.activityName}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="활동명을 입력하세요"
              className={`w-full rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
              style={{ padding: "var(--padding-input-sm)" }}
            />
            {errors.activityName && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.activityName}
              </p>
            )}
          </div>

          {/* 활동내역 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              활동내역
            </label>
            <textarea
              name="activityDetails"
              value={formData.activityDetails}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="활동 내역을 상세히 입력하세요"
              className={`w-full rounded border text-sm resize-none ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
              style={{ padding: "var(--padding-input-sm)", height: "6rem" }}
            />
            {errors.activityDetails && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.activityDetails}
              </p>
            )}
          </div>

          {/* 소요금액 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              소요금액 (원)
            </label>
            <input
              type="number"
              name="costAmount"
              value={formData.costAmount}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="소요된 금액을 입력하세요"
              className={`w-full rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
              style={{ padding: "var(--padding-input-sm)" }}
            />
            {errors.costAmount && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.costAmount}
              </p>
            )}
          </div>

          {/* 기대효과 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              기대효과
            </label>
            <input
              type="text"
              name="expectedEffect"
              value={formData.expectedEffect}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="기대되는 효과를 입력하세요"
              className={`w-full rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
              style={{ padding: "var(--padding-input-sm)" }}
            />
            {errors.expectedEffect && (
              <p
                className="text-red-500 text-xs"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                {errors.expectedEffect}
              </p>
            )}
          </div>

          {/* 사진 업로드 */}
          <div>
            <label
              className="block text-sm font-bold text-gray-800"
              style={{ marginBottom: "var(--spacing-sm)" }}
            >
              사진 업로드
            </label>
            <div
              className="flex items-center"
              style={{ gap: "var(--spacing-sm)" }}
            >
              {!isReadOnly && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
              )}
              {!isReadOnly && (
                <label
                  htmlFor="fileInput"
                  className="border rounded bg-white cursor-pointer flex items-center font-bold text-sm hover:bg-gray-50"
                  style={{
                    padding: "var(--padding-btn)",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <Upload size={16} /> 선택
                </label>
              )}
              {!isReadOnly && (
                <span className="text-sm text-gray-500">
                  {/* {preview ? "파일 선택됨" : "선택된 파일 없음"} */}
                  {imageFiles.length > 0
                    ? `${imageFiles.length}개 파일 선택됨`
                    : "선택된 파일 없음"}
                </span>
              )}
            </div>
            {imageFiles.length > 0 && (
              <ul
                className="text-sm text-gray-700 list-disc list-inside"
                style={{ marginTop: "var(--spacing-md)" }}
              >
                {imageFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>
                    {file.name}
                    <span
                      className="text-gray-400"
                      style={{ marginLeft: "var(--spacing-sm)" }}
                    >
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {preview.length > 0 && (
              <div style={{ marginTop: "var(--spacing-md)" }}>
                <p
                  className="text-xs text-gray-500"
                  style={{ marginBottom: "var(--spacing-sm)" }}
                >
                  업로드 미리보기
                </p>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: "var(--spacing-md)" }}
                >
                  {preview.map((url, idx) => (
                    <img
                      key={`preview-${idx}`}
                      src={`/api${url}`}
                      alt={`preview-${idx}`}
                      onClick={() => handleImageClick(idx)}
                      className="w-full object-contain rounded border bg-white cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{ height: "10rem" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div
          className="flex"
          style={{ gap: "var(--spacing-sm)", marginTop: "2rem" }}
        >
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-green-600 text-white rounded font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: "0.75rem" }}
            >
              {isSubmitting
                ? "저장 중..."
                : mode === "create"
                  ? "등록하기"
                  : "수정완료"}
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 bg-white text-gray-800 border rounded font-bold text-lg hover:bg-gray-100"
            style={{ padding: "0.75rem" }}
          >
            {isReadOnly ? "닫기" : "취소"}
          </button>
        </div>
      </div>

      {/* 이미지 뷰어 모달 */}
      {imageViewerOpen && viewerImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-2000"
          onClick={() => setImageViewerOpen(false)}
        >
          <button
            onClick={() => setImageViewerOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          {/* 이전/다음 버튼 */}
          {viewerImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight size={48} />
              </button>
            </>
          )}

          {/* 확대/축소 버튼 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 px-4 py-2 rounded-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="text-white hover:text-gray-300"
            >
              <ZoomOut size={24} />
            </button>
            <span className="text-white">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="text-white hover:text-gray-300"
            >
              <ZoomIn size={24} />
            </button>
          </div>

          {/* 이미지 컨테이너 */}
          <div
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/api${viewerImages[currentImageIndex]}`}
              alt={`activity-${currentImageIndex}`}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.2s ease",
              }}
              className="max-w-full h-auto"
            />
          </div>

          {/* 이미지 번호 표시 */}
          {viewerImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {viewerImages.length}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={notice.open}
        onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
        isSuccess={notice.isSuccess}
        title={notice.title}
        message={notice.message}
      />
    </div>
  );
};

export default ActivityFormModal;
