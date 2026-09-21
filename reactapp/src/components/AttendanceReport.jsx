import React, { useState, useEffect } from 'react';
import * as api from '../utils/api';

const AttendanceReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';
  const userEmail = localStorage.getItem('email') || '';
  const storedEmpId = localStorage.getItem('employeeId') || '';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(data);
        if (isAdmin) {
          const firstId = data[0].employeeId || data[0].id || '';
          setSelectedEmployee(firstId);
          loadReport(firstId, year, month);
        } else {
          // Find current employee
          const me = data.find(
            (e) => (e.email && e.email.toLowerCase() === userEmail.toLowerCase()) ||
                   (storedEmpId && e.employeeId === storedEmpId)
          );
          const empId = me ? (me.employeeId || me.id) : (data[0].employeeId || data[0].id);
          setSelectedEmployee(empId);
          loadReport(empId, year, month);
        }
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const loadReport = async (empId, y, m) => {
    if (!empId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.getAttendanceReport({
        employeeId: empId,
        year: y || undefined,
        month: m || undefined,
      });

      if (response && response.data) {
        setReport(response.data);
      } else if (response && response.error) {
        setError(response.error);
        setReport(null);
      } else {
        setReport(null);
      }
    } catch (err) {
      setError('Failed to fetch attendance report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    loadReport(selectedEmployee, year, month);
  };

  // -------------------------------------------------------------
  // EXPORT TO EXCEL (CSV) FOR ADMIN
  // -------------------------------------------------------------
  const handleExportExcel = () => {
    if (!report || !report.dailyRecords || report.dailyRecords.length === 0) {
      alert('No attendance records available to export for this selection.');
      return;
    }

    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In Time', 'Check Out Time', 'Status', 'Work Hours'];
    const rows = report.dailyRecords.map((r) => [
      report.employeeId || selectedEmployee,
      `"${(report.employeeName || 'Staff').replace(/"/g, '""')}"`,
      r.date || '',
      r.checkInTime || '—',
      r.checkOutTime || '—',
      r.status || 'Present',
      r.workHours != null ? r.workHours : '0.0',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = `Attendance_Report_${report.employeeId || selectedEmployee}_${year}_${month}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Attendance Reports & Analytics' : 'My Attendance Report'}</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'View and export detailed monthly work hour breakdowns for company employees.'
              : 'Review your personal working hours, present days, and shift history.'}
          </p>
        </div>
        {isAdmin && report && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleExportExcel}
          >
            <span className="btn-icon">📥</span> Export Excel (CSV)
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleGenerateReport}>
          <div className="report-form-grid">
            <div className="form-group">
              <label htmlFor="report-employee-select" className="form-label">
                {isAdmin ? 'Select Employee' : 'Employee Profile'}
              </label>
              {isAdmin ? (
                <select
                  id="report-employee-select"
                  data-testid="report-employee-select"
                  className="form-control"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {emp.employeeId ? `[${emp.employeeId}] ` : ''}{emp.name || emp.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={report?.employeeName ? `${report.employeeName} (${report.employeeId})` : userEmail}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="year-select" className="form-label">
                Year
              </label>
              <select
                id="year-select"
                className="form-control"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="month-select" className="form-label">
                Month
              </label>
              <select
                id="month-select"
                className="form-control"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button
                type="button"
                data-testid="report-submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'View Report'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {report && (
        <>
          <div
            data-testid="attendance-report-summary"
            className="stats-grid"
            style={{ marginBottom: '1.5rem' }}
          >
            <div className="stat-card stat-info">
              <div className="stat-value">{report.totalWorkDays ?? 0}</div>
              <div className="stat-label">Total Work Days:</div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-value">{report.presentDays ?? 0}</div>
              <div className="stat-label">Present:</div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-value">{report.halfDays ?? 0}</div>
              <div className="stat-label">Half Days:</div>
            </div>

            <div className="stat-card stat-danger">
              <div className="stat-value">{report.absentDays ?? 0}</div>
              <div className="stat-label">Absent:</div>
            </div>

            <div className="stat-card stat-purple">
              <div className="stat-value">{report.totalWorkHours ?? 0} hrs</div>
              <div className="stat-label">Total Work Hours:</div>
            </div>

            <div className="stat-card stat-primary">
              <div className="stat-value">{report.averageWorkHours ?? 0} hrs</div>
              <div className="stat-label">Avg Work Hours:</div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Daily Attendance Log</h3>
              {isAdmin && (
                <button className="btn btn-outline btn-sm" onClick={handleExportExcel}>
                  📥 Export CSV
                </button>
              )}
            </div>

            {report.dailyRecords && report.dailyRecords.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Hours Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyRecords.map((rec, idx) => (
                      <tr key={idx}>
                        <td>{rec.date}</td>
                        <td>{rec.checkInTime || '—'}</td>
                        <td>{rec.checkOutTime || '—'}</td>
                        <td>
                          <span
                            className={`badge ${
                              rec.status === 'Present'
                                ? 'badge-success'
                                : rec.status === 'Half-day' || rec.status === 'Half Day'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td>{rec.workHours != null ? `${rec.workHours} hrs` : '0.0 hrs'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">No attendance entries for this month</p>
                <p className="empty-state-text">Check-in and check-out logs will be recorded here.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceReport;
