// Auth
export interface TokenRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
}

// Latest Rates
export interface LatestRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Convert
export interface ConvertRequest {
  amount: number;
  from: string;
  to: string;
}

export interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  convertedAmount: number;
}

// History
export interface HistoricalRatesRequest {
  base: string;
  start: string;
  end: string;
  page: number;
  pageSize: number;
}

export interface DailyRate {
  date: string;
  rates: Record<string, number>;
}

export interface HistoricalRatesResponse {
  base: string;
  rates: DailyRate[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Errors
export interface ApiError {
  message?: string;
  errors?: { field: string; message: string }[];
}
