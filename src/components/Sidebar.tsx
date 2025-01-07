import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className="bg-white w-64 h-screen shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Task Manager</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}`}
            alt="Profile"
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}