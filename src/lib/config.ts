export const USERS = {
  emil: {
    name: "Эмиль",
    groupId: 9716,
    groupName: "КВ-24-07",
    subgroup: "КВ-24-07_1",
  },
  yasya: {
    name: "Яся",
    groupId: 10194,
    groupName: "КН-25-09",
    subgroup: "КН-25-09_2",
  },
} as const;

export const SCHEDULE_API = "https://lk.gubkin.ru/schedule-api/activities";

export const TIME_SLOTS = { start: 8, end: 22 } as const;