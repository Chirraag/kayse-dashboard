import React, { createContext, useState, useContext } from 'react';
import type { Workspace, WorkspaceContextType } from '../types/retell';

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const workspaces: Workspace[] = [
  { name: 'Max Company', apiKey: 'key_039d59cb7a74fd3872dfa8215b58' },
  { name: 'Dev', apiKey: 'key_061026166e726cdddf580d8de2e0' },
  { name: 'Sheldon Law', apiKey: 'key_94f8015c59e7ed329d1e2b75c129' },
  { name: 'James Harris', apiKey: 'key_7d749857af5466525eb4f414bf7f' },
  { name: 'Claim Review', apiKey: 'key_3b4a2b842ee299f4d6237e27f5d0' },
  { name: 'Prod do not use', apiKey: 'key_d9516157342e35441ad9a1255d68' },
  { name: 'Krause and Kinsman', apiKey: 'key_ff360914343f62470398f01a9f94' },
];

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  return (
    <WorkspaceContext.Provider value={{ selectedWorkspace, setSelectedWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};