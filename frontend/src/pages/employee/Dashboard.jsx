import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { employeeApi } from '../../api/employee';
import './Dashboard.css';

const Dashboard = () => {
  const [employee, setEmployee] = useState({
    name: 'Loading...',
    email: '',
    department: '',
    joinDate: ''
  });

  const [progress, setProgress] = useState({
    overall: 0,
    modulesCompleted: 0,
    totalModules: 0,
    securityScore: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch employee data from database
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get all employees to populate leaderboard
        const employees = await employeeApi.list();
        
        // Get selected employee from localStorage or use first employee
        let currentEmployee;
        const selectedEmployee = localStorage.getItem('selectedEmployee');
        
        if (selectedEmployee) {
          currentEmployee = JSON.parse(selectedEmployee);
        } else if (employees && employees.length > 0) {
          currentEmployee = employees[0]; // Use first employee as fallback
        }
        
        if (currentEmployee) {
          setEmployee({
            name: currentEmployee.name || 'Unknown Employee',
            email: currentEmployee.email || '',
            department: currentEmployee.department || 'General',
            joinDate: currentEmployee.createdAt || new Date().toISOString()
          });

          // Create leaderboard from all employees
          const leaderboardData = employees.map(emp => ({
            name: emp.name || 'Unknown',
            score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
            department: emp.department || 'General'
          })).sort((a, b) => b.score - a.score);
          
          setLeaderboard(leaderboardData);

          // Load employee progress (mock data for now)
          const progressData = await employeeApi.getEmployeeProgress(currentEmployee._id);
          setProgress(progressData);

          // Load employee achievements
          const achievementsData = await employeeApi.getEmployeeAchievements(currentEmployee._id);
          setAchievements(achievementsData);
        } else {
          setError('No employees found in database');
        }
      } catch (err) {
        console.error('Error loading employee data:', err);
        setError(err.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, []);

  const [leaderboard, setLeaderboard] = useState([
    { name: 'Alice Johnson', score: 95, department: 'IT Security' },
    { name: 'Bob Smith', score: 92, department: 'HR' },
    { name: 'Carol Davis', score: 88, department: 'Finance' },
    { name: 'John Doe', score: 85, department: 'IT Security' },
    { name: 'Eve Wilson', score: 82, department: 'Marketing' }
  ]);

  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 1,
      title: 'New Phishing Campaign Detected',
      description: 'Sophisticated phishing emails targeting company credentials detected. Be extra cautious with email attachments.',
      date: '2024-01-15',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Password Policy Update',
      description: 'New password requirements effective immediately. Minimum 12 characters with special characters required.',
      date: '2024-01-10',
      priority: 'medium'
    }
  ]);

  const [trainingModules, setTrainingModules] = useState([
    {
      id: 1,
      title: 'Password Security Fundamentals',
      description: 'Learn best practices for creating and managing secure passwords',
      duration: '30 min',
      completed: true,
      progress: 100
    },
    {
      id: 2,
      title: 'Phishing Awareness Training',
      description: 'Identify and avoid phishing attacks and social engineering',
      duration: '45 min',
      completed: false,
      progress: 60
    },
    {
      id: 3,
      title: 'Data Protection Guidelines',
      description: 'Understand how to protect sensitive company data',
      duration: '25 min',
      completed: false,
      progress: 0
    }
  ]);

  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'Security Awareness Quiz',
      description: 'Test your knowledge of security best practices',
      questions: 20,
      timeLimit: 30,
      attempts: 2,
      maxAttempts: 3,
      bestScore: 85,
      completed: true,
      dueDate: '2024-01-20'
    },
    {
      id: 2,
      title: 'Phishing Detection Assessment',
      description: 'Identify phishing emails and suspicious links',
      questions: 15,
      timeLimit: 20,
      attempts: 1,
      maxAttempts: 3,
      bestScore: 0,
      completed: false,
      dueDate: '2024-01-25'
    }
  ]);

  const [policies, setPolicies] = useState([
    {
      id: 1,
      title: 'Information Security Policy',
      version: 'v2.1',
      lastUpdated: '2024-01-01',
      read: true
    },
    {
      id: 2,
      title: 'Data Protection Guidelines',
      version: 'v1.5',
      lastUpdated: '2023-12-15',
      read: false
    },
    {
      id: 3,
      title: 'Incident Response Procedures',
      version: 'v1.0',
      lastUpdated: '2023-11-20',
      read: false
    }
  ]);

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Security Champion',
      description: 'Complete 10 security training modules',
      earned: true,
      earnedDate: '2024-01-10',
      icon: '🛡️'
    },
    {
      id: 2,
      title: 'Quiz Master',
      description: 'Score 90% or higher on 5 assessments',
      earned: true,
      earnedDate: '2024-01-05',
      icon: '🏆'
    },
    {
      id: 3,
      title: 'Policy Expert',
      description: 'Read all company security policies',
      earned: false,
      earnedDate: null,
      icon: '📋'
    }
  ]);

  const getCurrentUserRank = () => {
    const currentUser = leaderboard.find(user => user.name === employee.name);
    return leaderboard.indexOf(currentUser) + 1;
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="employee-dashboard">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="employee-dashboard">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Error Loading Dashboard</h3>
              <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>{error}</p>
              <button 
                className="btn" 
                onClick={() => window.location.reload()}
                style={{ marginRight: '1rem' }}
              >
                Retry
              </button>
              <Link to="/" className="btn">
                Go Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="employee-dashboard">
        {/* Title Bar */}
        <div className="adm-titlebar">
          <div>
            <h2 className="adm-h2">Employee Dashboard</h2>
            <p className="adm-sub">Welcome back, {employee.name}! Track your learning progress and achievements</p>
          </div>
          <div className="adm-actions">
            <Link to="/employee/badges" className="btn">View My Badges</Link>
            <Link to="/employee/learn" className="btn">Continue Learning</Link>
            <Link to="/employee/quizzes" className="btn">Take Quiz</Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="card kpi">
            <div className="kpi-title">Overall Progress</div>
            <div className="kpi-value">{progress.overall}%</div>
            <div className="kpi-more">Complete</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Modules Completed</div>
            <div className="kpi-value">{progress.modulesCompleted}</div>
            <div className="kpi-more">of {progress.totalModules} total</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Badges Earned</div>
            <div className="kpi-value">{achievements.filter(a => a.earned).length}</div>
            <div className="kpi-more">Achievements</div>
          </div>
          <div className="card kpi">
            <div className="kpi-title">Security Score</div>
            <div className="kpi-value">{progress.securityScore}</div>
            <div className="kpi-more">out of 100</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-col">
          {/* Overall Progress Circle */}
          <div className="card">
            <h3 className="card-title">Learning Progress</h3>
            <div className="progress-circle-container">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100" className="progress-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#2196F3"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.overall / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="progress-text">
                  <span className="progress-percentage">{progress.overall}%</span>
                  <span className="progress-label">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card">
            <h3 className="card-title">Security Leaderboard</h3>
            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((user, index) => (
                <div 
                  key={user.name} 
                  className={`leaderboard-item ${index < 3 ? 'top-three' : ''} ${user.name === employee.name ? 'current-user' : ''}`}
                >
                  <div className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-department">{user.department}</div>
                  </div>
                  <div className="user-score">{user.score}</div>
                </div>
              ))}
            </div>
            <p className="current-rank">
              Your rank: #{getCurrentUserRank()}
            </p>
          </div>
        </div>

        {/* Training Modules and Assessments */}
        <div className="two-col">
          <div className="card">
            <h3 className="card-title">Training Modules</h3>
            <div className="training-list">
              {trainingModules.map(module => (
                <div key={module.id} className="training-item">
                  <div className="training-info">
                    <h4 className="training-title">{module.title}</h4>
                    <p className="training-description">{module.description}</p>
                    <span className="training-duration">{module.duration}</span>
                  </div>
                  <div className="training-progress">
                    {module.completed ? (
                      <span className="completed-badge">✓ Completed</span>
                    ) : (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/employee/learn" className="ql">
              View All Training
            </Link>
          </div>

          <div className="card">
            <h3 className="card-title">Recent Assessments</h3>
            <div className="assessments-list">
              {assessments.slice(0, 3).map(assessment => (
                <div key={assessment.id} className="assessment-item">
                  <div className="assessment-info">
                    <h4 className="assessment-title">{assessment.title}</h4>
                    <div className="assessment-details">
                      <span>{assessment.questions} questions</span>
                      <span>Due: {assessment.dueDate}</span>
                    </div>
                  </div>
                  <div className="assessment-status">
                    {assessment.completed ? (
                      <div className="completed-info">
                        <span className="best-score">Best: {assessment.bestScore}%</span>
                      </div>
                    ) : (
                      <div className="incomplete-info">
                        <Link to={`/employee/quizzes/${assessment.id}`} className="btn">
                          {assessment.attempts > 0 ? 'Retake' : 'Take Quiz'}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/employee/quizzes" className="ql">
              View All Assessments
            </Link>
          </div>
        </div>

        {/* Security Alerts and Achievements */}
        <div className="two-col">
          <div className="card">
            <h3 className="card-title">Security Alerts</h3>
            <div className="alerts-list">
              {securityAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-header">
                    <span 
                      className="alert-priority"
                      style={{ backgroundColor: getPriorityColor(alert.priority) }}
                    >
                      {alert.priority.toUpperCase()}
                    </span>
                    <span className="alert-date">{alert.date}</span>
                  </div>
                  <h4 className="alert-title">{alert.title}</h4>
                  <p className="alert-description">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Recent Achievements</h3>
            <div className="achievements-list">
              {achievements.slice(0, 3).map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                    {achievement.earned && (
                      <span className="earned-date">Earned: {achievement.earnedDate}</span>
                    )}
                  </div>
                  <div className="achievement-status">
                    {achievement.earned ? (
                      <span className="earned-badge">✓ Earned</span>
                    ) : (
                      <span className="locked-badge">🔒 Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/employee/badges" className="ql">
              View All Achievements
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h3 className="card-title">Quick Links</h3>
          <div className="quick-links">
            <Link className="ql" to="/employee/learn">Educational Content</Link>
            <Link className="ql" to="/employee/quizzes">Training Quizzes</Link>
            <Link className="ql" to="/employee/badges">My Badges</Link>
            <Link className="ql" to="/employee/policies">Company Policies</Link>
            <Link className="ql" to="/learn">Public Learning</Link>
            <Link className="ql" to="/contact">Contact Support</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
