import type {
  ConvertRequest,
  ConvertResponse,
  HistoricalRatesResponse,
  LatestRatesResponse,
} from '../types/api';
import { api } from './apiClient';

export function getLatestRates(base = 'EUR') {
  return api.get<LatestRatesResponse>(`/rates/latest?base_=${base}`);
}

export function convertCurrency(req: ConvertRequest) {
  return api.post<ConvertResponse>('/rates/convert', req);
}

export function getHistory(
  base: string,
  start: string,
  end: string,
  page = 1,
  pageSize = 10,
) {
  return api.get<HistoricalRatesResponse>(
    `/rates/history?base_=${base}&start=${start}&end=${end}&page=${page}&pageSize=${pageSize}`,
  );
}
