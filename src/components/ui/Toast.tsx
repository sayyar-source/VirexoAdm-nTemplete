import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Alert } from './Feedback'

type ToastTone = 'success' | 'danger' | 'warning' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  body?: string
}

interface ToastApi {
  push(toast: Omit<ToastItem, 'id'>): void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const push = useCallback<ToastApi['push']>(
    (toast) => {
      const id = nextId.current++
      setItems((prev) => [...prev.slice(-2), { ...toast, id }])
      // Errors stay until dismissed; confirmations time out.
      if (toast.tone !== 'danger') window.setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const api = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* `end-4` = inline-end: bottom-right in LTR, bottom-left in RTL. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 end-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((item) => (
          <Alert
            key={item.id}
            tone={item.tone}
            title={item.title}
            onDismiss={() => remove(item.id)}
            className="pointer-events-auto bg-surface shadow-lg"
          >
            {item.body}
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
