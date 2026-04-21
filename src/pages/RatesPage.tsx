import { useEffect, useState } from 'react';
import { getLatestRates, getSupportedCurrencies } from '../services/ratesService';
import type { LatestRatesResponse } from '../types/api';

const FALLBACK_BASE_OPTIONS = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

export default function RatesPage() {
  const [base, setBase] = useState('EUR');
  const [baseOptions, setBaseOptions] = useState<string[]>(FALLBACK_BASE_OPTIONS);
  const [data, setData] = useState<LatestRatesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSupportedCurrencies()
      .then(setBaseOptions)
      .catch(() => setBaseOptions(FALLBACK_BASE_OPTIONS));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getLatestRates(base)
      .then(setData)
      .catch(() => setError('Failed to fetch rates'))
      .finally(() => setLoading(false));
  }, [base]);

  const filteredRates = data
    ? Object.entries(data.rates).filter(([currency]) =>
        currency.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Latest Exchange Rates
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Currency
            </label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {baseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Currency
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by currency code…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400 animate-pulse">
            Loading rates…
          </div>
        ) : data ? (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Base: <span className="font-semibold">{data.base}</span> &middot;
              Date: {data.date}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-4 text-sm font-semibold text-gray-600">
                      Currency
                    </th>
                    <th className="py-2 px-4 text-sm font-semibold text-gray-600 text-right">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map(([currency, rate]) => (
                    <tr
                      key={currency}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-2.5 px-4 font-medium text-gray-800">
                        {currency}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600 tabular-nums">
                        {rate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRates.length === 0 && (
              <p className="text-center py-6 text-gray-400">
                No currencies match your search.
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
