export interface ReductionActivity {
  id: number;
  periodStart: string; // 시작일
  periodEnd: string; // 종료일
  activityName: string; // 활동명
  activityDetails: string; // 활동내용
  costAmount: number; // 소요금액
  expectedEffect: string; // 기대효과
  imageUrl?: string; // 사진 URL (더미 이미지용)
}
