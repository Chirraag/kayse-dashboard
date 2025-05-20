import React from 'react';
import Dashboard from './components/Dashboard';
import { WorkspaceProvider } from './context/WorkspaceContext';

function App() {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </WorkspaceProvider>
  );
}

export default App;