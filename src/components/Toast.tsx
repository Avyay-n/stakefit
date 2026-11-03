import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#18181b]/95 border border-red-500/40 text-white rounded-xl shadow-2xl backdrop-blur-md glow-red animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md">
      <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
        <Bell className="w-4 h-4 animate-bounce" />
      </div>
      <p className="text-sm font-medium text-zinc-100">{toastMessage}</p>
    </div>
  );
};

