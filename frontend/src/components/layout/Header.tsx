import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, User, Menu } from 'lucide-react'

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user } = useAuth()
  return (
    <div className='sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60'>
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile Menu button */}
        <button onClick={toggleSidebar} className="md:hidden inline-flex items-center justify-center w-10 h-10 p-2 rounded-md hover:bg-slate-200" aria-label='Toggle sidebar'>
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <button className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-10 rounded-xl transition-all duration-100 group hover:bg-slate-200">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />

            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div className=" flex items-center gap-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors duration-200 cursor-pointer group"> 

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bg-emerald-400  to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
                <User size={18} className="w-5 h-5" />
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-900">
            {user?.username || "User"}  
            </p>
            <p className="text-sx text-slate-500">
            {user?.email || "user@example.com"}  
            </p>

          </div>
    
          

        </div>
      </div>
    </div>
  )
}

export default Header