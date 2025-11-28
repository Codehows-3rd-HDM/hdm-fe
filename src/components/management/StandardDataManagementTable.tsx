// src/components/management/StandardDataManagementTable.tsx
import React, { useState, useMemo } from 'react';
import { type ColumnDefinition } from '../../types/data';
import { ArrowUp, ArrowDown, ArrowUpDown, Search, Save, Trash2, X, Edit2, CheckSquare } from 'lucide-react'; 
import ExcelUploadModal from '../common/ExcelUploadModal';

const downloadExcel = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(key => key !== 'isEditing');
    const csvContent = [
        headers.join(','), // 헤더 행
        ...data.map(row => headers.map(header => row[header]).join(',')) // 데이터 행
    ].join('\n');
    
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

interface StandardDataManagementTableProps<T> {
  title: string;
  columns: ColumnDefinition<T>[];
  initialData: T[];
  apiEndpoint: string;
}

const StandardDataManagementTable = <T extends { id: number, [key: string]: any }>({ 
  title, 
  columns, 
  initialData, 
  apiEndpoint 
}: StandardDataManagementTableProps<T>) => {
  
  // --- 상태 관리 ---
  const [data, setData] = useState<T[]>(initialData);
  const [currentSort, setCurrentSort] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<'all' | keyof T>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBatchEditing, setIsBatchEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // --- 정렬 및 필터링 로직 개선 ---
  const searchableColumns = useMemo(() => 
    columns.filter(col => col.searchable && col.id !== 'actions').map(col => col.id as keyof T)
  , [columns]);

  const filteredData = useMemo(() => {
    let result = [...data]; // 원본 불변성 유지

    // 검색
    if (searchQuery) {
        result = result.filter(row => {
            if (searchColumn === 'all') {
                return searchableColumns.some(key => 
                    String(row[key]).toLowerCase().includes(searchQuery.toLowerCase())
                );
            } else {
                return String(row[searchColumn]).toLowerCase().includes(searchQuery.toLowerCase());
            }
        });
    }

    // 정렬 (숫자와 문자 구분하여 자연스러운 정렬)
    if (currentSort) {
        const { key, direction } = currentSort;
        result.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];

            // null/undefined 처리
            if (valA == null) return 1;
            if (valB == null) return -1;

            // 숫자 비교 vs 문자열 비교
            const strA = String(valA);
            const strB = String(valB);

            // localeCompare를 사용하여 숫자 섞인 문자열도 자연스럽게 정렬 (numeric: true)
            const comparison = strA.localeCompare(strB, undefined, { numeric: true });

            return direction === 'asc' ? comparison : -comparison;
        });
    }

    return result;
  }, [data, searchQuery, searchColumn, searchableColumns, currentSort]);
  
  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  // --- 이벤트 핸들러 ---
  
  const handleSort = (key: keyof T) => {
    setCurrentSort(prev => {
      if (prev?.key === key) {
        // asc -> desc -> 정렬 해제(null) 순서로 갈 수도 있고, 그냥 토글만 할 수도 있음. 여기선 토글.
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleEditMode = (rowId: number) => {
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, isEditing: !row.isEditing } : row
    ));
  };
  
  const handleSingleSave = (rowId: number) => {
      console.log(`[API Call] Saving Row ${rowId} to ${apiEndpoint}`);
      toggleEditMode(rowId); 
  };

  const handleSingleDelete = (rowId: number) => {
      if (window.confirm(`ID ${rowId} 행을 정말 삭제하시겠습니까?`)) {
          setData(prev => prev.filter(row => row.id !== rowId));
      }
  };

  // --- [수정 2] 취소 시 체크박스 상태 리셋 ---
  const handleCancelBatchEdit = () => {
      setIsBatchEditing(false);
      setSelectedRows([]); // 선택된 행 초기화 -> 배경색 리셋됨
  };

  const toggleBatchEdit = () => {
      setIsBatchEditing(true);
      setSelectedRows([]); 
  };

  const toggleRowSelection = (rowId: number) => {
    setSelectedRows(prev => 
        prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };
  
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
        alert("삭제할 행을 선택해주세요.");
        return;
    }
    if (window.confirm(`${selectedRows.length}개의 행을 정말 삭제하시겠습니까?`)) {
        setData(prev => prev.filter(row => !selectedRows.includes(row.id)));
        setSelectedRows([]);
    }
  };

  const handleBatchSave = () => {
    console.log(`[API Call] Batch Save`);
    setIsBatchEditing(false);
    setSelectedRows([]); // 저장 후에도 선택 해제
  };
  
  const handleDataChange = (rowId: number, key: keyof T, value: any) => {
    setData(prev => prev.map(row => 
        row.id === rowId ? { ...row, [key]: value } : row
    ));
  };

  // --- 입력 필드 렌더링 헬퍼 함수 (타입별 분기) ---
  const renderInput = (row: T, col: ColumnDefinition<T>) => {
      const value = row[col.id as keyof T];
      const rowId = row.id;
      const fieldKey = col.id as keyof T;

      // 드롭다운 (Select)
      if (col.inputType === 'select' && col.selectOptions) {
          return (
              <select
                  value={String(value)}
                  onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
                  style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '3px', width: '100%' }}
              >
                  <option value="">선택</option>
                  {col.selectOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
              </select>
          );
      }

      // 2. 검색형 입력 (Search Select / Datalist)
      if (col.inputType === 'search-select' && col.selectOptions) {
          const listId = `list-${String(col.id)}-${rowId}`;
          return (
              <>
                  <input
                      list={listId}
                      type="text"
                      value={String(value)}
                      onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
                      style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '3px', width: '100%' }}
                      placeholder="검색/입력"
                  />
                  <datalist id={listId}>
                      {col.selectOptions.map(opt => (
                          <option key={opt} value={opt} />
                      ))}
                  </datalist>
              </>
          );
      }

      // 3. 숫자 입력
      if (col.inputType === 'number') {
          return (
              <input
                  type="number"
                  value={String(value)}
                  onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
                  style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '3px', width: '100%' }}
              />
          );
      }

      // 4. 기본 텍스트 입력
      return (
          <input
              type="text"
              value={String(value)}
              onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
              style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '3px', width: '100%' }}
          />
      );
  };

  // ----------------------------------------------------------------------

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>{title}</h2>

      {/* 헤더 (검색, 엑셀) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select 
            value={String(searchColumn)} 
            onChange={(e) => setSearchColumn(e.target.value as 'all' | keyof T)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All</option>
            {searchableColumns.map(key => (
              <option key={String(key)} value={String(key)}>{columns.find(c => c.id === key)?.header}</option>
            ))}
          </select>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 10px 8px 30px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '300px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          </div>
        </div>
         {/* 3, 4. 엑셀 버튼 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
          >
            <CheckSquare size={16} style={{ marginRight: '5px' }} /> Excel 업로드
          </button>
          <button 
            onClick={() => downloadExcel(data, title)} 
            style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
          >
            <ArrowUpDown size={16} style={{ marginRight: '5px' }} /> Excel 다운로드
          </button>
        </div>
      </div>
      
      {/* 테이블 본체 */}
      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
  <tr>
    {isBatchEditing && (
      <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '40px' }}>
          <input 
            type="checkbox" 
            checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
            onChange={() => {
                if (selectedRows.length === paginatedData.length) {
                    setSelectedRows(prev => prev.filter(id => !paginatedData.some(row => row.id === id)));
                } else {
                    setSelectedRows(prev => {
                        const newIds = paginatedData.map(row => row.id).filter(id => !prev.includes(id));
                        return [...prev, ...newIds];
                    });
                }
            }}
          />
      </th>
    )}

    {/* 👉 추가된 번호 헤더 */}
    <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center', width: '60px' }}>
        #
    </th>

    {columns.map(col => (
      <th 
        key={String(col.id)} 
        onClick={() => col.sortable && handleSort(col.id as keyof T)}
        style={{ 
          padding: '15px', 
          borderBottom: '2px solid #ddd', 
          textAlign: 'left', 
          cursor: col.sortable ? 'pointer' : 'default',
          width: col.width,
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {col.header}
            {col.sortable && (
                <span style={{ marginLeft: '5px', display: 'flex', flexDirection: 'column', height: '14px', justifyContent: 'center' }}>
                   {currentSort?.key === col.id ? (
                       currentSort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                   ) : (
                       <ArrowUpDown size={14} color="#ccc" />
                   )}
                </span>
            )}
        </div>
      </th>
    ))}
  </tr>
</thead>

<tbody>
  {paginatedData.map((row, index) => {
    const rowId = row.id;
    const isSelected = selectedRows.includes(rowId);
    const isRowEditing = row.isEditing;

    // 👉 번호 계산 (페이지네이션 적용)
    const rowNumber = (currentPage - 1) * itemsPerPage + (index + 1);

    return (
      <tr 
        key={rowId} 
        style={{ 
          borderBottom: '1px solid #eee', 
          backgroundColor: isSelected ? '#e0f7fa' : (isRowEditing ? '#fffacd' : 'white') 
        }}
      >
        {isBatchEditing && (
            <td style={{ padding: '15px', textAlign: 'center' }}>
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleRowSelection(rowId)}
                />
            </td>
        )}

        {/* 👉 번호 표시 칸 */}
        <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>
            {rowNumber}
        </td>

        {columns.map(col => (
          <td key={String(col.id)} style={{ padding: '15px', verticalAlign: 'middle' }}>
            {col.id === 'actions' ? (
                <div style={{ display: 'flex', gap: '5px' }}>
                  {isRowEditing ? (
                      <button onClick={() => handleSingleSave(rowId)} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}><Save size={16} /></button>
                  ) : (
                      <button onClick={() => toggleEditMode(rowId)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}><Edit2 size={16} /></button>
                  )}
                  <button onClick={() => handleSingleDelete(rowId)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}><Trash2 size={16} /></button>
                </div>
            ) : (
                isRowEditing ? renderInput(row, col) : row[col.id as keyof T]
            )}
          </td>
        ))}
      </tr>
    );
  })}
</tbody>
        </table>
      </div>

      {/* 9, 10. 하단 영역 (페이지네이션, 전체 수정 버튼) */}
            {/* [수정] justifyContent: 'space-between' -> 'flex-end'로 변경하고, 
                       페이지네이션은 중앙 정렬을 위해 별도의 <div>를 사용하여 감쌉니다. 
                       전체 버튼을 오른쪽으로 배치하기 위해 기존의 `space-between` 대신 세 영역을 명확히 구분합니다. 
            */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                
                {/* 왼쪽 공간 비우기 */}
                <div style={{ visibility: 'hidden', width: '20%' }}>Placeholder</div> 
                
                {/* 10. 페이지네이션 (중앙) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>«</button>
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>‹</button>
                    
                    {/* 현재 페이지 그룹 표시 (예: 1, 2, 3...) */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                        Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)
                    ).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: page === currentPage ? '#007bff' : 'white', color: page === currentPage ? 'white' : 'black' }}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>›</button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>»</button>
                </div>

                {/* 9. 전체 수정/저장/선택 삭제 버튼 (오른쪽) */}
                <div style={{ width: '20%', display: 'flex', justifyContent: 'flex-end' }}>
                    {isBatchEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleBatchSave} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                                <Save size={16} style={{ marginRight: '5px' }} /> 전체 저장
                            </button>
                            <button onClick={handleBatchDelete} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                                <Trash2 size={16} style={{ marginRight: '5px' }} /> 선택 삭제 ({selectedRows.length})
                            </button>
                            <button onClick={handleCancelBatchEdit} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                                <X size={16} style={{ marginRight: '5px' }} /> 취소
                            </button>
                        </div>
                    ) : (
                        <button onClick={toggleBatchEdit} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                            전체 수정
                        </button>
                    )}
                </div>
            </div>
{/* 3. Excel 업로드 모달 연결 */}
      <ExcelUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        target={title} // 모달에 어떤 페이지인지 표시
      />
    </div>
  );
};

export default StandardDataManagementTable;