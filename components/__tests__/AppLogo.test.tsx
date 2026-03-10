import { render, screen } from '@testing-library/react'
import { AppLogo } from '../AppLogo'
import { describe, it, expect } from 'vitest'

describe('AppLogo', () => {
    it('renders the application name', () => {
        render(<AppLogo />)
        expect(screen.getByText('UFBA Delivery')).toBeInTheDocument()
    })

    it('renders the subtext by default', () => {
        render(<AppLogo />)
        expect(screen.getByText('Campus Digital')).toBeInTheDocument()
    })

    it('hides the subtext when hideSubtext prop is true', () => {
        render(<AppLogo hideSubtext />)
        expect(screen.queryByText('Campus Digital')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(<AppLogo className="custom-class" />)
        expect(container.firstChild).toHaveClass('custom-class')
    })
})
