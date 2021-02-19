export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImg?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
