import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeList from '../components/EmployeeList';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('EmployeeList', () => {
  const mockEmployees = [
    { employeeId: 'EMP001', name: 'John Doe', department: 'Engineering', position: 'Dev' },
    { employeeId: 'EMP002', name: 'Jane Smith', department: 'Sales', position: 'Sales Rep' }
  ];
  beforeEach(() => {
    api.getEmployees.mockResolvedValue([...mockEmployees]);
  });

  it('renderEmployeeListComponent', async () => {
    render(<EmployeeList />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    await screen.findByText('John Doe');
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getAllByText('View Details').length).toBe(2);
  });

  it('filters by department', async () => {
    render(<EmployeeList />);
    await screen.findByText('John Doe');
    fireEvent.change(screen.getByTestId('department-filter'), { target: { value: 'Sales' } });
    await waitFor(() => expect(api.getEmployees).toHaveBeenCalledWith('Sales'));
  });
});
