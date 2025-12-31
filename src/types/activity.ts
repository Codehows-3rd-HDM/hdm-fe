export interface ReductionActivity {
  id: number;
  periodStart: string; // 시작일
  periodEnd: string; // 종료일
  activityName: string; // 활동명
  activityDetails: string; // 활동내용
  costAmount: number; // 소요금액
  expectedEffect: string; // 기대효과
  imageUrl?: string; // 대표 사진 URL
  imageUrls?: string[]; // 모든 사진 URL
}
