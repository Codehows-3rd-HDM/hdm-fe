import { useState, useMemo, useEffect } from 'react';
import type { ColumnDefinition } from '../../types/data';
import { 
  ArrowUp, ArrowDown, ArrowUpDown, Search, Save, Trash2, X, CheckSquare, Edit2, Upload, Download, Loader2 
} from 'lucide-react'; 
import ExcelUploadModal from '../common/ExcelUploadModal';
//API 모듈 임포트
import { fetchManagementData, deleteManagementItem, updateManagementItem, deleteBatchManagementItems } from '../../apis/vehicle_manageApi';

// --- 엑셀 다운로드 함수 (프론트 구현만) ---
const downloadExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }
  const headers = Object.keys(data[0]).filter(key => key !== 'isEditing' && key !== 'id');
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Props 정의 ---
interface StandardDataManagementTableProps<T> {
  title: string;
  columns: ColumnDefinition<T>[];
  apiEndpoint: string; // [변경] initialData 대신 endpoint만 받음
}

const StandardDataManagementTable = <T extends { id: number, [key: string]: any }>({ 
  title, 
  columns, 
  apiEndpoint 
}: StandardDataManagementTableProps<T>) => {
  
  // --- 상태 관리 ---
  const [data, setData] = useState<T[]>([]); // 초기값은 빈 배열
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  
  const [currentSort, setCurrentSort] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<'all' | keyof T>('all');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBatchEditing, setIsBatchEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- [API] 데이터 로딩 (Mount 시점) ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchManagementData(apiEndpoint);
        setData(result as T[]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [apiEndpoint]); // endpoint가 바뀌면 다시 로딩

  // --- 필터링 & 정렬 로직 (메모이제이션) ---
  const searchableColumns = useMemo(() => 
    columns.filter(col => col.searchable && col.id !== 'actions').map(col => col.id as keyof T)
  , [columns]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. 검색
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

    // 2. 정렬
    if (currentSort) {
        const { key, direction } = currentSort;
        result.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];
            if (valA == null) return 1;
            if (valB == null) return -1;
            
            const strA = String(valA);
            const strB = String(valB);
            const comparison = strA.localeCompare(strB, undefined, { numeric: true });
            return direction === 'asc' ? comparison : -comparison;
        });
    }
    return result;
  }, [data, searchQuery, searchColumn, searchableColumns, currentSort]);
  
  // --- 페이지네이션 ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  // --- 핸들러 ---
  
  const handleSort = (key: keyof T) => {
    setCurrentSort(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // [수정 모드]
  const toggleEditMode = (rowId: number) => {
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, isEditing: !row.isEditing } : row
    ));
  };
  
  // [API] 개별 저장
  const handleSingleSave = async (rowId: number) => {
      const rowData = data.find(row => row.id === rowId);
      if (!rowData) return;

      // API 호출
      const success = await updateManagementItem(apiEndpoint, rowId, rowData);
      if (success) {
          alert("저장되었습니다.");
          toggleEditMode(rowId); 
      }
  };

  // [API] 개별 삭제
  const handleSingleDelete = async (rowId: number) => {
      if (window.confirm(`ID ${rowId} 행을 정말 삭제하시겠습니까?`)) {
          const success = await deleteManagementItem(apiEndpoint, rowId);
          if (success) {
              setData(prev => prev.filter(row => row.id !== rowId));
          }
      }
  };

  // [일괄 수정]
  const handleCancelBatchEdit = () => {
      setIsBatchEditing(false);
      setSelectedRows([]);
      // 취소 시 데이터를 원복하려면 별도의 백업 state가 필요할 수 있음
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
  
  // [API] 일괄 삭제
  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
        alert("삭제할 행을 선택해주세요.");
        return;
    }
    if (window.confirm(`${selectedRows.length}개의 행을 정말 삭제하시겠습니까?`)) {
        const success = await deleteBatchManagementItems(apiEndpoint, selectedRows);
        if (success) {
            setData(prev => prev.filter(row => !selectedRows.includes(row.id)));
            setSelectedRows([]);
        }
    }
  };

  const handleBatchSave = () => {
    // 실제로는 변경된 row만 추려서 API를 보내야 함. 여기선 전체 저장 시늉만.
    alert("일괄 저장되었습니다. (API 연동 필요)");
    setIsBatchEditing(false);
    setSelectedRows([]);
  };
  
  const handleDataChange = (rowId: number, key: keyof T, value: any) => {
    setData(prev => prev.map(row => 
        row.id === rowId ? { ...row, [key]: value } : row
    ));
  };

  // --- 입력 필드 렌더링 ---
  const renderInput = (row: T, col: ColumnDefinition<T>) => {
      const value = row[col.id as keyof T];
      const rowId = row.id;
      const fieldKey = col.id as keyof T;
      
      const inputClass = "w-full p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";

      if (col.inputType === 'select' && col.selectOptions) {
          return (
              <select
                  value={String(value)}
                  onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
                  className={inputClass}
              >
                  <option value="">선택</option>
                  {col.selectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
          );
      }

      if (col.inputType === 'search-select' && col.selectOptions) {
          const listId = `list-${String(col.id)}-${rowId}`;
          return (
              <>
                  <input
                      list={listId}
                      type="text"
                      value={String(value)}
                      onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
                      className={inputClass}
                      placeholder="입력/선택"
                  />
                  <datalist id={listId}>
                      {col.selectOptions.map(opt => <option key={opt} value={opt} />)}
                  </datalist>
              </>
          );
      }

      return (
          <input
              type={col.inputType === 'number' ? 'number' : 'text'}
              value={String(value)}
              onChange={(e) => handleDataChange(rowId, fieldKey, e.target.value)}
              className={inputClass}
          />
      );
  };

  // ----------------------------------------------------------------------
  // [렌더링]
  // ----------------------------------------------------------------------

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* 1. 타이틀 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      {/* 2. 헤더 (검색 & 엑셀 버튼) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        
        {/* 검색 영역 */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={String(searchColumn)} 
            onChange={(e) => setSearchColumn(e.target.value as 'all' | keyof T)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">전체 검색</option>
            {searchableColumns.map(key => (
              <option key={String(key)} value={String(key)}>{columns.find(c => c.id === key)?.header}</option>
            ))}
          </select>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* 엑셀 버튼 영역 */}
        <div className="flex gap-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
          >
            <Upload size={16} className="mr-2" /> Excel 업로드
          </button>
          <button 
            onClick={() => downloadExcel(filteredData, title)} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={16} className="mr-2" /> Excel 다운로드
          </button>
        </div>
      </div>
      
      {/* 3. 테이블 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                <span>데이터를 불러오는 중입니다...</span>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                    <tr>
                    {/* 체크박스 (일괄 수정 시) */}
                    {isBatchEditing && (
                        <th className="p-4 w-10 text-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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

                    {/* 번호 헤더 */}
                    <th className="px-6 py-3 text-center w-16">#</th>

                    {/* 데이터 컬럼 헤더 */}
                    {columns.map(col => (
                        <th 
                        key={String(col.id)} 
                        className={`px-6 py-3 font-bold ${col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                        style={{ width: col.width }}
                        onClick={() => col.sortable && handleSort(col.id as keyof T)}
                        >
                        <div className="flex items-center gap-1">
                            {col.header}
                            {col.sortable && (
                                <span className="text-gray-400">
                                    {currentSort?.key === col.id ? (
                                        currentSort.direction === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />
                                    ) : (
                                        <ArrowUpDown size={14} />
                                    )}
                                </span>
                            )}
                        </div>
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? paginatedData.map((row, index) => {
                    const rowId = row.id;
                    const isSelected = selectedRows.includes(rowId);
                    const isRowEditing = row.isEditing;
                    const rowNumber = (currentPage - 1) * itemsPerPage + (index + 1);

                    return (
                        <tr 
                        key={rowId} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : isRowEditing ? 'bg-yellow-50' : ''}`}
                        >
                        {/* 체크박스 */}
                        {isBatchEditing && (
                            <td className="p-4 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={isSelected} 
                                    onChange={() => toggleRowSelection(rowId)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </td>
                        )}

                        {/* 번호 */}
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                            {rowNumber}
                        </td>

                        {/* 데이터 셀 */}
                        {columns.map(col => (
                            <td key={String(col.id)} className="px-6 py-4">
                            {col.id === 'actions' ? (
                                <div className="flex gap-2">
                                    {isRowEditing ? (
                                        <button 
                                            onClick={() => handleSingleSave(rowId)} 
                                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="저장"
                                        >
                                            <Save size={16} />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => toggleEditMode(rowId)} 
                                            className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" title="수정"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    {!isRowEditing && (
                                        <button 
                                            onClick={() => handleSingleDelete(rowId)} 
                                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                (isRowEditing || isBatchEditing) && col.editable ? renderInput(row, col) : row[col.id as keyof T]
                            )}
                            </td>
                        ))}
                        </tr>
                    );
                    }) : (
                        <tr>
                            <td colSpan={columns.length + (isBatchEditing ? 2 : 1)} className="px-6 py-10 text-center text-gray-500">
                                데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {/* 4. 하단 액션바 (페이지네이션 & 일괄 작업) */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-6 gap-4">
        
        {/* Placeholder for layout balance */}
        <div className="hidden md:block w-1/4"></div> 
        
        {/* 페이지네이션 (중앙) */}
        <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">«</button>
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)
            ).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}
                >
                    {page}
                </button>
            ))}
            
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">»</button>
        </div>

        {/* 일괄 작업 버튼 (우측) */}
        <div className="flex justify-end w-full md:w-1/4">
            {isBatchEditing ? (
                <div className="flex gap-2 animate-fade-in">
                    <button onClick={handleBatchSave} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm font-bold text-sm">
                        <Save size={16} className="mr-2" /> 전체 저장
                    </button>
                    <button onClick={handleBatchDelete} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm font-bold text-sm">
                        <Trash2 size={16} className="mr-2" /> 선택 삭제 ({selectedRows.length})
                    </button>
                    <button onClick={handleCancelBatchEdit} className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 shadow-sm font-bold text-sm">
                        <X size={16} className="mr-2" /> 취소
                    </button>
                </div>
            ) : (
                <button 
                    onClick={toggleBatchEdit} 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-bold text-sm"
                >
                    <CheckSquare size={16} className="mr-2" /> 전체 수정
                </button>
            )}
        </div>
      </div>

      {/* 엑셀 업로드 모달 연결 */}
      <ExcelUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={title}
        onUpload={(data) => {
            console.log("Uploaded Data:", data);
            alert("업로드 로직 구현 필요");
            setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default StandardDataManagementTable;