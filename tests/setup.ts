import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Configurar env vars essenciais para o Supabase Client real
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key'

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


// Mock de Supabase (@supabase/supabase-js) para lib/mercadopago.ts etc
vi.mock('@supabase/supabase-js', () => ({
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
            maybeSingle: vi.fn().mockReturnValue({ data: null, error: null }),
            order: vi.fn().mockReturnThis(),
        })),
        storage: {
            from: vi.fn().mockReturnThis(),
            upload: vi.fn(async () => ({ data: { path: 'path' }, error: null })),
            getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://img.url' } })),
        }
    })),
}))

// Mock de Supabase SSR
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
            maybeSingle: vi.fn().mockReturnValue({ data: null, error: null }),
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
    // @ts-expect-error
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

