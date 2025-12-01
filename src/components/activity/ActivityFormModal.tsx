import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
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
  // 폼 상태
  const [formData, setFormData] = useState<ReductionActivity>({
    id: 0, startDate: '', endDate: '', title: '', content: '', cost: 0, effect: '', imageUrl: ''
  });

  // 모달 열릴 때 초기 데이터 세팅
  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData(initialData);
      } else {
        // 등록 모드면 초기화
        setFormData({ id: Date.now(), startDate: '', endDate: '', title: '', content: '', cost: 0, effect: '', imageUrl: '' });
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

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  // --- 스타일 ---
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#333' };
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', 
    backgroundColor: isReadOnly ? '#f5f5f5' : '#fff', fontSize: '14px', boxSizing: 'border-box' as const
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
        
        {/* 헤더 */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {mode === 'create' ? '활동 등록' : mode === 'edit' ? '활동 수정' : '활동 상세 정보'}
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
            {mode === 'create' ? '새로운 저감활동을 등록하세요' : '등록된 활동 내역을 확인합니다'}
          </p>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#666" />
          </button>
        </div>

        {/* 폼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. 활동 기간 */}
          <div>
            <label style={labelStyle}>활동기간</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="date" name="startDate" value={formData.startDate} onChange={handleChange} disabled={isReadOnly}
                  style={inputStyle} 
                />
              </div>
              <span>~</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={isReadOnly}
                  style={inputStyle} 
                />
              </div>
            </div>
          </div>

          {/* 2. 활동명 */}
          <div>
            <label style={labelStyle}>활동명</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange} disabled={isReadOnly}
              placeholder="활동명을 입력하세요" style={inputStyle} 
            />
          </div>

          {/* 활동내역 */}
          <div>
            <label style={labelStyle}>활동내역</label>
            <textarea 
              name="content" value={formData.content} onChange={handleChange} disabled={isReadOnly}
              placeholder="활동 내역을 상세히 입력하세요" 
              style={{ ...inputStyle, height: '100px', resize: 'none' }} 
            />
          </div>

          {/* 소요금액 */}
          <div>
            <label style={labelStyle}>소요금액 (원)</label>
            <input 
              type="number" name="cost" value={formData.cost} onChange={handleChange} disabled={isReadOnly}
              placeholder="소요된 금액을 입력하세요" style={inputStyle} 
            />
          </div>

          {/* 기대효과 */}
          <div>
            <label style={labelStyle}>기대효과</label>
            <input 
              type="text" name="effect" value={formData.effect} onChange={handleChange} disabled={isReadOnly}
              placeholder="기대되는 효과를 입력하세요" style={inputStyle} 
            />
          </div>

          {/* 3. 사진 업로드 */}
          <div>
            <label style={labelStyle}>사진 업로드</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" disabled value={formData.imageUrl || '선택된 파일 없음'} 
                style={{ ...inputStyle, flex: 1, backgroundColor: '#f9f9f9', color: '#999' }} 
              />
              {!isReadOnly && (
                <button style={{ padding: '0 20px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                  <Upload size={16} /> 선택
                </button>
              )}
            </div>
            {/* 이미지 미리보기 (조회/수정 시) */}
            {formData.imageUrl && (
                <div style={{ marginTop: '10px' }}>
                    <img src={formData.imageUrl} alt="preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                </div>
            )}
          </div>

        </div>

        {/* 4. 하단 버튼 */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          {!isReadOnly && (
            <button 
              onClick={handleSubmit} 
              style={{ flex: 1, padding: '15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {mode === 'create' ? '등록하기' : '수정완료'}
            </button>
          )}
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: '15px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isReadOnly ? '닫기' : '취소'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ActivityFormModal;