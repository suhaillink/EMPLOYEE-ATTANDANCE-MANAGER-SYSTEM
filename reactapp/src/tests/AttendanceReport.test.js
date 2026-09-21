import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendanceReport from '../components/AttendanceReport';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('AttendanceReport', () => {
  beforeEach(() => {
    api.getEmployees.mockResolvedValue([
      { employeeId: 'EMPX', name: 'Test X' }
    ]);
    api.getAttendanceReport.mockResolvedValue({ data: {
      employeeId: 'EMPX', presentDays: 2, halfDays: 1, absentDays: 0,
      totalWorkDays: 3, totalWorkHours: 28, averageWorkHours: 7,
      dailyRecords: [
        { date: '2023-07-01', checkInTime: '09:00:00', checkOutTime: '17:30:00', status: 'Present', workHours: 8.5 },
        { date: '2023-07-02', checkInTime: '09:30:00', checkOutTime: null, status: 'Half-day', workHours: 4 }
      ]
    } });
  });

  it('testAttendanceReportDisplay', async () => {
    render(<AttendanceReport />);
    await screen.findByTestId('report-employee-select');
    fireEvent.click(screen.getByTestId('report-submit'));
    await waitFor(() => expect(screen.getByTestId('attendance-report-summary')).toBeInTheDocument());
    expect(screen.getByText('Total Work Days:')).toBeInTheDocument();
    expect(screen.getByText('Present:')).toBeInTheDocument();
    expect(screen.getByText('Half Days:')).toBeInTheDocument();
    expect(screen.getByText('Absent:')).toBeInTheDocument();
    expect(screen.getByText('Total Work Hours:')).toBeInTheDocument();
    expect(screen.getByText('Avg Work Hours:')).toBeInTheDocument();
    expect(screen.getByText('2023-07-01')).toBeInTheDocument();
    expect(screen.getByText('2023-07-02')).toBeInTheDocument();
  });
});
