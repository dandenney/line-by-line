import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/lib/openai'

interface ChatInterfaceProps {
  initialReflection: string
  onComplete: (messages: ChatMessage[]) => void
}

export default function ChatInterface({ initialReflection, onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'user', content: initialReflection }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationCount, setConversationCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const maxConversations = 3

  useEffect(() => {
    if (conversationCount < maxConversations) {
      generateFollowUp()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const generateFollowUp = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          type: 'followup'
        })
      })

      const data = await response.json()
      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message } as ChatMessage])
      }
    } catch (error) {
      console.error('Error generating follow-up:', error)
    }
    setIsLoading(false)
  }

  const handleUserResponse = async () => {
    if (!currentInput.trim()) return

    const userMessage = { role: 'user' as const, content: currentInput.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setCurrentInput('')
    setConversationCount(prev => prev + 1)

    if (conversationCount + 1 >= maxConversations) {
      onComplete(newMessages)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          type: 'followup'
        })
      })

      const data = await response.json()
      if (data.message) {
        const finalMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: data.message }]
        setMessages(finalMessages)

        if (conversationCount + 1 >= maxConversations - 1) {
          setTimeout(() => onComplete(finalMessages), 1000)
        }
      }
    } catch (error) {
      console.error('Error generating follow-up:', error)
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserResponse()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={isLoading || conversationCount >= maxConversations}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleUserResponse}
              disabled={!currentInput.trim() || isLoading || conversationCount >= maxConversations}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}