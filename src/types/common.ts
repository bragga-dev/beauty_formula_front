export interface PageOut<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface MessageOut {
  detail: string;
}

export interface ApiError {
  detail: string | Record<string, unknown>;
  status?: number;
}
