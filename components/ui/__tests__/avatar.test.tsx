import React from 'react'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from '../avatar'
import { describe, it, expect, vi } from 'vitest'

// Mock radix-ui which is used by shadcn in this project
vi.mock('radix-ui', () => ({
  Avatar: {
    Root: ({ children, className, ...props }: any) => <span data-testid="avatar-root" className={className} {...props}>{children}</span>,
    Image: ({ className, ...props }: any) => <img data-testid="avatar-image" className={className} {...props} />,
    Fallback: ({ children, className, ...props }: any) => <span data-testid="avatar-fallback" className={className} {...props}>{children}</span>,
  }
}))

describe('Avatar UI Components', () => {
    it('renders Avatar root with default size', () => {
        render(<Avatar />)
        const el = screen.getByTestId('avatar-root')
        expect(el.getAttribute('data-size')).toBe('default')
    })

    it('renders Avatar root with lg size', () => {
        render(<Avatar size="lg" />)
        const el = screen.getByTestId('avatar-root')
        expect(el.getAttribute('data-size')).toBe('lg')
    })

    it('renders AvatarImage', () => {
        render(<Avatar><AvatarImage src="/test.png" alt="img" /></Avatar>)
        expect(screen.getByTestId('avatar-image')).toBeDefined()
    })

    it('renders AvatarFallback', () => {
        render(<Avatar><AvatarFallback>FB</AvatarFallback></Avatar>)
        expect(screen.getByTestId('avatar-fallback').textContent).toBe('FB')
    })

    it('renders AvatarBadge', () => {
        render(<Avatar><AvatarBadge data-testid="badge" /></Avatar>)
        expect(screen.getByTestId('badge')).toBeDefined()
    })

    it('renders AvatarGroup', () => {
        render(<AvatarGroup data-testid="group"><Avatar /></AvatarGroup>)
        expect(screen.getByTestId('group')).toBeDefined()
    })

    it('renders AvatarGroupCount', () => {
        render(<AvatarGroupCount data-testid="count">+5</AvatarGroupCount>)
        expect(screen.getByTestId('count').textContent).toBe('+5')
    })
})
