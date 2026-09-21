import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import EmployeeForm from '../components/EmployeeForm';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('EmployeeForm', () => {
  beforeEach(() => {
    api.createEmployee.mockReset();
  });

  it('shows validation errors on empty submit', async () => {
    render(<EmployeeForm />);
    fireEvent.click(screen.getByTestId('add-button'));
    expect(await screen.findByText(/Employee ID must follow/)).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText(/Must be a valid email/)).toBeInTheDocument();
    expect(screen.getByText('Department is required')).toBeInTheDocument();
    expect(screen.getByText('Position is required')).toBeInTheDocument();
    expect(screen.getByText('Joining date is required')).toBeInTheDocument();
  });

  it('shows server error on failed creation', async () => {
    api.createEmployee.mockResolvedValue({ error: 'Duplicate employeeId' });
    render(<EmployeeForm />);
    fireEvent.change(screen.getByTestId('employeeId-input'), { target: { value: 'EMP999' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Jane Junit' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'jane@junit.com' } });
    fireEvent.change(screen.getByTestId('department-input'), { target: { value: 'QA' } });
    fireEvent.change(screen.getByTestId('position-input'), { target: { value: 'QA Engineer' } });
    fireEvent.change(screen.getByTestId('joiningDate-input'), { target: { value: '2023-07-12' } });
    fireEvent.click(screen.getByTestId('add-button'));
    expect(await screen.findByText('Duplicate employeeId')).toBeInTheDocument();
  });

  it('submits valid employee', async () => {
    api.createEmployee.mockResolvedValue({ data: { employeeId: 'EMP009', name: 'E F' } });
    render(<EmployeeForm />);
    fireEvent.change(screen.getByTestId('employeeId-input'), { target: { value: 'EMP009' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'E F' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'ef@test.com' } });
    fireEvent.change(screen.getByTestId('department-input'), { target: { value: 'DevOps' } });
    fireEvent.change(screen.getByTestId('position-input'), { target: { value: 'Sys Admin' } });
    fireEvent.change(screen.getByTestId('joiningDate-input'), { target: { value: '2023-10-20' } });
    fireEvent.click(screen.getByTestId('add-button'));
    await waitFor(() => {
      expect(screen.getByText(/Employee created successfully/)).toBeInTheDocument();
    });
  });
});
