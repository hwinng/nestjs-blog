import { BlogEntry } from 'src/blog/models/blog.interface';
export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImg?: string;
  blogEntries?: BlogEntry[];
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
