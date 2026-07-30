export interface ServiceOut {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  image_url: string;
  duration_minutes: number;
}

export interface ServicePrivateOut extends ServiceOut {
  is_active: boolean;
}

export interface ServiceCreateInput {
  name: string;
  description?: string;
  price: number;
  commission_percentage?: number;
  duration_minutes?: number;
}

export type ServiceUpdateInput = Partial<ServiceCreateInput>;
