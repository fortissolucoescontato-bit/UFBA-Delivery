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
        await waitFor(() => expect(screen.queryByText('Entrar')).not.toBeInTheDocument())

        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => expect(screen.getByText('Lucas Silva')).toBeInTheDocument())
    })

    it('shows admin actions for admin users', async () => {
        const mockUser = { id: 'u1', user_metadata: { full_name: 'Admin User' } }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        supabaseMock.single.mockResolvedValue({ data: { role: 'admin' }, error: null })

        render(<UserMenu />)
        await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('ADMINISTRAÇÃO NÚCLEO')).toBeInTheDocument()
    })

    it('calls signOut and redirects when clicking "Sair"', async () => {
        const mockUser = { id: 'u1' }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

        render(<UserMenu />)
        await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button'))
        await act(async () => { fireEvent.click(screen.getByText('ENCERRAR SESSÃO')) })

        expect(supabaseMock.auth.signOut).toHaveBeenCalled()
    })

    it('logs error if signOut fails', async () => {
        const mockUser = { id: 'u1' }
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        supabaseMock.auth.signOut.mockResolvedValue({ error: { message: 'Sign out failed' } })
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(<UserMenu />)
        await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button'))
        await act(async () => { fireEvent.click(screen.getByText('ENCERRAR SESSÃO')) })

        expect(spy).toHaveBeenCalledWith('Error signing out:', 'Sign out failed')
        spy.mockRestore()
    })
})
