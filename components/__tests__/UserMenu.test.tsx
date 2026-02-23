import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { UserMenu } from '../UserMenu'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/client'

vi.mock('@/utils/supabase/client', () => ({
    createClient: vi.fn(),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} data-testid="dropdown-item">{children}</div>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}))

describe('UserMenu', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
                signOut: vi.fn(async () => ({ error: null })),
            },
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(async () => ({ data: null, error: null })),
        }
            ; (createClient as any).mockReturnValue(supabaseMock)
    })


    it('renders "Entrar" button when user is not logged in', async () => {
        render(<UserMenu />)
        expect(screen.getByText('Entrar')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/auth/login')
    })

    it('renders user avatar and name when logged in', async () => {
        const mockUser = {
            id: 'u1',
            email: 'test@example.com',
            user_metadata: { full_name: 'Lucas Silva', avatar_url: '/avatar.jpg' }
        }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        supabaseMock.single.mockResolvedValue({ data: { role: 'buyer', avatar_url: null }, error: null })

        render(<UserMenu />)

        // Espera o botão "Entrar" sumir, indicando que o usuário foi carregado
        await waitFor(() => {
            expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
        }, { timeout: 4000 })

        // No JSDOM/Radix, o botão de trigger costuma ser o primeiro botão encontrado
        const trigger = screen.getByRole('button')
        fireEvent.click(trigger)

        // Espera o conteúdo do dropdown aparecer (pode estar em um Portal)
        await waitFor(() => {
            expect(screen.getByText('Lucas Silva')).toBeInTheDocument()
        }, { timeout: 2000 })

        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('Quero Vender')).toBeInTheDocument()
    })


    it('shows "Painel do Vendedor" for seller users', async () => {
        const mockUser = {
            id: 'u1',
            email: 'seller@example.com',
            user_metadata: { full_name: 'Vendedor Teste' }
        }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        supabaseMock.single.mockResolvedValue({ data: { role: 'seller' }, error: null })

        render(<UserMenu />)

        await waitFor(() => {
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button'))

        expect(screen.getByText('Painel do Vendedor')).toBeInTheDocument()
        expect(screen.queryByText('Quero Vender')).not.toBeInTheDocument()
    })

    it('shows "Painel Admin" for admin users', async () => {
        const mockUser = {
            id: 'admin1',
            email: 'admin@example.com',
            user_metadata: { full_name: 'Admin User' }
        }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        supabaseMock.single.mockResolvedValue({ data: { role: 'admin' }, error: null })

        render(<UserMenu />)

        await waitFor(() => {
            expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button'))

        expect(screen.getByText('Painel Admin')).toBeInTheDocument()
        expect(screen.queryByText('Painel do Vendedor')).not.toBeInTheDocument()
    })

    it('calls signOut and redirects when clicking "Sair"', async () => {
        const mockUser = { id: 'u1', email: 'test@example.com' }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

        render(<UserMenu />)

        await waitFor(() => {
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button'))

        await act(async () => {
            fireEvent.click(screen.getByText('Sair'))
        })

        expect(supabaseMock.auth.signOut).toHaveBeenCalled()
    })

})
