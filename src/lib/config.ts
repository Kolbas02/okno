export const SCHEDULE_API = "https://lk.gubkin.ru/schedule/api/api.php";

export const USERS = {
  emil: {
    groupId: "9716",    // КВ-24-07
    subgroup: 1 as 1 | 2,
    name: "Эмиль",
  },
  yasya: {
    groupId: "10194",    // ← ЗАМЕНИ на реальный groupId Яси
    subgroup: 1 as 1 | 2,
    name: "Яся",
  },
} as const;