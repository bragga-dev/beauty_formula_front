export type UserRole = "admin" | "client" | "employee";

export interface UserOut {
  id: string;
  email: string;
  role: UserRole;
  role_label?: string;
  is_trusty: boolean;
  is_active: boolean;
  date_joined: string;
  created_at: string;
}

export interface UserAdminOut extends UserOut {
  display_name?: string | null;
  photo_url?: string | null;
}

export type Gender = "male" | "female" | "other";

export interface ClientProfile {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  instagram?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  gender: Gender;
  gender_label: string;
  birth_date?: string | null;
}

export interface EmployeeProfile {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  instagram?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  gender: Gender;
  gender_label: string;
  birth_date?: string | null;
  bio?: string | null;
}

export interface MeOut {
  user: UserOut;
  client?: ClientProfile | null;
  employee?: EmployeeProfile | null;
}

export interface TokenOut {
  access: string;
  refresh: string;
}

export interface SessionOut {
  id: number;
  created_at?: string | null;
  expires_at: string;
}