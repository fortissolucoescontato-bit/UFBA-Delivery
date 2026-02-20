import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

const TestComponent = () => {
    const { items, addToCart, removeFromCart, clearCart, total } = useCart()
    return (
        <div>
            <div data-testid="total">{total}</div>
            <div data-testid="item-count">{items.length}</div>
            <button onClick={() => addToCart({ id: '1', name: 'Product 1', price: 10, sellerId: 's1' })}>Add</button>
            <button onClick={() => removeFromCart('1')}>Remove</button>
            <button onClick={() => clearCart()}>Clear</button>
            {items.map(item => (
                <div key={item.id} data-testid={`item-${item.id}`}>
                    {item.name} - {item.quantity}
                </div>
            ))}
        </div>
    )
}

describe('CartContext', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('provides an empty initial state', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )
        expect(screen.getByTestId('item-count')).toHaveTextContent('0')
        expect(screen.getByTestId('total')).toHaveTextContent('0')
    })

    it('adds an item to the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )

        act(() => {
            screen.getByText('Add').click()
        })

        expect(screen.getByTestId('item-count')).toHaveTextContent('1')
        expect(screen.getByTestId('item-1')).toHaveTextContent('Product 1 - 1')
        expect(screen.getByTestId('total')).toHaveTextContent('10')
    })

    it('increments quantity when adding the same item', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )

        act(() => {
            screen.getByText('Add').click()
            screen.getByText('Add').click()
        })

        expect(screen.getByTestId('item-count')).toHaveTextContent('1')
        expect(screen.getByTestId('item-1')).toHaveTextContent('Product 1 - 2')
        expect(screen.getByTestId('total')).toHaveTextContent('20')
    })

    it('removes an item from the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )

        act(() => {
            screen.getByText('Add').click()
        })
        expect(screen.getByTestId('item-count')).toHaveTextContent('1')

        act(() => {
            screen.getByText('Remove').click()
        })
        expect(screen.getByTestId('item-count')).toHaveTextContent('0')
    })

    it('clears the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )

        act(() => {
            screen.getByText('Add').click()
        })
        expect(screen.getByTestId('item-count')).toHaveTextContent('1')

        act(() => {
            screen.getByText('Clear').click()
        })
        expect(screen.getByTestId('item-count')).toHaveTextContent('0')
    })

    it('loads items from localStorage on initial render', () => {
        const savedCart = JSON.stringify([{ id: '1', name: 'Saved Product', price: 15, quantity: 2, sellerId: 's1' }])
        localStorage.setItem('ufba-cart', savedCart)

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        )

        expect(screen.getByTestId('item-count')).toHaveTextContent('1')
        expect(screen.getByTestId('item-1')).toHaveTextContent('Saved Product - 2')
        expect(screen.getByTestId('total')).toHaveTextContent('30')
    })
})
