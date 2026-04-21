import { useState, useEffect, type FormEvent } from 'react';
import { convertCurrency, getSupportedCurrencies } from '../services/ratesService';
import type { ConvertResponse, ApiError } from '../types/api';

const FALLBACK_CURRENCIES = [
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
  'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR',
  'ISK', 'JPY', 'KRW', 'MYR', 'NOK', 'NZD', 'PHP', 'RON',
  'SEK', 'SGD', 'USD', 'ZAR',
];

export default function ConvertPage() {
  const [currencies, setCurrencies] = useState<string[]>(FALLBACK_CURRENCIES);
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSupportedCurrencies()
      .then(setCurrencies)
      .catch(() => setCurrencies(FALLBACK_CURRENCIES));
  }, []);

  function swap() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (from === to) {
      setError('"From" and "To" currencies must be different.');
      return;
    }
    setLoading(true);
    try {
      const data = await convertCurrency({
        amount: Number(amount),
        from,
        to,
      });
      setResult(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.errors) {
        setError(apiErr.errors.map((e) => e.message).join(', '));
      } else {
        setError(apiErr.message ?? 'Conversion failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Convert Currency
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-5"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
            required
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            className="px-3 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-xl"
            title="Swap currencies"
          >
            ⇄
          </button>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Converting…' : 'Convert'}
        </button>

        {result && (
          <div className="mt-2 p-5 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">
              {result.amount.toLocaleString()} {result.from} =
            </p>
            <p className="text-3xl font-bold text-green-700">
              {result.convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{' '}
              {result.to}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
