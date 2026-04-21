import { useState, useEffect, type FormEvent } from 'react';
import { getHistory, getSupportedCurrencies } from '../services/ratesService';
import type { HistoricalRatesResponse } from '../types/api';

const FALLBACK_BASE_OPTIONS = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

export default function HistoryPage() {
  const [base, setBase] = useState('EUR');
  const [baseOptions, setBaseOptions] = useState<string[]>(FALLBACK_BASE_OPTIONS);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<HistoricalRatesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSupportedCurrencies()
      .then(setBaseOptions)
      .catch(() => setBaseOptions(FALLBACK_BASE_OPTIONS));
  }, []);

  async function fetchData(p = page) {
    if (!start || !end) return;
    setLoading(true);
    setError('');
    try {
      const result = await getHistory(base, start, end, p, pageSize);
      setData(result);
      setPage(p);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'errors' in err &&
        Array.isArray((err as { errors: unknown[] }).errors)
      ) {
        const messages = (err as { errors: { message: string }[] }).errors
          .map((e) => e.message)
          .join(' ');
        setError(messages);
      } else {
        setError('Failed to fetch historical rates');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (end < start) {
      setError('End date must not be earlier than start date.');
      return;
    }
    fetchData(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Historical Rates
      </h1>

      {/* Search form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Results table */}
      {data && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-500 mb-4">
            Base: <span className="font-semibold">{data.base}</span> &middot;
            Showing {data.rates.length} of {data.totalCount} results
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 font-semibold text-gray-600 sticky left-0 bg-white">
                    Date
                  </th>
                  {data.rates.length > 0 &&
                    Object.keys(data.rates[0].rates).map((c) => (
                      <th
                        key={c}
                        className="py-2 px-3 font-semibold text-gray-600 text-right"
                      >
                        {c}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.rates.map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 font-medium text-gray-800 sticky left-0 bg-white whitespace-nowrap">
                      {day.date}
                    </td>
                    {Object.values(day.rates).map((rate, i) => (
                      <td
                        key={i}
                        className="py-2 px-3 text-right text-gray-600 tabular-nums"
                      >
                        {rate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(data.page - 1)}
                disabled={data.page <= 1 || loading}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => fetchData(data.page + 1)}
                disabled={data.page >= data.totalPages || loading}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
