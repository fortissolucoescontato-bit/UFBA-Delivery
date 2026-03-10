import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const TestComponent = () => {
    const { addToCart, items, clearCart } = useCart()
    return (
        <div>
            <button onClick={() => addToCart({ id: '1', name: 'Test', price: 10, sellerId: 's1' })}>Add</button>
            <button onClick={clearCart}>Clear</button>
            <div data-testid="count">{items.length}</div>
            <div data-testid="items">{JSON.stringify(items)}</div>
        </div>
    )
}

describe('CartContext', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('loads corrupted cart and cleans it up', () => {
        const corrupted = [
            { id: '1', name: 'Valid', price: 10, sellerId: 's1', quantity: 1 },
            { id: '2', name: 'Invalid', price: 20, sellerId: 'undefined', quantity: 1 }
        ]
        localStorage.setItem('ufba-cart', JSON.stringify(corrupted))
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        render(<CartProvider><TestComponent /></CartProvider>)
        expect(screen.getByTestId('count').textContent).toBe('1')
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('cleaned up'))
        spy.mockRestore()
    })

    it('loads valid cart without cleanup log', () => {
        const valid = [{ id: '1', name: 'V', price: 10, sellerId: 's1', quantity: 1 }]
        localStorage.setItem('ufba-cart', JSON.stringify(valid))
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        render(<CartProvider><TestComponent /></CartProvider>)
        expect(screen.getByTestId('count').textContent).toBe('1')
        expect(spy).not.toHaveBeenCalled()
        spy.mockRestore()
    })

    it('handles JSON parse error in localStorage', () => {
        localStorage.setItem('ufba-cart', 'invalid-json')
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        render(<CartProvider><TestComponent /></CartProvider>)
        
        expect(screen.getByTestId('count').textContent).toBe('0')
        expect(spy).toHaveBeenCalledWith(expect.stringContaining("Failed to parse cart"), expect.anything())
        spy.mockRestore()
    })

    it('adds items and saves to localStorage', () => {
        render(<CartProvider><TestComponent /></CartProvider>)
        const btn = screen.getByText('Add')
        
        act(() => { btn.click() })
        expect(screen.getByTestId('count').textContent).toBe('1')
        expect(localStorage.getItem('ufba-cart')).toContain('"id":"1"')
    })

    it('updates quantity if item already exists', () => {
        render(<CartProvider><TestComponent /></CartProvider>)
        const btn = screen.getByText('Add')
        
        act(() => { btn.click() })
        act(() => { btn.click() })
        
        expect(screen.getByTestId('count').textContent).toBe('1')
        const items = JSON.parse(localStorage.getItem('ufba-cart') || '[]')
        expect(items[0].quantity).toBe(2)
    })

    it('updates only the relevant item quantity when multiple exist', () => {
        const MultiAdd = () => {
            const { addToCart, items } = useCart()
            return (
                <div>
                   <button onClick={() => addToCart({ id: '1', name: 'T1', price: 10, sellerId: 's1' })}>Add1</button>
                   <button onClick={() => addToCart({ id: '2', name: 'T2', price: 20, sellerId: 's1' })}>Add2</button>
                   <div data-testid="items-json">{JSON.stringify(items)}</div>
                </div>
            )
        }
        render(<CartProvider><MultiAdd /></CartProvider>)
        
        // Add 1, then Add 2, then Add 1 again
        act(() => { screen.getByText('Add1').click() })
        act(() => { screen.getByText('Add2').click() })
        act(() => { screen.getByText('Add1').click() })
        
        const items: any[] = JSON.parse(localStorage.getItem('ufba-cart') || '[]')
        const item1 = items.find((i: any) => i.id === '1')
        const item2 = items.find((i: any) => i.id === '2')
        
        expect(item1.quantity).toBe(2)
        expect(item2.quantity).toBe(1)
    })

    it('removes item from cart', () => {
        const TestRemove = () => {
            const { addToCart, removeFromCart, items } = useCart()
            return (
                <div>
                    <button onClick={() => addToCart({ id: '1', name: 'T', price: 10, sellerId: 's1' })}>Add</button>
                    <button onClick={() => removeFromCart('1')}>Remove</button>
                    <div data-testid="count">{items.length}</div>
                </div>
            )
        }
        render(<CartProvider><TestRemove /></CartProvider>)
        act(() => { screen.getByText('Add').click() })
        expect(screen.getByTestId('count').textContent).toBe('1')
        
        act(() => { screen.getByText('Remove').click() })
        expect(screen.getByTestId('count').textContent).toBe('0')
    })

    it('clears the cart', () => {
        render(<CartProvider><TestComponent /></CartProvider>)
        act(() => { screen.getByText('Add').click() })
        expect(screen.getByTestId('count').textContent).toBe('1')
        
        act(() => { screen.getByText('Clear').click() })
        expect(screen.getByTestId('count').textContent).toBe('0')
        expect(localStorage.getItem('ufba-cart')).toBe('[]')
    })

    it('throws error if used outside provider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => render(<TestComponent />)).toThrow('useCart must be used within CartProvider')
        spy.mockRestore()
    })
})
