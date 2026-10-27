export interface UniversityClass {
  id: string;
  name: string;
  type: string;
  startTime: string;   // "08:30"
  endTime: string;      // "10:00"
  room: string;
  building: string;
  lecturer: string;
  subgroup: number;     // 0 = все, 1 или 2
  isCanceled: boolean;
  isMoved: boolean;
  movedTo?: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  owner: "emil" | "yasya" | "both";
  color: string;
}

export interface FreeWindow {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}