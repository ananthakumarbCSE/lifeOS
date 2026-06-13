export interface User {
  _id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  defaultView: 'canvas' | 'matrix' | 'weekly';
  workHoursPerDay: number;
  weekStartDay: number;
}
