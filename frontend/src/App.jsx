// src/App.jsx
import { useAuth } from './auth/context/AuthContext';
import Header from './components/Header/Header';
import LoginForm from './auth/components/LoginForm/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/app.scss';

// src/App.jsx (no changes needed to JSX)
function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <div className="auth-container">
            <LoginForm />
            <div className="auth-welcome">
              <h2>Welcome to FinanceTracker</h2>
              <p>Please login to manage your finances</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;