import React from 'react'

const PageHeader = ({title, subtitle, children}: {title: string; subtitle?: string; children?: React.ReactNode}) => {
  return (
    <div className='flex items-center justify-between mb-4'>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{title}</h1>
            {subtitle && <p className="text-slate-600 text-sm">{subtitle}</p>}
        </div>

        {children && <div>{children}</div>}

    </div>
  )
}

export default PageHeader