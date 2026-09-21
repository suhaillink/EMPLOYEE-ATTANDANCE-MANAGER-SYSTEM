import React, { useState, useEffect } from 'react';
import * as api from '../utils/api';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';

  // Get current date string YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await api.getHolidays();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name.trim() || !formData.date) {
      setError('Holiday name and date are required.');
      return;
    }
    try {
      const payload = {
        holidayName: formData.name.trim(),
        holidayDate: formData.date,
        name: formData.name.trim(),
        date: formData.date,
        description: formData.description || '',
      };
      const res = await api.addHoliday(payload);
      if (res && res.error) {
        setError(res.error);
      } else {
        setSuccess('Holiday added successfully!');
        setFormData({ name: '', date: '', description: '' });
        setShowForm(false);
        fetchHolidays();
      }
    } catch (err) {
      setError('Failed to add holiday.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      setSuccess('Holiday deleted successfully!');
    } catch {
      setError('Failed to delete holiday.');
    }
  };

  // Split holidays into Today & Upcoming vs Past
  const upcomingHolidays = holidays
    .filter((h) => {
      const dateStr = h.holidayDate || h.date || '';
      return dateStr >= todayStr;
    })
    .sort((a, b) => (a.holidayDate || a.date || '').localeCompare(b.holidayDate || b.date || ''));

  const pastHolidays = holidays
    .filter((h) => {
      const dateStr = h.holidayDate || h.date || '';
      return dateStr < todayStr;
    })
    .sort((a, b) => (b.holidayDate || b.date || '').localeCompare(a.holidayDate || a.date || ''));

  // Employees only see Today & Upcoming holidays
  const displayHolidays = isAdmin
    ? activeTab === 'upcoming'
      ? upcomingHolidays
      : pastHolidays
    : upcomingHolidays;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Holiday Calendar</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Manage and schedule official company holidays.'
              : 'Upcoming company holidays and scheduled non-working days.'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Holiday'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title">New Holiday</h3>
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Holiday Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Independence Day"
                  required
                />
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
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. National Holiday"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add Holiday
            </button>
          </form>
        </div>
      )}

      {/* Admin Tab Switcher */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            🗓️ Upcoming &amp; Today ({upcomingHolidays.length})
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('past')}
          >
            📁 Past Holidays ({pastHolidays.length})
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading holidays...</div>
        ) : displayHolidays.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">
              {isAdmin
                ? activeTab === 'upcoming'
                  ? 'No upcoming holidays scheduled'
                  : 'No past holidays found'
                : 'No upcoming holidays scheduled'}
            </p>
            <p className="empty-state-text">
              {isAdmin && activeTab === 'upcoming'
                ? 'Click "+ Add Holiday" to schedule upcoming holidays.'
                : 'Official company holidays will appear here once scheduled.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Holiday Name</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayHolidays.map((h, i) => {
                  const name = h.holidayName || h.name || 'Holiday';
                  const dateStr = h.holidayDate || h.date || '';
                  const dateObj = dateStr ? new Date(dateStr) : null;
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;

                  return (
                    <tr key={h.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{name}</strong>
                        {h.description && (
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {h.description}
                          </span>
                        )}
                      </td>
                      <td>{dateStr || '—'}</td>
                      <td>
                        {dateObj
                          ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
                          : '—'}
                      </td>
                      <td>
                        {isToday ? (
                          <span className="badge badge-success">🎉 Today</span>
                        ) : isPast ? (
                          <span className="badge badge-secondary">Past Holiday</span>
                        ) : (
                          <span className="badge badge-primary">Upcoming</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(h.id)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidays;
