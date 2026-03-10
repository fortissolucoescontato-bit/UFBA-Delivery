import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../ProductCard'
import { useCart } from '@/context/CartContext'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/context/CartContext', () => ({
    useCart: vi.fn(),
}))

describe('ProductCard', () => {
    const addToCart = vi.fn()
    const product = {
        id: '1',
        name: 'Test Product',
        price: 10,
        image: '/test.png',
        vendorName: 'Test Vendor',
        sellerId: 's1',
        sellerWhatsapp: '123'
    }

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useCart as any).mockReturnValue({ addToCart })
    })

    it('renders product details correctly', () => {
        render(<ProductCard {...product} />)
        expect(screen.getByText('Test Product')).toBeDefined()
        expect(screen.getByText('10.00')).toBeDefined()
    })

    it('adds product to cart when button is clicked', () => {
        render(<ProductCard {...product} />)
        const btn = screen.getByLabelText('Adicionar Test Product ao carrinho')
        fireEvent.click(btn)
        expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: '1', sellerId: 's1' }))
    })

    it('logs error if sellerId is missing', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        // @ts-ignore
        render(<ProductCard {...product} sellerId={undefined} />)
        const btn = screen.getByLabelText('Adicionar Test Product ao carrinho')
        fireEvent.click(btn)
        expect(spy).toHaveBeenCalledWith("Critical: sellerId missing", expect.anything())
        expect(addToCart).not.toHaveBeenCalled()
        spy.mockRestore()
    })

    it('renders in list variant', () => {
        render(<ProductCard {...product} variant="list" />)
        expect(screen.getByText('Test Product')).toBeDefined()
    })

    it('renders with boosted and new badges', () => {
        render(<ProductCard {...product} isBoosted={true} isNew={true} />)
        expect(screen.getByText('Destaque')).toBeDefined()
    })

    it('renders new badge without focus if boosted', () => {
         // Badge de 'Novo' aparece se isNew é true mas as regras no TS costumam priorizar o CSS
         render(<ProductCard {...product} isNew={true} isBoosted={false} />)
         expect(screen.getByText('Novo')).toBeDefined()
    })

    it('renders boosted badge in list variant', () => {
        render(<ProductCard {...product} isBoosted={true} variant="list" />)
        expect(screen.getByText('Destaque')).toBeDefined()
    })
})
