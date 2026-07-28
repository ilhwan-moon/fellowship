export type Participant = {
  /** 화면 내에서만 쓰는 고유 키 (memberId 또는 guest-<random>) */
  key: string;
  name: string;
  photoUrl: string | null;
  memberId: string | null;
  groupName: string | null;
};

export type LadderResultEntry = Participant & {
  orderNo: number;
};
