export interface UniversityClass {
  id: number;
  date: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  type: string;
  name: string;
  note: string;
  lecturer: string;
  room: string;
  building: string;
  subgroup: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  owner: "emil" | "yasya" | "both";
  color?: string;
}

export interface FreeWindow {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}