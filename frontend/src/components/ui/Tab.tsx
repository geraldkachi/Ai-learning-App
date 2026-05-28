// components/common/Tabs.tsx
import React from 'react'

interface Tab {
  name: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabName: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="relative border-b border-gray-200 bg-white rounded-t-xl overflow-x-scroll">
        <nav className="flex gap-1 px-4" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                relative px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.name 
                  ? 'text-emerald-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
              role="tab"
              aria-selected={activeTab === tab.name}
            >
              {tab.label}
              {activeTab === tab.name && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={activeTab === tab.name ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs


// import React from 'react'

// const Tab = ({tabs, activeTab, setActiveTab}: {tabs: {name: string; label: string, content: React.ReactNode}[], activeTab: string, setActiveTab: (id: string) => void}) => {
//   return (
//     <div className=''>
//         <div className="h">

//         <nav className="t">
//       {tabs.map((tab) => (
//           <button
//           key={tab.name}
//           className={`px-4 py-2 rounded-md  font-semibold transition-all duration-200 ${activeTab === tab.name ? 'bg-emerald-500 text-white' : 'hover:bg-slate-600 hover:text-slate-900'}`}
//           onClick={() => setActiveTab(tab.name)}
//           >
//             <span className="font-medium">{tab.label}</span>
//             {activeTab === tab.name && 
//             <span className="ml-2 text-xs text-white">•</span>}
//             {activeTab === tab.name && 
//             <span className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-pulse"></span>}
//           </button>
//       ))}
//       </nav>
//       </div>
//       <div className="">
//         {tabs.map((tab) => (
//           <div key={tab.name} className={`${activeTab === tab.name ? 'block' : 'hidden'}`}>
//            {tab.content}
//           </div>
//         ))}
//       </div>
//       </div>
//   )
// }

// export default Tab