import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ShiftEntry from '../ShiftEntry/ShiftEntry';
import ShiftHistory from '../ShiftHistory/ShiftHistory';
import { autoStatusUpdateOnLoad, manualStatusUpdate, handleAPIError } from '../../services/appScriptAPI';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('shift-entry');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Automatic status update on portal load
  useEffect(() => {
    if (user) {
      handleAutoStatusUpdate();
    }
  }, [user]);

  const handleAutoStatusUpdate = async () => {
    try {
      setStatusUpdateLoading(true);
      console.log('🚀 Running automatic status update on portal load...');
      const result = await autoStatusUpdateOnLoad();

      if (result.success) {
        console.log('✅ Auto status update completed:', result.message);
        setLastUpdateTime(new Date());
      } else {
        console.warn('⚠️ Auto status update warning:', result.message);
      }
    } catch (error) {
      console.error('❌ Auto status update failed:', error);
      // Don't show error to user for automatic updates
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleManualStatusUpdate = async () => {
    try {
      setStatusUpdateLoading(true);
      console.log('🔄 Running manual status update...');
      const result = await manualStatusUpdate();

      if (result.success) {
        alert(`✅ Status update completed!\n${result.message}`);
        setLastUpdateTime(new Date());

        // Trigger fresh data refresh in components instead of full page reload
        setRefreshTrigger(prev => prev + 1);
        console.log('🔄 Triggering fresh data refresh in components');

      } else {
        alert(`⚠️ Status update completed with warnings:\n${result.message}`);
      }
    } catch (error) {
      console.error('❌ Manual status update failed:', error);
      alert(`❌ Status update failed:\n${handleAPIError(error)}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle tab changes with fresh data fetch
  const handleTabChange = (newTab) => {
    console.log(`🔄 Tab changed from ${activeTab} to ${newTab} - triggering fresh data`);
    setActiveTab(newTab);
    setRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'shift-entry':
        return <ShiftEntry key={`shift-entry-${refreshTrigger}`} refreshTrigger={refreshTrigger} />;
      case 'shift-history':
        return <ShiftHistory key={`shift-history-${refreshTrigger}`} refreshTrigger={refreshTrigger} />;
      default:
        return <ShiftEntry key={`shift-entry-${refreshTrigger}`} refreshTrigger={refreshTrigger} />;
    }
  };

  const MobileNavItem = ({ icon, label, isActive, onClick, isLoading, isDanger }) => (
    <button
      className={`btn btn-link text-decoration-none d-flex flex-column align-items-center justify-content-center p-1 flex-grow-1 ${isActive ? 'text-primary' : isDanger ? 'text-danger' : 'text-muted'}`}
      onClick={onClick}
      disabled={isLoading}
      style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
    >
      <div className="position-relative d-flex align-items-center justify-content-center" style={{ height: '24px' }}>
        {isLoading ? (
          <div className="spinner-border spinner-border-sm" role="status"></div>
        ) : (
          <i className={`bi bi-${icon} fs-5`}></i>
        )}
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '700' : '500', marginTop: '2px' }}>{label}</span>
    </button>
  );

  return (
    <div className="min-vh-100 bg-light pb-5 mb-5 mb-md-0">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-md navbar-dark bg-primary sticky-top shadow-sm">
        <div className="container-fluid px-3">
          <span className="navbar-brand mb-0 h1 d-flex align-items-center">
            <i className="bi bi-person-badge me-2"></i>
            <span>Staff Portal</span>
          </span>

          {/* Mobile Header Extras (Theme + Logout) */}
          <div className="d-flex d-md-none align-items-center ms-auto">
            <span className="text-white-50 small me-2">
              {user?.name?.split(' ')[0]}
            </span>
            <button className="btn btn-link text-light p-1" onClick={toggleTheme}>
              <span style={{ fontSize: '1.2rem' }}>{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="collapse navbar-collapse d-none d-md-flex" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-light p-2 ${activeTab === 'shift-entry' ? 'active fw-bold' : ''}`}
                  onClick={() => handleTabChange('shift-entry')}
                >
                  <i className="bi bi-clock me-1"></i>
                  Shift Entry
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-light p-2 ${activeTab === 'shift-history' ? 'active fw-bold' : ''}`}
                  onClick={() => handleTabChange('shift-history')}
                >
                  <i className="bi bi-calendar-check me-1"></i>
                  View My Shifts
                </button>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-light btn-sm me-3"
                onClick={handleManualStatusUpdate}
                disabled={statusUpdateLoading}
                title={lastUpdateTime ? `Last updated: ${lastUpdateTime.toLocaleTimeString()}` : 'Update shift statuses'}
              >
                {statusUpdateLoading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-arrow-clockwise me-1" />}
                Refresh Status
              </button>

              <button className="btn btn-link text-light me-2 text-decoration-none" onClick={toggleTheme}>
                {isDarkMode ? '☀️ ' : '🌙 '}
              </button>

              <span className="navbar-text me-3 text-light">
                Welcome, <strong>{user?.name?.split(' ')[0]}</strong>
              </span>

              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid p-2 p-md-4">
        <div className="row">
          <div className="col-12">
            {/* Content Header */}
            <div className="card shadow-sm mb-3 mb-md-4">
              <div className="card-body p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="mb-1 fs-5 fs-md-4">
                      {activeTab === 'shift-entry' && (
                        <>
                          <i className="bi bi-clock text-primary me-2"></i>
                          Shift Time Entry
                        </>
                      )}
                      {activeTab === 'shift-history' && (
                        <>
                          <i className="bi bi-calendar-check text-success me-2"></i>
                          My Shift History
                        </>
                      )}
                    </h4>
                    <p className="text-muted mb-0 small d-none d-md-block">
                      {activeTab === 'shift-entry' && 'Track your work hours and manage shift details'}
                      {activeTab === 'shift-history' && 'View and review your completed shifts'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="card shadow-sm">
              <div className="card-body p-2 p-md-4">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="d-block d-md-none fixed-bottom bg-white border-top shadow-lg" style={{ zIndex: 1030, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="d-flex justify-content-around align-items-center py-1">
          <MobileNavItem
            icon="clock"
            label="Entry"
            isActive={activeTab === 'shift-entry'}
            onClick={() => handleTabChange('shift-entry')}
          />
          <MobileNavItem
            icon="calendar-check"
            label="History"
            isActive={activeTab === 'shift-history'}
            onClick={() => handleTabChange('shift-history')}
          />
          <MobileNavItem
            icon="arrow-clockwise"
            label="Refresh"
            onClick={handleManualStatusUpdate}
            isLoading={statusUpdateLoading}
          />
          <MobileNavItem
            icon="box-arrow-right"
            label="Logout"
            onClick={logout}
            isDanger
          />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
