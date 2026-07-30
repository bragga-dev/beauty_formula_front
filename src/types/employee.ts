import type { ServiceOut } from "./service";
import type { UserOut, Gender } from "./user";

export interface EmployeeOut {
  id: string;
  user: UserOut;
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

export interface EmployeeServiceLinkOut {
  id: string;
  service_id: string;
  service: ServiceOut;
}

export interface EmployeeTeamOut {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  instagram?: string | null;
}

export interface EmployeeTeamDetailOut extends EmployeeTeamOut {
  services: EmployeeServiceLinkOut[];
}

export interface EmployeeServiceOut {
  id: string;
  service_id: string;
  service: ServiceOut;
  is_active: boolean;
  created_at: string;
}
