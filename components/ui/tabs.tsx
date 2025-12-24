"use client"

import * as React from "react"

interface TabsContextValue {
    value: string
    onChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs provider")
    }
    return context
}

interface TabsProps {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)

    const currentValue = value ?? internalValue

    const handleChange = React.useCallback((newValue: string) => {
        setInternalValue(newValue)
        onValueChange?.(newValue)
    }, [onValueChange])

    return (
        <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
            <div className={className} data-orientation="horizontal">
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            role="tablist"
            className={`inline-flex h-10 items-center justify-center rounded-lg bg-slate-800 p-1 ${className || ''}`}
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
    const { value: selectedValue, onChange } = useTabsContext()
    const isSelected = selectedValue === value

    return (
        <button
            role="tab"
            type="button"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium
        transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${isSelected
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
        ${className || ''}
      `}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: selectedValue } = useTabsContext()

    if (selectedValue !== value) {
        return null
    }

    return (
        <div
            role="tabpanel"
            className={className}
        >
            {children}
        </div>
    )
}
