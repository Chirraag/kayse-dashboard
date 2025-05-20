import React from 'react';
import { Building2 } from 'lucide-react';
import { useWorkspace, workspaces } from '../context/WorkspaceContext';

const WorkspaceSelector: React.FC = () => {
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();

  if (selectedWorkspace) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Current Workspace: {selectedWorkspace.name}
            </span>
          </div>
          <button
            onClick={() => setSelectedWorkspace(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Change Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-semibold text-blue-900">
          Select Workspace
        </h2>
      </div>
      <div className="space-y-3">
        {workspaces.map((workspace) => (
          <button
            key={workspace.apiKey}
            onClick={() => setSelectedWorkspace(workspace)}
            className="w-full text-left px-4 py-3 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-blue-900">{workspace.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceSelector;