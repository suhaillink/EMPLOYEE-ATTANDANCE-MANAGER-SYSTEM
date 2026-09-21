import React, { useState, useEffect } from 'react';
import * as api from '../utils/api';

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
};

const Corrections = () => {
  const [corrections, setCorrections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myEmployee, setMyEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userRole = localStorage.getItem('role') || 'EMPLOYEE';
  const isAdmin = userRole === 'ADMIN';
  const userEmail = localStorage.getItem('email') || '';
  const storedEmpId = localStorage.getItem('employeeId') || '';

  useEffect(() => {
    fetchCorrections();
    api.getEmployees().then((data) => {
      if (Array.isArray(data)) {
        setEmployees(data);
        if (isAdmin) {
          if (data.length > 0) {
            setFormData((f) => ({ ...f, employeeId: data[0].employeeId || data[0].id || '' }));
          }
        } else {
          const me = data.find(
            (e) => (e.email && e.email.toLowerCase() === userEmail.toLowerCase()) ||
                   (storedEmpId && e.employeeId === storedEmpId)
          );
          if (me) {
            setMyEmployee(me);
            setFormData((f) => ({ ...f, employeeId: me.employeeId || me.id || '' }));
          } else if (data.length > 0) {
            setFormData((f) => ({ ...f, employeeId: data[0].employeeId || data[0].id || '' }));
          }
        }
      }
    }).catch(() => {});
  }, [isAdmin, userEmail, storedEmpId]);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const data = await api.getCorrections();
      setCorrections(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load correction requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetEmpId = !isAdmin && myEmployee ? (myEmployee.employeeId || myEmployee.id) : formData.employeeId;
    if (!targetEmpId || !formData.date || !formData.reason.trim()) {
      setError('Date and reason are required.');
      return;
    }

    try {
      await api.submitCorrection({
        ...formData,
        employeeId: targetEmpId,
      });
      setSuccess('Correction request submitted successfully!');
      setFormData({
        employeeId: targetEmpId,
        date: '',
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
      });
      setShowForm(false);
      fetchCorrections();
    } catch {
      setError('Failed to submit correction request.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateCorrectionStatus(id, status);
      setCorrections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      setSuccess(`Request marked as ${status}`);
    } catch {
      setError('Failed to update status.');
    }
  };

  // Filter corrections: Employees only see their own requests
  const visibleCorrections = corrections.filter((c) => {
    if (isAdmin) return true;
    const cEmail = c.user?.email || '';
    const cEmpId = c.user?.employeeId || c.employeeId || '';
    return (
      (userEmail && cEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (storedEmpId && cEmpId === storedEmpId) ||
      (myEmployee && (cEmpId === myEmployee.employeeId || c.user?.id === myEmployee.id))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Review Attendance Corrections' : 'My Correction Requests'}</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Approve or reject attendance adjustment requests submitted by staff members.'
              : 'Submit a request to adjust missed or incorrect check-in/check-out stamps.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title">New Correction Request</h3>
          <form onSubmit={handleSubmitRequest}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{isAdmin ? 'Select Employee' : 'Requesting For'}</label>
                {isAdmin ? (
                  <select
                    className="form-control"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                        [{emp.employeeId}] {emp.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={myEmployee ? `[${myEmployee.employeeId}] ${myEmployee.name}` : userEmail}
                  />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Requested Check-In</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.requestedCheckIn}
                  onChange={(e) => setFormData({ ...formData, requestedCheckIn: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Requested Check-Out</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.requestedCheckOut}
                  onChange={(e) => setFormData({ ...formData, requestedCheckOut: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reason for Correction <span className="required">*</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain why a correction is needed (e.g. Forgot to punch out due to client meeting)..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : visibleCorrections.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No correction requests found</p>
            <p className="empty-state-text">
              {isAdmin
                ? 'Pending staff adjustment requests will appear here.'
                : 'You have not submitted any correction requests.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Date</th>
                  <th>Req. Check-In</th>
                  <th>Req. Check-Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleCorrections.map((c) => (
                  <tr key={c.id}>
                    {isAdmin && (
                      <td>
                        <strong>{c.user?.name || c.employeeId || 'Staff'}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                          {c.user?.employeeId || c.employeeId || ''}
                        </span>
                      </td>
                    )}
                    <td>{c.attendanceDate || c.date}</td>
                    <td>{c.requestedCheckIn || '—'}</td>
                    <td>{c.requestedCheckOut || '—'}</td>
                    <td style={{ maxWidth: '240px' }}>{c.reason}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[c.status] || 'badge-secondary'}`}>
                        {c.status || 'PENDING'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        {c.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Corrections;
