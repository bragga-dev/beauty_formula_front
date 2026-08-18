export interface ProductOut {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  image_url: string;
  stock: number;
  is_active: boolean;
}

export type ProductPrivateOut = ProductOut;

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export type ProductUpdateInput = Partial<ProductCreateInput> & {
  is_active?: boolean;
};