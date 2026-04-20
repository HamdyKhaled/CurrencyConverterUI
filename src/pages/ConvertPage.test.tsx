import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConvertPage from '../pages/ConvertPage';

// Mock the ratesService
vi.mock('../services/ratesService', () => ({
  convertCurrency: vi.fn(),
}));

import { convertCurrency } from '../services/ratesService';

const mockConvertCurrency = vi.mocked(convertCurrency);

describe('ConvertPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the conversion form', () => {
    render(<ConvertPage />);

    expect(screen.getByText('Convert Currency')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Convert' })).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    // Make the mock hang to observe loading state
    mockConvertCurrency.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(<ConvertPage />);

    await user.click(screen.getByRole('button', { name: 'Convert' }));

    expect(screen.getByRole('button', { name: 'Converting…' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Converting…' })).toBeDisabled();
  });

  it('displays conversion result on success', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockResolvedValueOnce({
      amount: 1,
      from: 'USD',
      to: 'EUR',
      convertedAmount: 0.92,
    });

    render(<ConvertPage />);

    await user.click(screen.getByRole('button', { name: 'Convert' }));

    await waitFor(() => {
      expect(screen.getByText(/0.92/)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockRejectedValueOnce({
      message: 'Conversion failed',
    });

    render(<ConvertPage />);

    await user.click(screen.getByRole('button', { name: 'Convert' }));

    await waitFor(() => {
      expect(screen.getByText('Conversion failed')).toBeInTheDocument();
    });
  });

  it('displays structured API errors', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockRejectedValueOnce({
      errors: [
        { field: 'From', message: "Currency 'TRY' is restricted" },
      ],
    });

    render(<ConvertPage />);

    await user.click(screen.getByRole('button', { name: 'Convert' }));

    await waitFor(() => {
      expect(screen.getByText("Currency 'TRY' is restricted")).toBeInTheDocument();
    });
  });

  it('has a swap button that swaps currencies', async () => {
    const user = userEvent.setup();
    render(<ConvertPage />);

    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const fromSelect = selects[0];
    const toSelect = selects[1];

    // Default values
    expect(fromSelect.value).toBe('USD');
    expect(toSelect.value).toBe('EUR');

    await user.click(screen.getByTitle('Swap currencies'));

    expect(fromSelect.value).toBe('EUR');
    expect(toSelect.value).toBe('USD');
  });

  it('calls convertCurrency with correct parameters', async () => {
    const user = userEvent.setup();
    mockConvertCurrency.mockResolvedValueOnce({
      amount: 100,
      from: 'USD',
      to: 'EUR',
      convertedAmount: 92,
    });

    render(<ConvertPage />);

    const amountInput = screen.getByRole('spinbutton');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    await user.click(screen.getByRole('button', { name: 'Convert' }));

    await waitFor(() => {
      expect(mockConvertCurrency).toHaveBeenCalledWith({
        amount: 100,
        from: 'USD',
        to: 'EUR',
      });
    });
  });
});
