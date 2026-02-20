import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock de sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn((url) => { throw new Error(`NEXT_REDIRECT: ${url}`) }),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(),
    })),
    usePathname: vi.fn(() => ''),
}))

// Mock de next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}))

// Mock de Date.now para nomes de arquivo consistentes
vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))


// Mock de Supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(async () => ({ data: { user: { id: 'test-user' } }, error: null })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnValue({ data: null, error: null }),
            order: vi.fn().mockReturnThis(),
        })),
    })),
}))

// Mock global de localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        clear: () => {
            store = {}
        },
        removeItem: (key: string) => {
            delete store[key]
        },
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock de PointerEvent
if (typeof window !== 'undefined' && !window.PointerEvent) {
    // @ts-ignore
    window.PointerEvent = class PointerEvent extends MouseEvent { }
}

// Mock de scrollIntoView
if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
}

beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
})

