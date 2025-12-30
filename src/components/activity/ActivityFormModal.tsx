import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import Modal from "../Modal";
import { type ReductionActivity } from "../../types/activity";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  initialData?: ReductionActivity | null;
  onSave: (data: ReductionActivity, file: File[] | null) => Promise<void> | void;
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
  // const [preview, setPreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
  }>({ open: false, title: "", message: "", isSuccess: true });

  const displayImages =
    formData.imageUrls?.length > 0
      ? formData.imageUrls
      : formData.imageUrl
      ? [formData.imageUrl]
      : [];

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === "edit" || mode === "view")) {
        setFormData(initialData);
        // setPreview(initialData.imageUrl || null);
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
        // setPreview(null);
      }
      setImageFiles([]);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;
  const isReadOnly = mode === "view";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length == 0) return;

    setImageFiles(files);

    e.target.value = "";

    // if (e.target.files && e.target.files[0]) {
    //   const file = e.target.files[0];

    //   if (!file) return;
    //   setImageFile(file);

    //   //미리보기
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     setPreview(reader.result as string);
    //     setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    //   };
    //   reader.readAsDataURL(file);
    // }
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto p-8 relative">
        {/* 헤더 */}
        <div className="mb-5 border-b border-gray-200 pb-4 relative">
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
        <div className="flex flex-col gap-5">
          {/* 활동 기간 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              활동기간
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                name="periodStart"
                value={formData.periodStart}
                onChange={handleChange}
                disabled={isReadOnly}
                className={`flex-1 px-3 py-2 rounded border text-sm ${
                  isReadOnly ? "bg-gray-100" : "bg-white"
                }`}
              />
              <span>~</span>
              <input
                type="date"
                name="periodEnd"
                value={formData.periodEnd}
                onChange={handleChange}
                disabled={isReadOnly}
                className={`flex-1 px-3 py-2 rounded border text-sm ${
                  isReadOnly ? "bg-gray-100" : "bg-white"
                }`}
              />
            </div>
            {errors.periodStart && (
              <p className="text-red-500 text-xs mt-1">{errors.periodStart}</p>
            )}
            {errors.periodEnd && (
              <p className="text-red-500 text-xs mt-1">{errors.periodEnd}</p>
            )}
            {errors.dateRange && (
              <p className="text-red-500 text-xs mt-1">{errors.dateRange}</p>
            )}
          </div>

          {/* 활동명 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              활동명
            </label>
            <input
              type="text"
              name="activityName"
              value={formData.activityName}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="활동명을 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
            />
            {errors.activityName && (
              <p className="text-red-500 text-xs mt-1">{errors.activityName}</p>
            )}
          </div>

          {/* 활동내역 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              활동내역
            </label>
            <textarea
              name="activityDetails"
              value={formData.activityDetails}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="활동 내역을 상세히 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm h-24 resize-none ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
            />
            {errors.activityDetails && (
              <p className="text-red-500 text-xs mt-1">
                {errors.activityDetails}
              </p>
            )}
          </div>

          {/* 소요금액 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              소요금액 (원)
            </label>
            <input
              type="number"
              name="costAmount"
              value={formData.costAmount}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="소요된 금액을 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
            />
            {errors.costAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.costAmount}</p>
            )}
          </div>

          {/* 기대효과 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              기대효과
            </label>
            <input
              type="text"
              name="expectedEffect"
              value={formData.expectedEffect}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="기대되는 효과를 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${
                isReadOnly ? "bg-gray-100" : "bg-white"
              }`}
            />
            {errors.expectedEffect && (
              <p className="text-red-500 text-xs mt-1">
                {errors.expectedEffect}
              </p>
            )}
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              사진 업로드
            </label>
            <div className="flex gap-2 items-center">
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
                  className="px-4 py-2 border rounded bg-white cursor-pointer flex items-center gap-2 font-bold text-sm hover:bg-gray-50"
                >
                  <Upload size={16} /> 선택
                </label>
              )}
              <span className="text-sm text-gray-500">
                {/* {preview ? "파일 선택됨" : "선택된 파일 없음"} */}
                {imageFiles.length > 0
                  ? `${imageFiles.length}개 파일 선택됨`
                  : "선택된 파일 없음"}
              </span>
            </div>
            {imageFiles.length > 0 && (
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                {imageFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>
                    {file.name}
                    <span className="ml-2 text-gray-400">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {displayImages.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">등록된 이미지</p>
                <div className="max-h-80 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayImages.map((url, idx) => (
                      <img
                        key={`${url}-${idx}`}
                        src={url}
                        alt={`activity-${idx}`}
                        loading="lazy"
                        className="w-full h-52 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-40 rounded-md"
                />
              </div>
            )} */}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2 mt-8">
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cursor-pointer flex-1 py-3 bg-green-600 text-white rounded font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="cursor-pointer flex-1 py-3 bg-white text-gray-800 border rounded font-bold text-lg hover:bg-gray-100"
          >
            {isReadOnly ? "닫기" : "취소"}
          </button>
        </div>
      </div>

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
