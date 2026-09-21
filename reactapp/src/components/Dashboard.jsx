import React, { useState, useEffect } from 'react';
import * as api from '../utils/api';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [myReport, setMyReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';
  const userEmail = localStorage.getItem('email') || '';
  const storedEmpId = localStorage.getItem('employeeId') || '';

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        api.getEmployees().catch(() => []),
        api.getAllAttendance().catch(() => []),
      ]).then(([empData, attData]) => {
        if (Array.isArray(empData)) setEmployees(empData);
        if (Array.isArray(attData)) setAttendances(attData);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      // Employee mode: only load current user's profile and report
      api.getEmployees().then(async (empList) => {
        if (Array.isArray(empList)) {
          const current = empList.find(
            (e) => (e.email && e.email.toLowerCase() === userEmail.toLowerCase()) ||
                   (storedEmpId && e.employeeId === storedEmpId)
          );
          if (current) {
            setMyProfile(current);
            const empIdentifier = current.employeeId || current.id;
            const rep = await api.getAttendanceReport(empIdentifier);
            if (rep && rep.data) {
              setMyReport(rep.data);
            }
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAdmin, userEmail, storedEmpId]);

  // Admin stats
  const todayRecords = attendances.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.length;
  const pendingCheckoutCount = todayRecords.filter((a) => !a.checkOutTime && !a.checkOut).length;
  const absentCount = Math.max(0, employees.length - presentCount);

  // Employee personal stats
  const myTodayRecord = myReport?.dailyRecords?.find((r) => r.date === todayStr);
  const myStatusToday = myTodayRecord ? myTodayRecord.status : 'Not Checked In';
  const myInTime = myTodayRecord?.checkInTime || '—';
  const myOutTime = myTodayRecord?.checkOutTime || '—';
  const myTotalWorkDays = myReport?.totalWorkDays || 0;
  const myTotalWorkHours = myReport?.totalWorkHours || 0;

  if (!isAdmin) {
    // -------------------------------------------------------------
    // EMPLOYEE DASHBOARD (Strictly personal info only)
    // -------------------------------------------------------------
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">👤 Welcome, {myProfile?.name || localStorage.getItem('name') || 'Employee'}</h1>
            <p className="page-subtitle">{currentDate} — Employee Self-Service Portal</p>
          </div>
          {myProfile && (
            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              ID: {myProfile.employeeId || `EMP-${myProfile.id}`} · {myProfile.department || 'General'}
            </span>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card stat-blue">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value" style={{ fontSize: '1.2rem' }}>{loading ? '...' : myStatusToday}</div>
              <div className="stat-label">Today's Status</div>
            </div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon">🚪</div>
            <div className="stat-content">
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>{loading ? '...' : myInTime}</div>
              <div className="stat-label">Check-In Time</div>
            </div>
          </div>
          <div className="stat-card stat-yellow">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : myTotalWorkDays}</div>
              <div className="stat-label">Days Worked This Month</div>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : `${myTotalWorkHours} hrs`}</div>
              <div className="stat-label">Total Hours Logged</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
          <div className="card">
            <h3 className="card-title">My Actions</h3>
            <div className="quick-actions">
              <a href="/attendance" className="action-card">
                <span className="action-icon">⏱️</span>
                <span>Check In / Check Out</span>
              </a>
              <a href="/reports" className="action-card">
                <span className="action-icon">📊</span>
                <span>View My Report</span>
              </a>
              <a href="/holidays" className="action-card">
                <span className="action-icon">🏖️</span>
                <span>Upcoming Holidays</span>
              </a>
              <a href="/corrections" className="action-card">
                <span className="action-icon">🔧</span>
                <span>Request Correction</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">My Profile Summary</h3>
            {loading ? (
              <div className="loading-state">Loading profile...</div>
            ) : myProfile ? (
              <div className="profile-details-list">
                <div className="detail-item">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value"><strong>{myProfile.employeeId || `EMP-${myProfile.id}`}</strong></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Full Name:</span>
                  <span className="detail-value">{myProfile.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{myProfile.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{myProfile.department || 'General'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{myProfile.position || 'Staff'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joining Date:</span>
                  <span className="detail-value">{myProfile.joiningDate || '—'}</span>
                </div>
              </div>
            ) : (
              <p className="empty-state-text">Logged in as: {userEmail}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN DASHBOARD (Company-wide Overview)
  // -------------------------------------------------------------
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👑 Admin Dashboard</h1>
          <p className="page-subtitle">{currentDate} — Administrator Management Portal</p>
        </div>
        <a href="/employees/new" className="btn btn-primary">
          + Add New Employee
        </a>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : employees.length}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : presentCount}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : pendingCheckoutCount}</div>
            <div className="stat-label">Pending Check-outs</div>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : absentCount}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3 className="card-title">Admin Quick Actions</h3>
          <div className="quick-actions">
            <a href="/employees" className="action-card">
              <span className="action-icon">👥</span>
              <span>Manage Employees</span>
            </a>
            <a href="/reports" className="action-card">
              <span className="action-icon">📊</span>
              <span>Export &amp; View Reports</span>
            </a>
            <a href="/corrections" className="action-card">
              <span className="action-icon">🔧</span>
              <span>Review Corrections</span>
            </a>
            <a href="/holidays" className="action-card">
              <span className="action-icon">🏖️</span>
              <span>Manage Holidays</span>
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Recent Employees</h3>
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : employees.length === 0 ? (
            <p className="empty-state-text">No employees registered yet.</p>
          ) : (
            <ul className="recent-list">
              {employees.slice(0, 5).map((emp) => (
                <li key={emp.employeeId || emp.id} className="recent-item">
                  <div className="avatar-circle">
                    {(emp.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{emp.name}</span>
                    <span className="recent-meta">{emp.department || 'General'} · {emp.employeeId || `EMP-${emp.id}`}</span>
                  </div>
                  <a href={`/employees/${emp.employeeId || emp.id}`} className="btn btn-outline btn-sm">
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
