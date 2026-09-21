import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendanceControl from '../components/AttendanceControl';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('AttendanceControl', () => {
  beforeEach(() => {
    api.getEmployees.mockResolvedValue([
      { employeeId: 'EMP101', name: 'Alpha' },
      { employeeId: 'EMP102', name: 'Bravo' }
    ]);
    api.checkInAttendance.mockResolvedValue({ data: { status: 'Present' } });
    api.checkOutAttendance.mockResolvedValue({ data: { status: 'Present' } });
  });

  it('renders employee dropdown and current datetime', async () => {
    render(<AttendanceControl />);
    expect(screen.getByText('Attendance Control')).toBeInTheDocument();
    await screen.findByTestId('employee-select');
    expect(screen.getByTestId('employee-select').options.length).toBeGreaterThan(0);
    // Instead look for text "Date & Time" as visible label
    expect(screen.getByText(/Date & Time/)).toBeInTheDocument();
  });

  it('can check-in and display success', async () => {
    render(<AttendanceControl />);
    fireEvent.click(await screen.findByTestId('check-in-btn'));
    await waitFor(() => expect(screen.getByTestId('attendance-message')).toHaveTextContent(/successful/));
  });

  it('can check-out and handle error', async () => {
    api.checkOutAttendance.mockResolvedValue({ error: 'Already checked out' });
    render(<AttendanceControl />);
    fireEvent.click(await screen.findByTestId('check-out-btn'));
    await waitFor(() => expect(screen.getByTestId('attendance-message')).toHaveTextContent(/Already checked out/));
  });
});
