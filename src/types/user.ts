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

// Os valores do enum batem 1:1 com o backend (core.constants.gender.Gender) —
// que usa os rótulos em português como o próprio valor armazenado, não
// "male"/"female"/"other". Mandar valor em inglês faz o Ninja rejeitar
// com erro de validação (uma lista, não string) e travar a UI que tenta
// renderizar isso como texto.
export type Gender = "Masculino" | "Feminino" | "Outro";

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

export interface AccessTokenOut {
  access: string;
}

export interface EmployeeCreatedOut {
  email: string;
}

export interface SessionOut {
  id: number;
  created_at?: string | null;
  expires_at: string;
}