import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatesPage from '../pages/RatesPage';

// Mock the ratesService
vi.mock('../services/ratesService', () => ({
  getLatestRates: vi.fn(),
}));

import { getLatestRates } from '../services/ratesService';

const mockGetLatestRates = vi.mocked(getLatestRates);

describe('RatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    mockGetLatestRates.mockImplementation(() => new Promise(() => {}));
    render(<RatesPage />);
    expect(screen.getByText('Latest Exchange Rates')).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    mockGetLatestRates.mockImplementation(() => new Promise(() => {}));
    render(<RatesPage />);
    expect(screen.getByText('Loading rates…')).toBeInTheDocument();
  });

  it('displays rates after successful fetch', async () => {
    mockGetLatestRates.mockResolvedValueOnce({
      base: 'EUR',
      date: '2024-01-15',
      rates: { USD: 1.1, GBP: 0.85 },
    });

    render(<RatesPage />);

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('GBP')).toBeInTheDocument();
    });
  });

  it('displays error on fetch failure', async () => {
    mockGetLatestRates.mockRejectedValueOnce(new Error('Network error'));

    render(<RatesPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch rates')).toBeInTheDocument();
    });
  });

  it('fetches new rates when base currency changes', async () => {
    const user = userEvent.setup();
    mockGetLatestRates.mockResolvedValue({
      base: 'EUR',
      date: '2024-01-15',
      rates: { USD: 1.1 },
    });

    render(<RatesPage />);

    await waitFor(() => {
      expect(mockGetLatestRates).toHaveBeenCalledWith('EUR');
    });

    const select = screen.getAllByRole('combobox')[0];
    await user.selectOptions(select, 'USD');

    await waitFor(() => {
      expect(mockGetLatestRates).toHaveBeenCalledWith('USD');
    });
  });

  it('filters rates by search input', async () => {
    const user = userEvent.setup();
    mockGetLatestRates.mockResolvedValueOnce({
      base: 'EUR',
      date: '2024-01-15',
      rates: { USD: 1.1, GBP: 0.85, JPY: 160.5 },
    });

    render(<RatesPage />);

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Filter by currency code…'), 'usd');

    // USD appears in both the select option and the table cell - check table cell specifically
    const tableCells = screen.getAllByRole('cell');
    const currencyCells = tableCells.filter((_, i) => i % 2 === 0); // currency name cells
    expect(currencyCells).toHaveLength(1);
    expect(currencyCells[0]).toHaveTextContent('USD');
  });
});
