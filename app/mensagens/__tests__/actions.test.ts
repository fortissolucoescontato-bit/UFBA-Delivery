import { sendMessage } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('sendMessage action', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: { id: 'user123' } }, error: null })),
            },
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ error: null }),
        }
            ; (createClient as any).mockResolvedValue(supabaseMock)
    })

    it('does nothing if content is empty', async () => {
        await sendMessage('chat1', '   ')
        expect(supabaseMock.from).not.toHaveBeenCalled()
    })

    it('throws error if user is not authenticated', async () => {
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
        await expect(sendMessage('chat1', 'hello')).rejects.toThrow('Unauthorized')
    })

    it('inserts message and revalidates paths', async () => {
        await sendMessage('chat1', 'hello world')

        expect(supabaseMock.from).toHaveBeenCalledWith('messages')
        expect(supabaseMock.insert).toHaveBeenCalledWith({
            chat_id: 'chat1',
            sender_id: 'user123',
            content: 'hello world'
        })
        expect(revalidatePath).toHaveBeenCalledWith('/mensagens/chat1')
        expect(revalidatePath).toHaveBeenCalledWith('/mensagens')
    })

    it('throws error if insert fails', async () => {
        supabaseMock.insert.mockResolvedValueOnce({ error: { message: 'DB Error' } })
        await expect(sendMessage('chat1', 'hello')).rejects.toThrow('Failed to send message')
    })
})
