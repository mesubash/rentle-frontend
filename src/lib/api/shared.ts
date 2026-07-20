export type UUID = string;

export type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  timestamp: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type RequestQuery = Record<
  string,
  string | number | boolean | null | undefined
>;
