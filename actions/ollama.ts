'use server'

import ollama from 'ollama'

export interface Message {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export async function chat(messages: Message[]) {
    try {
        const response = await ollama.chat({
            model: 'qwen3:1.7b',
            messages: messages,
        })
        return { message: response.message, success: true }
    } catch (error: any) {
        console.error('Error calling Ollama:', error)
        let errorMessage = 'Maaf, terjadi kesalahan saat menghubungi model AI.'
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            errorMessage = 'Tidak dapat terhubung ke Ollama. Pastikan Ollama sedang berjalan di komputer anda (port 11434).'
        }
        return {
            message: { role: 'assistant', content: errorMessage },
            success: false,
            error: error.message
        }
    }
}
