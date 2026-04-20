import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryPage from '../pages/HistoryPage';

// Mock the ratesService
vi.mock('../services/ratesService', () => ({
  getHistory: vi.fn(),
}));

import { getHistory } from '../services/ratesService';

const mockGetHistory = vi.mocked(getHistory);

function getDateInputs() {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
  return { startInput: inputs[0], endInput: inputs[1] };
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  const { startInput, endInput } = getDateInputs();
  await user.type(startInput, '2024-01-01');
  await user.type(endInput, '2024-01-31');
  await user.click(screen.getByRole('button', { name: 'Search' }));
}

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and search form', () => {
    render(<HistoryPage />);
    expect(screen.getByText('Historical Rates')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows loading state while fetching', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockImplementation(() => new Promise(() => {}));

    render(<HistoryPage />);

    await fillAndSubmit(user);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('displays results with pagination info', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValueOnce({
      base: 'EUR',
      rates: [
        { date: '2024-01-02', rates: { USD: 1.1 } },
        { date: '2024-01-03', rates: { USD: 1.11 } },
      ],
      page: 1,
      pageSize: 10,
      totalCount: 22,
      totalPages: 3,
    });

    render(<HistoryPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('2024-01-02')).toBeInTheDocument();
      expect(screen.getByText('2024-01-03')).toBeInTheDocument();
    });
  });

  it('disables Previous button on first page', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValueOnce({
      base: 'EUR',
      rates: [{ date: '2024-01-02', rates: { USD: 1.1 } }],
      page: 1,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
    });

    render(<HistoryPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '← Previous' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next →' })).not.toBeDisabled();
    });
  });

  it('disables Next button on last page', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValueOnce({
      base: 'EUR',
      rates: [{ date: '2024-01-20', rates: { USD: 1.1 } }],
      page: 2,
      pageSize: 10,
      totalCount: 20,
      totalPages: 2,
    });

    render(<HistoryPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next →' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '← Previous' })).not.toBeDisabled();
    });
  });

  it('displays error on fetch failure', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockRejectedValueOnce(new Error('Network error'));

    render(<HistoryPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch historical rates')).toBeInTheDocument();
    });
  });
});
