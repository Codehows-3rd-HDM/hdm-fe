import React, { useState, useMemo } from "react";
import { Download, Calendar, Edit2, Trash2, Plus } from "lucide-react";
import ActivityFormModal from "./ActivityFormModal";
import { type ReductionActivity } from "../../types/activity";
import { createActivity } from "../../apis/activityApi";

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
}

const ActivityListTemplate: React.FC<ActivityListTemplateProps> = ({
  isAdmin,
}) => {
  const [activities, setActivities] =
    useState<ReductionActivity[]>(MOCK_ACTIVITIES);
  const [filterperiodStart, setFilterperiodStart] = useState("");
  const [filterperiodEnd, setFilterperiodEnd] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "view"
  );
  const [selectedActivity, setSelectedActivity] =
    useState<ReductionActivity | null>(null);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (!filterperiodStart && !filterperiodEnd) return true;

      const actStart = new Date(activity.periodStart);
      const actEnd = new Date(activity.periodEnd);
      const filterStart = filterperiodStart
        ? new Date(filterperiodStart)
        : null;
      const filterEnd = filterperiodEnd ? new Date(filterperiodEnd) : null;

      if (filterStart && actEnd < filterStart) return false;
      if (filterEnd && actStart > filterEnd) return false;

      return true;
    });
  }, [activities, filterperiodStart, filterperiodEnd]);

  const handleRegisterClick = () => {
    setModalMode("create");
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleCardClick = (activity: ReductionActivity) => {
    setModalMode("view");
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    activity: ReductionActivity
  ) => {
    e.stopPropagation();
    setModalMode("edit");
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setActivities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSave = async (data: ReductionActivity, imageFiles: File[]) => {
    if (modalMode === "create") {
      const saved = await createActivity(data, imageFiles);
      setActivities((prev) => [saved, ...prev]);
      alert("등록되었습니다.");
    } else {
      setActivities((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      alert("수정되었습니다.");
    }
  };

  const handleExcelDownload = () => {
    if (filteredActivities.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const headers = "ID,활동명,시작일,종료일,소요금액,기대효과,활동내역\n";
    const rows = filteredActivities
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
    <div className="px-6 py-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "저감활동 기록 관리" : "저감활동 기록 조회"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {filteredActivities.length}건의 활동이 조회되었습니다.
          </p>
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={handleRegisterClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={18} /> 등록
            </button>
          )}

          <button
            onClick={handleExcelDownload}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md font-semibold flex items-center gap-2 hover:bg-green-50"
          >
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="bg-white shadow-sm rounded-lg p-5 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            활동 기간 :
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterperiodStart}
            onChange={(e) => setFilterperiodStart(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={filterperiodEnd}
            onChange={(e) => setFilterperiodEnd(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {(filterperiodStart || filterperiodEnd) && (
          <button
            onClick={() => {
              setFilterperiodStart("");
              setFilterperiodEnd("");
            }}
            className="text-xs text-gray-500 underline ml-auto"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => handleCardClick(activity)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg transition p-0 relative overflow-hidden"
          >
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={(e) => handleEditClick(e, activity)}
                  className="bg-white/90 border border-gray-200 p-2 rounded-md shadow-sm hover:bg-blue-50"
                >
                  <Edit2 size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, activity.id)}
                  className="bg-white/90 border border-gray-200 p-2 rounded-md shadow-sm hover:bg-red-50"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            )}

            <div className="p-5">
              <div className="text-base font-bold text-gray-800 mb-2 pr-14 leading-tight">
                {activity.activityName}
              </div>

              <div className="text-xs text-gray-500 mb-3 flex items-center">
                <Calendar size={12} className="mr-1" />
                {activity.periodStart} ~ {activity.periodEnd}
              </div>

              <div className="w-full h-44 bg-gray-100 rounded-md overflow-hidden mb-4 flex items-center justify-center">
                {activity.imageUrl ? (
                  <img
                    src={activity.imageUrl}
                    alt={activity.activityName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-300 text-sm">No Image</span>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-5 mb-4 line-clamp-2">
                {activity.activityDetails}
              </p>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">소요금액</span>
                <span className="text-lg font-bold text-green-600">
                  {activity.costAmount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-12">
        <div className="flex gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 cursor-pointer">← Prev</span>
          <span className="px-3 py-1 font-bold border-b-2 border-gray-800 text-gray-900">
            1
          </span>
          <span className="px-3 py-1 cursor-pointer">2</span>
          <span className="px-3 py-1 cursor-pointer">3</span>
          <span className="px-3 py-1 cursor-pointer">Next →</span>
        </div>
      </div>

      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedActivity}
        onSave={handleSave}
      />
    </div>
  );
};

export default ActivityListTemplate;
