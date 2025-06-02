import { AppRole } from './app-role'; // Adjust the path accordingly

export interface AppUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; 
  appRoles: AppRole[];
  societes: any[];
}