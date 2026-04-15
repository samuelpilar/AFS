interface TopBarProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-gray-900 truncate">{title}</h1>
        {description && (
          <p className="text-[12px] text-gray-500 truncate">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
    </header>
  )
}
