export interface ReductionActivity {
  id: number;
  startDate: string; // 시작일
  endDate: string;   // 종료일
  title: string;     // 활동명
  content: string;   // 활동내용
  cost: number;      // 소요금액
  effect: string;    // 기대효과
  imageUrl?: string; // 사진 URL (더미 이미지용)
}