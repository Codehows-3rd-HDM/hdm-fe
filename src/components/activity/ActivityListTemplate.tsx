import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  Image as ImageIcon,
  Search,
  Loader2,
  RotateCcw,
} from "lucide-react";
import Modal from "../Modal";
import ActivityFormModal from "./ActivityFormModal";
import Breadcrumb from "../Breadcrumb";
import type { BreadcrumbItem } from "../Breadcrumb";
import type { ReductionActivity } from "../../types/activity";
import {
  fetchActivities,
  fetchActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../apis/activityApi";

const MOCK_ACTIVITIES: ReductionActivity[] = [
  {
    id: 1,
    periodStart: "2025-11-01",
    periodEnd: "2025-11-07",
    activityName: "차량 공회전 제한 캠페인",
    activityDetails:
      "사내 주차장 내 공회전 금지 안내 표지 설치 및 직원 교육 실시. 차량별 공회전 감시 및 위반 시 알림제도 운영.",
    costAmount: 1200000,
    expectedEffect: "연료 절감 및 탄소 배출 감소",
    imageUrl: "https://via.placeholder.com/300x150?text=Campaign",
  },
  {
    id: 2,
    periodStart: "2025-11-08",
    periodEnd: "2025-11-15",
    activityName: "친환경 차량도입(하이브리드)",
    activityDetails:
      "기존 휘발유 차량 2대를 하이브리드 차량으로 교체. 연간 약 2.5톤 CO2 절감 예상.",
    costAmount: 45000000,
    expectedEffect: "CO2 배출량 30% 감소 효과",
    imageUrl: "https://via.placeholder.com/300x150?text=Hybrid+Car",
  },
  {
    id: 3,
    periodStart: "2025-11-16",
    periodEnd: "2025-11-22",
    activityName: "차량 운행 효율화 시스템 도입",
    activityDetails:
      "차량별 운행거리 및 관리 시스템 구축. 운행 효율성 분석 및 운행 경로 최적화.",
    costAmount: 3500000,
    expectedEffect: "운행 거리 단축 및 관리 효율 증대",
    imageUrl: "https://via.placeholder.com/300x150?text=System",
  },
  {
    id: 4,
    periodStart: "2025-11-23",
    periodEnd: "2025-11-30",
    activityName: "차량 정기 점검 강화",
    activityDetails:
      "타이어 공기압, 엔진오일, 필터류 등 정기 점검주기 단축. 차량 상태 유지로 불필요한 연료 소비 방지.",
    costAmount: 2400000,
    expectedEffect: "연비 5% 향상 기대",
    imageUrl: "https://via.placeholder.com/300x150?text=Maintenance",
  },
];

interface ActivityListTemplateProps {
  isAdmin: boolean;
  breadcrumbItems?: BreadcrumbItem[];
}

const ActivityListTemplate: React.FC<ActivityListTemplateProps> = ({
  isAdmin,
  breadcrumbItems,
}) => {
  const [activities, setActivities] = useState<ReductionActivity[]>([]);
  const [filterPeriodStart, setFilterPeriodStart] = useState("");
  const [filterPeriodEnd, setFilterPeriodEnd] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "view"
  );
  const [selectedActivity, setSelectedActivity] =
    useState<ReductionActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
  }>({ open: false, title: "", message: "", isSuccess: true });

  const showNotice = (
    title: string,
    message: string,
    isSuccess: boolean = true
  ) => {
    setNotice({ open: true, title, message, isSuccess });
  };

  const loadActivities = useCallback(
    async (filters?: { periodStart?: string; periodEnd?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchActivities(filters);
        setActivities(data);
      } catch (err) {
        console.error("활동 목록 조회 실패", err);
        setError("활동 목록을 불러오지 못했습니다. 임시 데이터로 표시합니다.");
        setActivities(MOCK_ACTIVITIES);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleRegisterClick = () => {
    setModalMode("create");
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleCardClick = async (activity: ReductionActivity) => {
    setModalMode("view");
    setSelectedActivity(activity);
    setIsModalOpen(true);

    try {
      const full = await fetchActivity(activity.id);
      console.log("[Activity detail] fetched", {
        id: activity.id,
        imageUrls: full.imageUrls,
        imageUrl: full.imageUrl,
      });
      setSelectedActivity(full);
    } catch (err) {
      console.error("활동 상세 조회 실패", err);
      showNotice("조회 실패", "활동 상세를 불러오지 못했습니다.", false);
      setIsModalOpen(false);
    }
  };

  const handleEditClick = async (
    e: React.MouseEvent,
    activity: ReductionActivity
  ) => {
    e.stopPropagation();
    setModalMode("edit");
    setSelectedActivity(activity);
    setIsModalOpen(true);

    try {
      const full = await fetchActivity(activity.id);
      console.log("[Activity edit] fetched", {
        id: activity.id,
        imageUrls: full.imageUrls,
        imageUrl: full.imageUrl,
      });
      setSelectedActivity(full);
    } catch (err) {
      console.error("활동 상세 조회 실패", err);
      showNotice("조회 실패", "활동 상세를 불러오지 못했습니다.", false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((item) => item.id !== id));
      showNotice("삭제 완료", "삭제되었습니다.");
      loadActivities({
        periodStart: filterPeriodStart || undefined,
        periodEnd: filterPeriodEnd || undefined,
      });
    } catch (err) {
      console.error("활동 삭제 실패", err);
      showNotice("삭제 실패", "삭제 중 오류가 발생했습니다.", false);
    }
  };

  const handleSave = async (
    data: ReductionActivity,
    imageFiles: File[] | null
  ) => {
    const files = imageFiles ?? [];

    if (modalMode === "create") {
      const saved = await createActivity(data, files);
      setActivities((prev) => [saved, ...prev]);
      showNotice("등록 완료", "등록되었습니다.");
      // 서버 기준 최신 데이터 재조회
      loadActivities({
        periodStart: filterPeriodStart || undefined,
        periodEnd: filterPeriodEnd || undefined,
      });
      return;
    }

    const updated = await updateActivity(data.id, data, files);
    setActivities((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showNotice("수정 완료", "수정되었습니다.");
    loadActivities({
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
    });
  };

  const handleSearch = () => {
    loadActivities({
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
    });
  };

  const handleResetFilter = () => {
    setFilterPeriodStart("");
    setFilterPeriodEnd("");
    loadActivities();
  };

  const handleExcelDownload = () => {
    if (activities.length === 0) {
      showNotice("다운로드", "다운로드할 데이터가 없습니다.", false);
      return;
    }

    const headers = "ID,활동명,시작일,종료일,소요금액,기대효과,활동내역\n";
    const rows = activities
      .map(
        (item) =>
          `${item.id},"${item.activityName}",${item.periodStart},${
            item.periodEnd
          },${item.costAmount},"${
            item.expectedEffect
          }","${item.activityDetails.replace(/"/g, '""')}"`
      )
      .join("\n");

    const csvactivityDetails = `\ufeff${headers}${rows}`;
    const blob = new Blob([csvactivityDetails], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reduction_activities_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div style={{ padding: 'var(--spacing-lg) var(--padding-container)' }}>
      {/* 브레드크럼 */}
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "저감활동 기록 관리" : "저감활동 기록 조회"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {activities.length}건의 활동이 조회되었습니다.
          </p>
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={handleRegisterClick}
              className="bg-blue-600 text-white rounded-md font-semibold flex items-center gap-2 hover:bg-blue-700"
              style={{ padding: 'var(--padding-btn)' }}
            >
              <Plus size={18} /> 등록
            </button>
          )}

          <button
            onClick={handleExcelDownload}
            className="bg-white border border-green-600 text-green-600 rounded-md font-semibold flex items-center gap-2 hover:bg-green-50"
            style={{ padding: 'var(--padding-btn)' }}
          >
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="bg-white shadow-sm rounded-lg flex flex-wrap items-center gap-3 mb-6" style={{ padding: 'var(--spacing-md)' }}>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar size={18} className="text-gray-500" />
          <span>활동 기간 :</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterPeriodStart}
            onChange={(e) => setFilterPeriodStart(e.target.value)}
            className="border rounded-md text-sm"
            style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={filterPeriodEnd}
            onChange={(e) => setFilterPeriodEnd(e.target.value)}
            className="border rounded-md text-sm"
            style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleSearch}
            className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap flex items-center gap-2"
            title="조회"
          >
            <Search size={16} />
            조회
          </button>
          <button
            onClick={handleResetFilter}
            className="h-10 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-semibold text-sm whitespace-nowrap flex items-center gap-2"
            title="초기화"
          >
            <RotateCcw size={16} />
            초기화
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {/* 게시판 리스트 */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div
          className={`hidden md:grid ${
            isAdmin
              ? "md:grid-cols-[1.2fr_1.2fr_2fr_0.9fr_1fr]"
              : "md:grid-cols-[1.2fr_1.2fr_2fr_1fr]"
          } gap-3 px-4 py-3 text-xs font-semibold text-gray-500 border-b`}
        >
          <div>기간</div>
          <div>제목</div>
          <div>내용</div>
          <div className="text-right">소요금액</div>
          {isAdmin && <div className="text-right">관리</div>}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> 로딩 중...
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="px-4 py-10 text-center text-gray-500">
            조회된 활동이 없습니다.
          </div>
        )}

        {!isLoading &&
          activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleCardClick(activity)}
              className={`grid grid-cols-1 ${
                isAdmin
                  ? "md:grid-cols-[1.2fr_1.2fr_2fr_0.9fr_1fr]"
                  : "md:grid-cols-[1.2fr_1.2fr_2fr_1fr]"
              } gap-3 px-4 py-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors`}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-500" />
                <span>
                  {activity.periodStart} ~ {activity.periodEnd}
                </span>
              </div>

              <div className="flex items-center gap-2 font-semibold text-gray-800">
                {activity.imageUrl && (
                  <ImageIcon size={16} className="text-blue-600" />
                )}
                <span className="truncate">{activity.activityName}</span>
              </div>

              <div className="text-sm text-gray-600 line-clamp-2 md:line-clamp-1">
                {activity.activityDetails}
              </div>

              <div className="text-right text-lg font-bold text-green-600">
                {activity.costAmount.toLocaleString()}원
              </div>

              {isAdmin && (
                <div className="flex md:justify-end gap-2 text-sm">
                  <button
                    onClick={(e) => handleEditClick(e, activity)}
                    className="border rounded-md text-blue-600 border-blue-100 hover:bg-blue-50"
                    style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, activity.id)}
                    className="border rounded-md text-red-600 border-red-100 hover:bg-red-50"
                    style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedActivity}
        onSave={handleSave}
      />

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

export default ActivityListTemplate;
