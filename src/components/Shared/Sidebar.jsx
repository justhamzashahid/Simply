import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Wrench, 
  FileCheck2, 
  FileText, 
  Languages,
  HelpCircle,
  MenuIcon
} from 'lucide-react';
import logo from '../../assets/logo.png';
import profile from '../../assets/profile.png';
import { Navigate, useNavigate } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const mainMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', link: '/dashboard' },
    { icon: <Bot size={20} />, label: 'AI Writer', link: '/ai-writer' },
    { icon: <Wrench size={20} />, label: 'SEO Writer', link: '/seo-writer' },
    { icon: <FileCheck2 size={20} />, label: 'Compliance AI', link: '/compliance' },
    { icon: <FileText size={20} />, label: 'Doc Management', link: '/documents' },
    { icon: <Languages size={20} />, label: 'Translation', link: '/translation' },
  ];

  const otherMenuItems = [
    { icon: <HelpCircle size={20} />, label: 'Help Center', link: '/help' },
  ];

  return (
    <div className={`h-screen bg-[#FFFAF3] border-r border-[#D3D3D3] transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex items-center justify-between px-4 py-5">
        <button onClick={() => navigate('/')}>
          <img src={logo} alt="Simply Logo" className={`h-6 ${isCollapsed ? 'hidden' : 'block'}`} />
        </button>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <MenuIcon size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Main Menu Section */}
      <div className="px-4 py-2">
        <p className={`text-xs font-medium text-gray-500 mb-4 ${isCollapsed ? 'hidden' : 'block'}`}>
          Main Menu
        </p>
        <nav className="space-y-1">
          {mainMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.link)}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-lg ${
                window.location.pathname === item.link 
                  ? 'bg-[#FF5341] text-white hover:bg-[#FF5341]/90' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              {item.icon}
              <span className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-[#D3D3D3]" />

      {/* Other Section */}
      <div className="px-4 py-2">
        <p className={`text-xs font-medium text-gray-500 mb-4 ${isCollapsed ? 'hidden' : 'block'}`}>
          Other
        </p>
        <nav className="space-y-1">
          {otherMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.link)}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-800 rounded-lg hover:bg-gray-200"
            >
              {item.icon}
              <span className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="my-4 border-t border-[#D3D3D3]" />

      {/* User Profile Section - Updated to be clickable */}
      <div className="absolute bottom-0 w-full p-4">
        <button 
          onClick={() => navigate('/profile')}
          className="w-full flex items-center hover:bg-gray-200 p-2 rounded-lg transition-colors"
        >
          <img
            src={profile}
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className={`ml-3 text-left ${isCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-sm font-medium text-gray-700">Zay Yang</p>
            <p className="text-xs text-gray-500">zay.yang@email.com</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;