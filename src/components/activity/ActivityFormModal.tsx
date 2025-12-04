import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { type ReductionActivity } from '../../types/activity';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: ReductionActivity | null;
  onSave: (data: ReductionActivity) => void;
}

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen, onClose, mode, initialData, onSave
}) => {
  const [formData, setFormData] = useState<ReductionActivity>({
    id: 0, startDate: '', endDate: '', title: '', content: '', cost: 0, effect: '', imageUrl: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData(initialData);
        setPreview(initialData.imageUrl || null);
      } else {
        setFormData({
          id: Date.now(),
          startDate: '',
          endDate: '',
          title: '',
          content: '',
          cost: 0,
          effect: '',
          imageUrl: ''
        });
        setPreview(null);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.startDate) newErrors.startDate = '시작일을 입력하세요';
    if (!formData.endDate) newErrors.endDate = '종료일을 입력하세요';

    // 날짜 유효성 검사
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.dateRange = '시작일은 종료일보다 늦을 수 없습니다';
      }
    }

    if (!formData.title.trim()) newErrors.title = '활동명을 입력하세요';
    if (!formData.content.trim()) newErrors.content = '활동 내역을 입력하세요';
    if (formData.cost <= 0) newErrors.cost = '소요금액은 0보다 커야 합니다';
    // if (!formData.effect.trim()) newErrors.effect = '기대효과를 입력하세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto p-8 relative">
        
        {/* 헤더 */}
        <div className="mb-5 border-b border-gray-200 pb-4 relative">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? '활동 등록' : mode === 'edit' ? '활동 수정' : '활동 상세 정보'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'create' ? '새로운 저감활동을 등록하세요' : '등록된 활동 내역을 확인합니다'}
          </p>
          <button onClick={onClose} className="absolute top-4 right-4">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="flex flex-col gap-5">
          {/* 활동 기간 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">활동기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date" name="startDate" value={formData.startDate}
                onChange={handleChange} disabled={isReadOnly}
                className={`flex-1 px-3 py-2 rounded border text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
              />
              <span>~</span>
              <input
                type="date" name="endDate" value={formData.endDate}
                onChange={handleChange} disabled={isReadOnly}
                className={`flex-1 px-3 py-2 rounded border text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
              />
            </div>
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            {errors.dateRange && <p className="text-red-500 text-xs mt-1">{errors.dateRange}</p>}
          </div>

          {/* 활동명 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">활동명</label>
            <input
              type="text" name="title" value={formData.title}
              onChange={handleChange} disabled={isReadOnly}
              placeholder="활동명을 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* 활동내역 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">활동내역</label>
            <textarea
              name="content" value={formData.content}
              onChange={handleChange} disabled={isReadOnly}
              placeholder="활동 내역을 상세히 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm h-24 resize-none ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          {/* 소요금액 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">소요금액 (원)</label>
            <input
              type="number" name="cost" value={formData.cost}
              onChange={handleChange} disabled={isReadOnly}
              placeholder="소요된 금액을 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
            />
            {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
          </div>

          {/* 기대효과 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">기대효과</label>
            <input
              type="text" name="effect" value={formData.effect}
              onChange={handleChange} disabled={isReadOnly}
              placeholder="기대되는 효과를 입력하세요"
              className={`w-full px-3 py-2 rounded border text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
            />
            {errors.effect && <p className="text-red-500 text-xs mt-1">{errors.effect}</p>}
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">사진 업로드</label>
            <div className="flex gap-2 items-center">
              {!isReadOnly && (
                <input
                  type="file"
                  accept="image/*"
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
              <span className="text-sm text-gray-500">{preview ? '파일 선택됨' : '선택된 파일 없음'}</span>
            </div>
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="max-h-40 rounded-md" />
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2 mt-8">
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-green-600 text-white rounded font-bold text-lg hover:bg-green-700"
            >
              {mode === 'create' ? '등록하기' : '수정완료'}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white text-gray-800 border rounded font-bold text-lg hover:bg-gray-50"
          >
            {isReadOnly ? '닫기' : '취소'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFormModal;