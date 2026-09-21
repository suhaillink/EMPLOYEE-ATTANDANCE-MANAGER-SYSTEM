import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../utils/api';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    joiningDate: '',
    password: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    let isMounted = true;
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(false);
      try {
        const empData = await api.getEmployeeById(id);
        if (!empData) {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }
        if (isMounted) {
          setEmployee(empData);
          setEditFormData({
            name: empData.name || '',
            email: empData.email || '',
            department: empData.department || '',
            position: empData.position || '',
            joiningDate: empData.joiningDate || '',
            password: '',
          });
        }

        try {
          const reportData = await api.getAttendanceReport(empData.employeeId || id);
          if (isMounted && reportData) {
            setReport(reportData.data || reportData);
          }
        } catch (repErr) {
          // ignore report error
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployeeDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      setSaveError('Name and Email are required.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        department: editFormData.department.trim(),
        position: editFormData.position.trim(),
        joiningDate: editFormData.joiningDate,
      };
      if (editFormData.password && editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      const res = await api.updateEmployee(employee.employeeId || id, payload);
      if (res && res.error) {
        setSaveError(res.error);
      } else {
        const updated = res.data || { ...employee, ...payload };
        setEmployee(updated);
        setSaveSuccess('Employee details updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setSaveError('Failed to update employee details.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">Loading employee profile...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="page-container">
        <div className="card text-center" style={{ padding: '3rem' }}>
          <h2 className="text-danger">Employee not found</h2>
          <p className="page-subtitle" style={{ margin: '1rem 0 2rem' }}>
            The requested employee profile could not be found or does not exist.
          </p>
          <div>
            <a href="/employees" className="btn btn-primary">
              ← Back to Employee List
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Employee Management Profile' : 'My Employment Profile'}</h1>
          <p className="page-subtitle">Detailed information and attendance statistics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/employees" className="btn btn-outline">
            ← Back to List
          </a>
          {isAdmin && (
            <button
              type="button"
              className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => {
                setIsEditing(!isEditing);
                setSaveError('');
                setSaveSuccess('');
              }}
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Details'}
            </button>
          )}
          <a href="/attendance" className="btn btn-outline">
            ⏱️ Record Attendance
          </a>
        </div>
      </div>

      {saveSuccess && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{saveSuccess}</div>}
      {saveError && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{saveError}</div>}

      {/* Edit Form Card for Admin */}
      {isAdmin && isEditing && (
        <div className="card" style={{ marginBottom: '2rem', border: '1.5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ margin: 0, color: 'var(--primary)' }}>
              ✏️ Edit Employee Details: [{employee.employeeId || id}]
            </h3>
            <span className="badge badge-primary">Admin Access Only</span>
          </div>

          <form onSubmit={handleSaveEdit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={editFormData.department}
                  onChange={handleEditChange}
                  placeholder="e.g. Engineering, HR, QA"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Position</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={editFormData.position}
                  onChange={handleEditChange}
                  placeholder="e.g. Senior Developer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  className="form-control"
                  value={editFormData.joiningDate}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={editFormData.password}
                  onChange={handleEditChange}
                  placeholder="Leave blank to keep existing password"
                />
                <small className="form-hint">Only type if you need to reset employee's password.</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving Changes...' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="details-grid">
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              {(employee.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="badge badge-secondary" style={{ marginTop: '0.5rem' }}>
              {employee.position || 'Staff'}
            </span>
          </div>

          <div className="profile-details-list" style={{ marginTop: '1.5rem' }}>
            <div className="detail-item">
              <span className="detail-label">Employee ID:</span>
              <span className="detail-value">{employee.employeeId || id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{employee.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{employee.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{employee.department || 'General'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Position:</span>
              <span className="detail-value">{employee.position || 'Employee'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Joining Date:</span>
              <span className="detail-value">{employee.joiningDate || 'N/A'}</span>
            </div>
          </div>

          {isAdmin && !isEditing && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={() => {
                setIsEditing(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              ✏️ Edit This Profile
            </button>
          )}
        </div>

        <div className="card attendance-summary-card">
          <h3 className="card-title">Attendance Overview</h3>
          {report ? (
            <div>
              <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                  <div className="stat-label">Total Days</div>
                  <div className="stat-value">{report.totalWorkDays ?? 0}</div>
                </div>
                <div className="stat-card stat-success">
                  <div className="stat-label">Present</div>
                  <div className="stat-value">{report.presentDays ?? 0}</div>
                </div>
                <div className="stat-card stat-warning">
                  <div className="stat-label">Half Days</div>
                  <div className="stat-value">{report.halfDays ?? 0}</div>
                </div>
                <div className="stat-card stat-info">
                  <div className="stat-label">Total Hours</div>
                  <div className="stat-value">{report.totalWorkHours ?? 0} hrs</div>
                </div>
              </div>

              {report.dailyRecords && report.dailyRecords.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.dailyRecords.slice(0, 5).map((rec, i) => (
                        <tr key={i}>
                          <td>{rec.date}</td>
                          <td>{rec.checkInTime || '-'}</td>
                          <td>{rec.checkOutTime || '-'}</td>
                          <td>
                            <span className={`badge badge-${rec.status === 'Present' ? 'success' : 'warning'}`}>
                              {rec.status}
                            </span>
                          </td>
                          <td>{rec.workHours ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="empty-state-text">No attendance records generated yet for this employee.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
