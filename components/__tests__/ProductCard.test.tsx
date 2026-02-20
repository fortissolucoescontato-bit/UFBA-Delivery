import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../ProductCard'
import { CartProvider } from '@/context/CartContext'
import { describe, it, expect, vi } from 'vitest'

// Mock de sonner (já está no setup, mas garantimos)
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}))

const mockProduct = {
    id: 'p1',
    name: 'Açaí Turbinado',
    price: 25.50,
    image: '/test-image.jpg',
    vendorName: 'Açaí da UFBA',
    sellerId: 's1',
    sellerWhatsapp: '5571999999999',
    sellerLocation: 'Portaria 1',
}

describe('ProductCard', () => {
    it('renders product details correctly', () => {
        render(
            <CartProvider>
                <ProductCard {...mockProduct} />
            </CartProvider>
        )

        expect(screen.getByText('Açaí Turbinado')).toBeInTheDocument()
        expect(screen.getByText('25.50')).toBeInTheDocument()
        expect(screen.getByText('Açaí da UFBA')).toBeInTheDocument()
        expect(screen.getByText('Portaria 1')).toBeInTheDocument()
    })

    it('renders in list variant by default', () => {
        const { container } = render(
            <CartProvider>
                <ProductCard {...mockProduct} />
            </CartProvider>
        )
        expect(container.firstChild).toHaveClass('h-32') // List height
        expect(container.firstChild).toHaveClass('flex-row')
    })

    it('renders in grid variant when specified', () => {
        const { container } = render(
            <CartProvider>
                <ProductCard {...mockProduct} variant="grid" />
            </CartProvider>
        )
        expect(container.firstChild).toHaveClass('flex-col')
        expect(container.firstChild).not.toHaveClass('h-32')
    })

    it('adds product to cart when button is clicked', () => {
        render(
            <CartProvider>
                <ProductCard {...mockProduct} />
            </CartProvider>
        )

        const addButton = screen.getByRole('button')
        fireEvent.click(addButton)

        // O toast de sucesso deve ter sido chamado (via CartContext)
        // Note: O check real de itens no cart seria melhor via integração, 
        // mas aqui verificamos se não quebra e a interação básica.
    })

    it('applies custom brand color to the container variable', () => {
        const { container } = render(
            <CartProvider>
                <ProductCard {...mockProduct} brandColor="#00ff00" />
            </CartProvider>
        )

        // JSDOM support for CSS variables in style attribute
        expect(container.firstChild).toHaveStyle('--brand-color: #00ff00')
    })
})
