import type { UserOut } from "./user";

export interface ManagerOut {
  id: string;
  user: UserOut;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
}

/** Payload de `POST /managers/` (somente admin root). A senha temporária vai por e-mail. */
export interface ManagerCreateInput {
  email: string;
  first_name?: string;
  last_name?: string;
}

/** Payload de `PATCH /managers/{manager_id}`. */
export interface ManagerUpdateInput {
  first_name?: string;
  last_name?: string;
}