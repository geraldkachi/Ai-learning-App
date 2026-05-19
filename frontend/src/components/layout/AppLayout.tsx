import React, { useState } from 'react'
import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type Props = {
  children?: ReactNode
}

const AppLayout = ({ children }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return <div className='flex h-screen bg-neutral-50 text-neutral-900'>
    <Sidebar {...{ isSidebarOpen, toggleSidebar }} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header {...{ toggleSidebar }} />
      <div className="flex-1 overflow-y-auto p-1"> {/* Adjust the margin based on your sidebar width */}
        {children}
      </div>
    </div>
  </div>
}

export default AppLayout