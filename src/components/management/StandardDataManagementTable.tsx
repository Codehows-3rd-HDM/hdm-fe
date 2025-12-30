import { useState, useMemo, useEffect, useCallback } from 'react';
import type { ColumnDefinition } from '../../types/data';
import { 
  ArrowUp, ArrowDown, ArrowUpDown, Search, Save, Trash2, X, CheckSquare, Edit2, Loader2 
} from 'lucide-react'; 
// import ExcelUploadModal from '../common/ExcelUploadModal';
import Modal from '../Modal';
//API 모듈 임포트
import axiosInstance from '../../apis/axiosInstance';

// --- Props 정의 ---
interface StandardDataManagementTableProps<T> {
  title: string;
  columns: ColumnDefinition<T>[];
  apiEndpoint: string; // [변경] initialData 대신 endpoint만 받음
  disableDelete?: boolean; // 차종 모델 페이지에서 삭제 비활성화
  options?: ManagementOptions;
}

type ManagementOptions = {
  supplyTypes?: { id: number; name: string }[];
  supplyCustomers?: { id: number; name: string }[];
  operationPurposes?: { id: number; name: string }[];
  companies?: { id: number; name: string; oneWayDistance?: number }[];
  carCategories?: { id: number; name: string }[];
  carCategoryMap?: Record<string, { id: number; name: string }[]>;
  fuelTypes?: { id: number; name: string }[];
};

const EMPTY_OPTIONS: ManagementOptions = Object.freeze({});

const StandardDataManagementTable = <T extends { id: number, [key: string]: any }>({ 
  title, 
  columns, 
  apiEndpoint,
  disableDelete = false,
  options
}: StandardDataManagementTableProps<T>) => {
  // options가 없는 페이지에서는 새 객체가 렌더마다 생성되어 useEffect가 반복되지 않도록 메모이제이션
  const normalizedOptions: ManagementOptions = useMemo(() => options ?? EMPTY_OPTIONS, [options]);
  
  // --- 상태 관리 ---
  const [data, setData] = useState<T[]>([]); // 초기값은 빈 배열
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  
  // 에러 모달 상태
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('오류');
  
  const [currentSort, setCurrentSort] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<'all' | keyof T>('all');
  
  // const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBatchEditing, setIsBatchEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [originalData, setOriginalData] = useState<T[]>([]); // 전체 수정 취소용 백업 데이터
  
  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(0); // Spring Boot Page는 0부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(15); // 추후 페이지 크기 변경 기능 추가 시 사용

  // 대분류 선택 상태 추적 (차량 관리에서 소분류 필터링용)
  const [selectedParentCategories, setSelectedParentCategories] = useState<Record<number, string>>({});
  // 단일 수정 취소를 위한 원본 행 백업
  const [originalRows, setOriginalRows] = useState<Record<number, T>>({});

  // 프론트 컬럼 키 -> 백엔드 정렬 키 매핑 (엔드포인트별)
  const mapSortKey = useCallback((key: keyof T): string | null => {
    const k = String(key);

    if (apiEndpoint.includes('vehicle')) {
      if (k === 'operationPurposeName' || k === 'defaultScope') return null; // 현재 엔티티 매핑이 없어 정렬 제외
      return k;
    }

    if (apiEndpoint.includes('company')) {
      return k; // 백엔드에서 실제 경로로 매핑
    }

    if (apiEndpoint.includes('car-model')) {
      return k; // 백엔드에서 실제 경로로 매핑
    }

    if (apiEndpoint.includes('operation-purpose')) {
      return k;
    }

    return k;
  }, [apiEndpoint]);

  // 정렬이 변경되면 페이지를 리셋
  useEffect(() => {
    if (currentSort) {
      setCurrentPage(0);
    }
  }, [currentSort]);

  // 검색어 변경 시 페이지를 리셋
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(0);
    }
  }, [searchQuery]);

  // --- [API] 통합 데이터 로딩 ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let endpoint = apiEndpoint;
        console.log(`[${title}] 데이터 재로딩 - 검색어: ${searchQuery}, 정렬: ${String(currentSort?.key)}-${currentSort?.direction}, 페이지: ${currentPage}`);

        if (endpoint.includes('car-model')) {
          endpoint = '/admin/car-model/search';
        } else if (endpoint.includes('company')) {
          endpoint = '/admin/company/search';
        } else if (endpoint.includes('vehicle')) {
          endpoint = '/admin/vehicle/search';
        } else if (endpoint.includes('supply-type')) {
          endpoint = '/admin/supply-type/search';
        } else if (endpoint.includes('operation-purpose')) {
          endpoint = '/admin/operation-purpose/search';
        } else if (endpoint.includes('supply-customer')) {
          endpoint = '/admin/supply-customer/search';
        }

        // 정렬 파라미터 생성
        const sortParam = currentSort 
          ? (() => {
              const mapped = mapSortKey(currentSort.key);
              return mapped ? `${mapped},${currentSort.direction}` : undefined;
            })()
          : undefined;

        const response = await axiosInstance.get(endpoint, {
          params: {
            page: currentPage,
            size: pageSize,
            ...(searchQuery.trim() && { keyword: searchQuery.trim() }),
            ...(sortParam && { sort: sortParam })
          }
        });

        const pageData = response.data;
        let rawData = pageData.content || pageData;
        
        setTotalPages(pageData.totalPages || 1);
        setTotalElements(pageData.totalElements || rawData.length);
        setCurrentPage(pageData.number || 0);

        // 데이터 변환 로직
        if (endpoint.includes('car-model')) {
          rawData = rawData.map((item: any) => ({
            ...item,
            parentCategoryName: item.parentCategoryName || '',
            carCategoryName: item.carCategoryName || '',
            customEfficiency: item.customEfficiency || '',
            fuelType: item.fuelType || '',
            carCategoryId: item.carCategoryId
          }));
        } else if (endpoint.includes('company')) {
          rawData = rawData.map((item: any) => {
            let region = item.region || '';
            let addressDetail = item.detailAddress || item.addressDetail || '';
            if (!region && !addressDetail && item.address) {
              const addressParts = item.address.split(' ');
              if (addressParts.length >= 2) {
                region = addressParts[0];
                addressDetail = addressParts.slice(1).join(' ');
              }
            }
            return {
              ...item,
              region,
              addressDetail,
              companyName: item.companyName || '',
              supplyTypeId: item.supplyTypeId || '',
              customerId: item.customerId || '',
              oneWayDistance: item.oneWayDistance || '',
              remark: item.remark || ''
            };
          });
        } else if (endpoint.includes('vehicle')) {
          rawData = rawData.map((item: any) => {
            let fuelTypeId: any = '';
            if (normalizedOptions.fuelTypes && item.fuelType) {
              const fuelMatch = normalizedOptions.fuelTypes.find(f => f.name === item.fuelType);
              fuelTypeId = fuelMatch ? fuelMatch.id : '';
            }
            return {
              ...item,
              carNumber: item.carNumber || '',
              purposeId: item.purposeId || '',
              companyId: item.companyId || '',
              driverMemberId: item.driverMemberId || '',
              parentCategoryId: item.parentCategoryId || item.carCategoryParentId || '',
              carCategoryId: item.carCategoryId || '',
              carModelId: item.carModelId || '',
              carModelName: item.carName || item.carModelName || '',
              fuelType: item.fuelType || '',
              fuelTypeId: fuelTypeId,
              operationDistance: item.operationDistance || '',
              remark: item.remark || '',
              operationPurposeName: item.operationPurposeName || '',
              companyName: item.companyName || '',
              parentCategoryName: item.parentCategoryName || '',
              carCategoryName: item.carCategoryName || ''
            };
          });
        } else if (endpoint.includes('supply-type')) {
          rawData = rawData.map((item: any) => ({
            ...item,
            supplyType: item.supplyTypeName || '',
            note: item.remark || ''
          }));
        } else if (endpoint.includes('operation-purpose')) {
          rawData = rawData.map((item: any) => ({
            ...item,
            purpose: item.purposeName || '',
            scope: item.defaultScope || ''
          }));
        } else if (endpoint.includes('supply-customer')) {
          rawData = rawData.map((item: any) => ({
            ...item,
            customerName: item.customerName || '',
            note: item.remark || ''
          }));
        }

        setData(rawData);
      } catch (error) {
        console.error(`[${title}] 검색 데이터 로딩 중 오류 발생:`, error);
        let errorMsg = '데이터 로딩 중 오류가 발생했습니다.';
        if (error instanceof Error) {
          errorMsg = error.message;
        } else if (typeof error === 'object' && error !== null && 'response' in error) {
          const axiosError = error as any;
          errorMsg = axiosError.response?.data?.message || errorMsg;
        }
        setErrorTitle('데이터 로딩 오류');
        setErrorMessage(errorMsg);
        setIsErrorModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [apiEndpoint, currentPage, currentSort, pageSize, searchQuery, title, normalizedOptions, mapSortKey]); // 데이터 로딩 의존성

  // --- 필터링 로직 (메모이제이션) - 정렬은 서버 사이드에서 처리 ---
  const searchableColumns = useMemo(() => 
    columns.filter(col => col.searchable && col.id !== 'actions').map(col => col.id as keyof T)
  , [columns]);

  const filteredData = useMemo(() => {
    // 검색 필터 (서버에서 처리하지만, 클라이언트에서 추가 필터링도 가능)
    // 서버에서 이미 검색된 데이터이므로 그대로 반환
    return [...data];
  }, [data]);
  
  // --- 페이지네이션 ---
  // 백엔드에서 페이징된 데이터를 사용하므로 클라이언트 사이드 페이지네이션 불필요
  const paginatedData = filteredData;

  // --- 핸들러 ---
  
  const handleSort = (key: keyof T) => {
    // 백엔드에서 정렬 불가능한 컬럼은 클릭 시 무시
    if (!mapSortKey(key)) {
      return;
    }
    setCurrentSort(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    // 페이지 리셋은 useEffect에서 처리
  };

  // [페이지 변경]
  const handlePageChange = async (page: number) => {
    if (page < 0 || page >= totalPages) return;
    
    setCurrentPage(page);
    setLoading(true);
    
    try {
      let endpoint = apiEndpoint;
      console.log(`[${title}] 페이지 변경 - 페이지: ${page}`);

      if (endpoint.includes('car-model')) {
        endpoint = '/admin/car-model/search';
      } else if (endpoint.includes('company')) {
        endpoint = '/admin/company/search';
      } else if (endpoint.includes('vehicle')) {
        endpoint = '/admin/vehicle/search';
      } else if (endpoint.includes('supply-type')) {
        endpoint = '/admin/supply-type/search';
      } else if (endpoint.includes('operation-purpose')) {
        endpoint = '/admin/operation-purpose/search';
      } else if (endpoint.includes('supply-customer')) {
        endpoint = '/admin/supply-customer/search';
      }

      const response = await axiosInstance.get(endpoint, {
        params: {
          page: page,
          size: pageSize,
          ...(searchQuery.trim() && { keyword: searchQuery.trim() }),
          ...(currentSort && (() => {
            const mapped = mapSortKey(currentSort.key);
            return mapped ? { sort: `${mapped},${currentSort.direction}` } : {};
          })())
        }
      });

      const pageData = response.data;
      let rawData = pageData.content || pageData;
      
      // 페이징 정보 업데이트
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || rawData.length);

      // 데이터 변환 로직 (데이터 로딩과 동일)
      if (endpoint.includes('car-model')) {
        rawData = rawData.map((item: any) => ({
          ...item,
          parentCategoryName: item.parentCategoryName || '',
          carCategoryName: item.carCategoryName || '',
          customEfficiency: item.customEfficiency || '',
          fuelType: item.fuelType || '',
          carCategoryId: item.carCategoryId
        }));
      } else if (endpoint.includes('company')) {
        rawData = rawData.map((item: any) => {
          let region = item.region || '';
          let addressDetail = item.detailAddress || item.addressDetail || '';
          if (!region && !addressDetail && item.address) {
            const addressParts = item.address.split(' ');
            if (addressParts.length >= 2) {
              region = addressParts[0];
              addressDetail = addressParts.slice(1).join(' ');
            }
          }
          return {
            ...item,
            region,
            addressDetail,
            companyName: item.companyName || '',
            supplyTypeId: item.supplyTypeId || '',
            customerId: item.customerId || '',
            oneWayDistance: item.oneWayDistance || '',
            remark: item.remark || ''
          };
        });
      } else if (endpoint.includes('vehicle')) {
        rawData = rawData.map((item: any) => {
          let fuelTypeId: any = '';
          if (normalizedOptions.fuelTypes && item.fuelType) {
            const fuelMatch = normalizedOptions.fuelTypes.find(f => f.name === item.fuelType);
            fuelTypeId = fuelMatch ? fuelMatch.id : '';
          }
          return {
            ...item,
            carNumber: item.carNumber || '',
            purposeId: item.purposeId || '',
            companyId: item.companyId || '',
            driverMemberId: item.driverMemberId || '',
            parentCategoryId: item.parentCategoryId || item.carCategoryParentId || '',
            carCategoryId: item.carCategoryId || '',
            carModelId: item.carModelId || '',
            carModelName: item.carName || item.carModelName || '',
            fuelType: item.fuelType || '',
            fuelTypeId: fuelTypeId,
            operationDistance: item.operationDistance || '',
            remark: item.remark || '',
            operationPurposeName: item.operationPurposeName || '',
            companyName: item.companyName || '',
            parentCategoryName: item.parentCategoryName || '',
            carCategoryName: item.carCategoryName || ''
          };
        });
      } else if (endpoint.includes('supply-type')) {
        rawData = rawData.map((item: any) => ({
          ...item,
          supplyType: item.supplyTypeName || '',
          note: item.remark || ''
        }));
      } else if (endpoint.includes('operation-purpose')) {
        rawData = rawData.map((item: any) => ({
          ...item,
          purpose: item.purposeName || '',
          scope: item.defaultScope || ''
        }));
      } else if (endpoint.includes('supply-customer')) {
        rawData = rawData.map((item: any) => ({
          ...item,
          customerName: item.customerName || '',
          note: item.remark || ''
        }));
      }

      setData(rawData);
    } catch (error) {
      console.error(`[${title}] 페이지 변경 중 오류 발생:`, error);
    } finally {
      setLoading(false);
    }
  };

  // [수정 모드]
  const toggleEditMode = (rowId: number) => {
    const target = data.find(row => row.id === rowId);
    const enteringEdit = target ? !target.isEditing : true;
    if (target && enteringEdit) {
      // 편집 시작 시 원본 백업
      setOriginalRows(prev => ({ ...prev, [rowId]: { ...target } }));
      // 차량 관리에서 대분류 선택 상태 초기화
      if (apiEndpoint.includes('vehicle') && target.parentCategoryName) {
        setSelectedParentCategories(prev => ({ ...prev, [rowId]: target.parentCategoryName }));
      }
    } else {
      // 편집 종료 시 백업 제거
      setOriginalRows(prev => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    }
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, isEditing: !row.isEditing } : row
    ));
  };

  // 단일 수정 취소
  const handleSingleCancel = (rowId: number) => {
    const original = originalRows[rowId];
    if (!original) {
      // 백업이 없으면 편집 모드만 종료
      toggleEditMode(rowId);
      return;
    }
    setData(prev => prev.map(row => row.id === rowId ? { ...original, isEditing: false } as T : row));
    setOriginalRows(prev => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };
  
  // [API] 개별 삭제
  const handleSingleDelete = async (rowId: number) => {
      if (window.confirm(`ID ${rowId} 행을 정말 삭제하시겠습니까?`)) {
          let endpoint = apiEndpoint;
          if (endpoint.includes('car-model')) {
            endpoint = `/admin/car-model/${rowId}`;
          } else if (endpoint.includes('company')) {
            endpoint = `/admin/company/${rowId}`;
          } else if (endpoint.includes('vehicle')) {
            endpoint = `/admin/vehicle/${rowId}`;
          } else if (endpoint.includes('supply-type')) {
            endpoint = `/admin/supply-type/${rowId}`;
          } else if (endpoint.includes('operation-purpose')) {
            endpoint = `/admin/operation-purpose/${rowId}`;
          } else if (endpoint.includes('supply-customer')) {
            endpoint = `/admin/supply-customer/${rowId}`;
          } else {
            // 다른 엔티티들은 삭제 API가 없음
            alert("이 데이터는 삭제할 수 없습니다.");
            return;
          }
          try {
            await axiosInstance.delete(endpoint);
            setData(prev => prev.filter(row => row.id !== rowId));
            setErrorTitle('삭제 완료');
            setErrorMessage('데이터가 삭제되었습니다.');
            setIsErrorModalOpen(true);
          } catch (error) {
            let errorMsg = '삭제 중 오류가 발생했습니다.';
            if (typeof error === 'object' && error !== null && 'response' in error) {
              const axiosError = error as any;
              errorMsg = axiosError.response?.data?.message || errorMsg;
            }
            setErrorTitle('삭제 오류');
            setErrorMessage(errorMsg);
            setIsErrorModalOpen(true);
          }
      }
  };
  // [API] 개별 저장
  const handleSingleSave = async (rowId: number) => {
      const rowData = data.find(row => row.id === rowId);
      if (!rowData) return;

      // API 호출
      let endpoint = apiEndpoint;
      let payload: any = rowData;
      
      if (endpoint.includes('car-model')) {
        endpoint = `/admin/car-model/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          carCategoryId: rowData.carCategoryId,
          fuelType: rowData.fuelType,
          customEfficiency: parseFloat(rowData.customEfficiency || '0')
        };
      } else if (endpoint.includes('company')) {
        endpoint = `/admin/company/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          companyName: rowData.companyName,
          supplyTypeId: rowData.supplyTypeId,
          customerId: rowData.customerId,
          oneWayDistance: rowData.oneWayDistance,
          region: rowData.region,
          detailAddress: rowData.detailAddress,
          // address: `${rowData.region} ${rowData.addressDetail}`.trim(),
          remark: rowData.remark
        };
      } else if (endpoint.includes('vehicle')) {
        endpoint = `/admin/vehicle/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          carNumber: rowData.carNumber,
          purposeId: rowData.purposeId,
          companyId: rowData.companyId,
          driverMemberId: rowData.driverMemberId,
          parentCategoryId: rowData.parentCategoryId,
          carCategoryId: rowData.carCategoryId,
          carModelId: rowData.carModelId,
          carName: rowData.carModelName,
          fuelType: rowData.fuelType,
          operationDistance: parseFloat(rowData.operationDistance || '0'),
          remark: rowData.remark
        };
      } else if (endpoint.includes('supply-type')) {
        endpoint = `/admin/supply-type/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          supplyTypeName: rowData.supplyType
        };
      } else if (endpoint.includes('supply-customer')) {
        endpoint = `/admin/supply-customer/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          customerName: rowData.customerName,
          remark: rowData.note
        };
      } else if (endpoint.includes('operation-purpose')) {
        endpoint = `/admin/operation-purpose/${rowId}`;
        // 프론트 데이터 -> 백엔드 데이터 변환
        payload = {
          purposeName: rowData.purpose,
          defaultScopeId: rowData.scope === 'Scope1' ? 1 : rowData.scope === 'Scope3' ? 3 : 4
        };
      } else {
        // 다른 엔티티들은 수정 API가 없음
        alert("이 데이터는 수정할 수 없습니다.");
        return;
      }
      console.log(`[${title}] 개별 저장 요청 - ID: ${rowId}, 페이로드:`, payload);
      try {
        await axiosInstance.put(endpoint, payload);
        setErrorTitle('저장 완료');
        setErrorMessage('데이터가 저장되었습니다.');
        setIsErrorModalOpen(true);
        toggleEditMode(rowId);
      } catch (error) {
        let errorMsg = '저장 중 오류가 발생했습니다.';
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const axiosError = error as any;
          errorMsg = axiosError.response?.data?.message || errorMsg;
        }
        setErrorTitle('저장 오류');
        setErrorMessage(errorMsg);
        setIsErrorModalOpen(true);
      }
  };

  // [일괄 수정]
  const handleCancelBatchEdit = () => {
      setData(originalData); // 백업 데이터로 복원
      setIsBatchEditing(false);
      setSelectedRows([]);
      setOriginalData([]); // 백업 데이터 초기화
  };

  const toggleBatchEdit = () => {
      setOriginalData([...data]); // 전체 수정 시작 시 데이터 백업
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
    
    // 삭제 가능한 엔티티인지 확인
    const canDelete = apiEndpoint.includes('company') || apiEndpoint.includes('vehicle') || apiEndpoint.includes('supply-type') || apiEndpoint.includes('supply-customer') || apiEndpoint.includes('operation-purpose');
    if (!canDelete) {
        alert("이 데이터는 삭제할 수 없습니다.");
        return;
    }
    
    if (window.confirm(`${selectedRows.length}개의 행을 정말 삭제하시겠습니까?`)) {
        try {
          console.log(`[${title}] 일괄 삭제 요청 - 선택된 ID들: ${selectedRows}`);
          
          // 백엔드의 deleteMultiple API 사용
          await axiosInstance.delete(apiEndpoint, { data: selectedRows });
          
          setData(prev => prev.filter(row => !selectedRows.includes(row.id)));
          setSelectedRows([]);
          setErrorTitle('일괄 삭제 완료');
          setErrorMessage('데이터가 일괄 삭제되었습니다.');
          setIsErrorModalOpen(true);
        } catch (error) {
          console.error(`[${title}] 일괄 삭제 실패:`, error);
          let errorMsg = '일괄 삭제 중 오류가 발생했습니다.';
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as any;
            errorMsg = axiosError.response?.data?.message || errorMsg;
          }
          setErrorTitle('일괄 삭제 오류');
          setErrorMessage(errorMsg);
          setIsErrorModalOpen(true);
        }
    }
  };

  // [API] 일괄 저장
  const handleBatchSave = async () => {
    try {
      // 변경된 데이터만 추출 (실제로는 변경 감지 로직 필요)
      const changedData = data.filter(row => {
        const originalRow = originalData.find(orig => orig.id === row.id);
        return originalRow && JSON.stringify(originalRow) !== JSON.stringify(row);
      });

      if (changedData.length === 0) {
        alert("변경된 데이터가 없습니다.");
        return;
      }

      // API 엔드포인트 결정
      let endpoint = apiEndpoint;
      if (endpoint.includes('company')) {
        endpoint = `${apiEndpoint}/bulk-update`;
      } else if (endpoint.includes('vehicle')) {
        endpoint = `${apiEndpoint}/bulk-update`;
      } else if (endpoint.includes('operation-purpose')) {
        endpoint = `${apiEndpoint}/bulk`;
      } else {
        endpoint = `${apiEndpoint}/bulk`;
      }
      let payload: any[] = [];

      if (apiEndpoint.includes('car-model')) {
        // 차종 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          carCategoryId: row.carCategoryId,
          fuelType: row.fuelType,
          customEfficiency: parseFloat(row.customEfficiency || '0')
        }));
      } else if (apiEndpoint.includes('company')) {
        // 회사 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          companyName: row.companyName,
          supplyTypeId: row.supplyTypeId,
          customerId: row.customerId,
          oneWayDistance: row.oneWayDistance,
          region: row.region,
          detailAddress: row.detailAddress,
          // address: `${row.region} ${row.addressDetail}`.trim(),
          remark: row.remark
        }));
      } else if (apiEndpoint.includes('vehicle')) {
        // 차량 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          carNumber: row.carNumber,
          purposeId: row.purposeId,
          companyId: row.companyId,
          driverMemberId: row.driverMemberId,
          parentCategoryId: row.parentCategoryId,
          carCategoryId: row.carCategoryId,
          carModelId: row.carModelId,
          carName: row.carModelName,
          fuelType: row.fuelType,
          operationDistance: parseFloat(row.operationDistance || '0'),
          remark: row.remark
        }));
      } else if (apiEndpoint.includes('supply-type')) {
        // 공급유형 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          supplyTypeName: row.supplyType
        }));
      } else if (apiEndpoint.includes('supply-customer')) {
        // 공급고객 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          customerName: row.customerName,
          remark: row.note
        }));
      } else if (apiEndpoint.includes('operation-purpose')) {
        // 운행목적 데이터 변환
        payload = changedData.map(row => ({
          id: row.id,
          purposeName: row.purpose,
          defaultScopeId: row.scope === 'Scope1' ? 1 : row.scope === 'Scope3' ? 3 : 4
        }));
      }

      console.log(`[${title}] 일괄 저장 요청 - 엔드포인트: ${endpoint}, 데이터 개수: ${payload.length}`);
      console.log(`[${title}] 일괄 저장 페이로드:`, payload);

      await axiosInstance.patch(endpoint, payload);
      
      setErrorTitle('일괄 저장 완료');
      setErrorMessage('데이터가 일괄 저장되었습니다.');
      setIsErrorModalOpen(true);
      setIsBatchEditing(false);
      setSelectedRows([]);
      setOriginalData([]);
      
      // 데이터 새로고침
      window.location.reload();
      
    } catch (error) {
      console.error(`[${title}] 일괄 저장 실패:`, error);
      let errorMsg = '일괄 저장 중 오류가 발생했습니다.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        errorMsg = axiosError.response?.data?.message || errorMsg;
      }
      setErrorTitle('일괄 저장 오류');
      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    }
  };
  
  const handleDataChange = (rowId: number, key: keyof T, value: any) => {
    setData(prev => prev.map(row => 
        row.id === rowId ? { ...row, [key]: value } : row
    ));
    
    // 대분류 선택 시 소분류 초기화 및 선택 상태 업데이트
    if (String(key) === 'parentCategoryName' && apiEndpoint.includes('vehicle')) {
      setSelectedParentCategories(prev => ({
        ...prev,
        [rowId]: value
      }));
      // 소분류도 초기화
      setData(prev => prev.map(row => 
        row.id === rowId ? { ...row, [key]: value, carCategoryName: '' } : row
      ));
    }
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

      // 동적 드롭다운 (서버 데이터 기반)
      if (col.inputType === 'dynamic-select') {
        let dynamicOptions: { id: number; name: string; oneWayDistance?: number }[] = [];

        if (fieldKey === 'customerName' || fieldKey === 'customerId') {
          dynamicOptions = normalizedOptions.supplyCustomers || [];
        } else if (fieldKey === 'supplyTypeName' || fieldKey === 'supplyTypeId') {
          dynamicOptions = normalizedOptions.supplyTypes || [];
        } else if (fieldKey === 'companyName' || fieldKey === 'companyId') {
          dynamicOptions = normalizedOptions.companies || [];
        } else if (fieldKey === 'operationPurposeName' || fieldKey === 'purposeId') {
          dynamicOptions = normalizedOptions.operationPurposes || [];
        } else if (fieldKey === 'parentCategoryName' || fieldKey === 'parentCategoryId') {
          dynamicOptions = normalizedOptions.carCategories || [];
        } else if (fieldKey === 'fuelType' || fieldKey === 'fuelTypeId') {
          dynamicOptions = normalizedOptions.fuelTypes || [];
        }


        const currentId =
          fieldKey === 'customerName' ? row.customerId :
          fieldKey === 'supplyTypeName' ? row.supplyTypeId :
          fieldKey === 'companyName' ? row.companyId :
          fieldKey === 'operationPurposeName' ? row.purposeId :
          fieldKey === 'parentCategoryName' ? row.parentCategoryId :
          fieldKey === 'fuelType' ? row.fuelTypeId :
          '';

          // 협력사명 필드의 경우 검색 가능한 드롭다운으로 렌더링 (차량 관리에서만)
          if (String(fieldKey) === 'companyName' && apiEndpoint.includes('vehicle')) {
              const listId = `company-list-${rowId}`;
              return (
                  <>
                      <input
                          list={listId}
                          type="text"
                          value={String(value)}
                          onChange={(e) => {
                              const selectedValue = e.target.value;
                              handleDataChange(rowId, fieldKey, selectedValue);
                              
                              // 선택된 협력사 찾기
                              const selectedCompany = dynamicOptions.find(opt => opt.name === selectedValue);
                              if (selectedCompany) {
                                  // 협력사 ID 저장
                                  handleDataChange(rowId, 'companyId' as keyof T, selectedCompany.id);
                                  if (selectedCompany.oneWayDistance !== undefined) {
                                      // 거리 자동 반영 (operationDistance 필드)
                                      handleDataChange(rowId, 'operationDistance' as keyof T, selectedCompany.oneWayDistance);
                                      console.log(`[${title}] 협력사 선택으로 거리 자동 설정: ${selectedCompany.oneWayDistance}km`);
                                  }
                              }
                          }}
                          className={inputClass}
                          placeholder="협력사명 입력/선택"
                      />
                      <datalist id={listId}>
                          {dynamicOptions.map(opt => <option key={opt.id} value={opt.name} />)}
                      </datalist>
                  </>
              );
          }

          // 소분류 필드의 경우 대분류에 따라 옵션 필터링 (차량 관리에서만)
          if (String(fieldKey) === 'carCategoryName' && apiEndpoint.includes('vehicle')) {
              const selectedParentCategory = selectedParentCategories[rowId] || row.parentCategoryName || '';
              const filteredOptions = selectedParentCategory && normalizedOptions.carCategoryMap ? 
                normalizedOptions.carCategoryMap[selectedParentCategory] || [] : [];
              
              // 소분류 ID 계산
              const carCategoryCurrentId = (() => {
                if (row.carCategoryId) return row.carCategoryId;
                const nameVal = typeof value === 'string' ? value : '';
                const match = filteredOptions.find(opt => opt.name === nameVal);
                return match ? match.id : '';
              })();
              
              return (
                  <select
                      value={carCategoryCurrentId}
                      onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          const selected = filteredOptions.find(opt => opt.id === selectedId);
                          if (selected) {
                              handleDataChange(rowId, 'carCategoryId' as keyof T, selected.id);
                              handleDataChange(rowId, fieldKey, selected.name);
                          }
                      }}
                      className={inputClass}
                      disabled={!selectedParentCategory}
                  >
                      <option value="">{selectedParentCategory ? '선택' : '대분류를 먼저 선택하세요'}</option>
                      {filteredOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
              );
          }
          

          // 선택 값: ID가 없으면 이름으로 매칭해 기본 선택
          const computedSelectedId = (() => {
            if (currentId) return currentId;
            const nameVal = typeof value === 'string' ? value : '';
            const match = dynamicOptions.find(opt => opt.name === nameVal);
            return match ? match.id : '';
          })();

          return (
            <select
              value={computedSelectedId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const selected = dynamicOptions.find(opt => opt.id === selectedId);
                if (!selected) return;

                // ID 저장
                if (fieldKey === 'customerName') {
                  handleDataChange(rowId, 'customerId' as keyof T, selected.id);
                  handleDataChange(rowId, 'customerName' as keyof T, selected.name);
                }
                if (fieldKey === 'supplyTypeName') {
                  handleDataChange(rowId, 'supplyTypeId' as keyof T, selected.id);
                  handleDataChange(rowId, 'supplyTypeName' as keyof T, selected.name);
                }
                if (fieldKey === 'companyName') {
                  handleDataChange(rowId, 'companyId' as keyof T, selected.id);
                  handleDataChange(rowId, 'companyName' as keyof T, selected.name);
                }
                if (fieldKey === 'operationPurposeName') {
                  handleDataChange(rowId, 'purposeId' as keyof T, selected.id);
                  handleDataChange(rowId, 'operationPurposeName' as keyof T, selected.name);
                }
                if (fieldKey === 'parentCategoryName') {
                  handleDataChange(rowId, 'parentCategoryId' as keyof T, selected.id);
                  handleDataChange(rowId, 'parentCategoryName' as keyof T, selected.name);

                  // 🔥 대분류 바뀌면 소분류 초기화
                  handleDataChange(rowId, 'carCategoryId' as keyof T, '');
                  handleDataChange(rowId, 'carCategoryName' as keyof T, '');

                  setSelectedParentCategories(prev => ({
                    ...prev,
                    [rowId]: selected.name
                  }));
                }

                if (fieldKey === 'fuelType') {
                  handleDataChange(rowId, 'fuelTypeId' as keyof T, selected.id);
                  handleDataChange(rowId, 'fuelType' as keyof T, selected.name);
                }
              }}
              className={inputClass}
            >
              <option value="">선택</option>
              {dynamicOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
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
                    const rowNumber = currentPage * 15 + (index + 1);

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
                                    {isRowEditing && !isBatchEditing ? (
                                      <>
                                        <button 
                                          onClick={() => handleSingleSave(rowId)} 
                                          className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="저장"
                                        >
                                          <Save size={16} />
                                        </button>
                                        {/* 단일 수정 취소 */}
                                        <button
                                          onClick={() => handleSingleCancel(rowId)}
                                          className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" title="취소"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    ) : !isBatchEditing ? (
                                        <button 
                                            onClick={() => toggleEditMode(rowId)} 
                                            className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" title="수정"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    ) : null}
                                    {!isRowEditing && !disableDelete && !isBatchEditing && (
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
      <div className="flex flex-col gap-4 mt-6">
        
        {/* 페이지 정보 */}
        <div className="flex justify-center text-sm text-gray-600">
          총 {totalElements.toLocaleString()}개 항목, {totalPages}페이지 중 {currentPage + 1}페이지
        </div>
        
        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          
          {/* Placeholder for layout balance */}
          <div className="hidden md:block w-1/4"></div> 
          
          {/* 페이지네이션 (중앙) */}
        <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(0)} disabled={currentPage === 0} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&lt;&lt;&lt;</button>
            <button onClick={() => handlePageChange(Math.max(currentPage - 10, 0))} disabled={currentPage === 0} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&lt;&lt;</button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&lt;</button>
          
            
            {Array.from({ length: totalPages }, (_, i) => i).slice(
                Math.max(0, currentPage - 4), Math.min(totalPages, currentPage + 5)
            ).map(page => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}
                >
                    {page + 1}
                </button>
            ))}
            
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&gt;</button>
            <button onClick={() => handlePageChange(Math.min(currentPage + 10, totalPages - 1))} disabled={currentPage === totalPages - 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&gt;&gt;</button>
            <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">&gt;&gt;&gt;</button>
        </div>

        {/* 일괄 작업 버튼 (우측) */}
        <div className="flex justify-end w-full md:w-1/4">
            {isBatchEditing ? (
                <div className="flex gap-2 animate-fade-in">
                    <button onClick={handleBatchSave} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm font-bold text-sm">
                        <Save size={16} className="mr-2" /> 전체 저장
                    </button>
                    {!disableDelete && (
                        <button onClick={handleBatchDelete} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm font-bold text-sm">
                            <Trash2 size={16} className="mr-2" /> 선택 삭제 ({selectedRows.length})
                        </button>
                    )}
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
    </div>
    
    {/* 에러/성공 모달 */}
    <Modal
      isOpen={isErrorModalOpen}
      onClose={() => setIsErrorModalOpen(false)}
      message={errorMessage}
      title={errorTitle}
      isSuccess={errorTitle.includes('완료')}
    />
    </div>
  );
};

export default StandardDataManagementTable;