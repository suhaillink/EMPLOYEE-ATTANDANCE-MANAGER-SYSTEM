import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmployeeDetails from '../components/EmployeeDetails';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('EmployeeDetails', () => {
  beforeEach(() => {
    api.getEmployeeById.mockReset();
    api.getAttendanceReport.mockReset();
  });

  it('renders employee details', async () => {
    api.getEmployeeById.mockResolvedValue({
      employeeId: 'EMP123',
      name: 'Rick',
      email: 'rick@rk.com',
      department: 'OPS',
      position: 'Ops Lead',
      joiningDate: '2024-01-01'
    });
    api.getAttendanceReport.mockResolvedValue({ data: { dailyRecords: [] } });
    render(
      <MemoryRouter initialEntries={['/employees/EMP123']}>
        <Routes>
          <Route path='/employees/:id' element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByText('Rick');
    expect(screen.getByText(/Employee ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText(/Department:/)).toBeInTheDocument();
    expect(screen.getByText(/Position:/)).toBeInTheDocument();
    expect(screen.getByText(/Joining Date:/)).toBeInTheDocument();
  });

  it('shows error when employee not found', async () => {
    api.getEmployeeById.mockRejectedValue({});
    render(
      <MemoryRouter initialEntries={['/employees/NOTFOUND']}>
        <Routes>
          <Route path='/employees/:id' element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByText('Employee not found');
  });
});
