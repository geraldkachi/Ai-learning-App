import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean; toggleSidebar: () => void }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Documents', to: '/documents', icon: <FileText size={20} /> },
    { name: 'Flashcards', to: '/flashcards', icon: <BookOpen size={20} /> },
    // { name: 'Quizzes', to: '/quizzes', icon: <BrainCircuit size={20} /> },
    { name: 'Profile', to: '/profile', icon: <User size={20} /> },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full bg-white text-gray-800 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-emerald-500" />
              <h1 className="text-xl font-bold text-gray-800">AI Learning</h1>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="md:hidden hover:bg-gray-100 p-1 rounded-lg transition-colors text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200 hidden">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-semibold truncate text-gray-800">{user?.username || user?.email}</p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar()
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar