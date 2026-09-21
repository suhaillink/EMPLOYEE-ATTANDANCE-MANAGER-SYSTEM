import React, { useState } from 'react';
import * as api from '../utils/api';

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: '',
    position: '',
    joiningDate: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const empIdRegex = /^EMP\d{3}$/;
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!formData.employeeId || !empIdRegex.test(formData.employeeId)) {
      errs.employeeId = "Employee ID must follow format 'EMP' followed by 3 digits";
    }

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Name is required';
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      errs.email = 'Must be a valid email';
    }

    if (!formData.department || !formData.department.trim()) {
      errs.department = 'Department is required';
    }

    if (!formData.position || !formData.position.trim()) {
      errs.position = 'Position is required';
    }

    if (!formData.joiningDate || !formData.joiningDate.trim()) {
      errs.joiningDate = 'Joining date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.createEmployee(formData);
      if (response && response.error) {
        setServerError(response.error);
      } else {
        setSuccessMessage('Employee created successfully');
        setFormData({
          employeeId: '',
          name: '',
          email: '',
          department: '',
          position: '',
          joiningDate: '',
          password: '',
        });
        setErrors({});
      }
    } catch (err) {
      setServerError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Employee</h1>
          <p className="page-subtitle">Register a new employee profile in the attendance tracking system.</p>
        </div>
        <a href="/employees" className="btn btn-outline">
          ← Back to Employees
        </a>
      </div>

      <div className="card form-card">
        {serverError && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="employeeId" className="form-label">
                Employee ID <span className="required">*</span>
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="e.g. EMP101"
                data-testid="employeeId-input"
                className={`form-control ${errors.employeeId ? 'is-invalid' : ''}`}
                value={formData.employeeId}
                onChange={handleChange}
              />
              {errors.employeeId && <div className="invalid-feedback">{errors.employeeId}</div>}
              <small className="form-hint">Format: EMP followed by 3 digits (e.g. EMP001, EMP101)</small>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Sarah Connor"
                data-testid="name-input"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. sarah@company.com"
                data-testid="email-input"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department <span className="required">*</span>
              </label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Engineering, HR, Sales"
                data-testid="department-input"
                className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <div className="invalid-feedback">{errors.department}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="position" className="form-label">
                Job Position <span className="required">*</span>
              </label>
              <input
                id="position"
                name="position"
                type="text"
                placeholder="e.g. Senior Software Engineer"
                data-testid="position-input"
                className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                value={formData.position}
                onChange={handleChange}
              />
              {errors.position && <div className="invalid-feedback">{errors.position}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="joiningDate" className="form-label">
                Joining Date <span className="required">*</span>
              </label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                data-testid="joiningDate-input"
                className={`form-control ${errors.joiningDate ? 'is-invalid' : ''}`}
                value={formData.joiningDate}
                onChange={handleChange}
              />
              {errors.joiningDate && <div className="invalid-feedback">{errors.joiningDate}</div>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="password" className="form-label">
                Account Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Leave blank for default password: Default@123"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
              <small className="form-hint">Default password is <strong>Default@123</strong> if left blank.</small>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              data-testid="add-button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {loading ? 'Creating Employee...' : 'Add Employee'}
            </button>
            <a href="/employees" className="btn btn-secondary">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
