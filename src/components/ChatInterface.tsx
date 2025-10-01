import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/lib/openai'

interface ChatInterfaceProps {
  initialReflection: string
  onComplete: (messages: ChatMessage[], responseId?: string) => void
}

export default function ChatInterface({ initialReflection, onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'user', content: initialReflection }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationCount, setConversationCount] = useState(0)
  const [showChoice, setShowChoice] = useState(false)
  const [responseId, setResponseId] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLTextAreaElement>(null)
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
          type: 'followup',
          previousResponseId: responseId
        })
      })

      const data = await response.json()
      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message } as ChatMessage])
        setResponseId(data.responseId)
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
      setShowChoice(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          type: 'followup',
          previousResponseId: responseId
        })
      })

      const data = await response.json()
      if (data.message) {
        const finalMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: data.message }]
        setMessages(finalMessages)
        setResponseId(data.responseId)

        if (conversationCount + 1 >= maxConversations - 1) {
          setTimeout(() => setShowChoice(true), 1000)
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

  const handleContinueConversation = () => {
    setConversationCount(0)
    setShowChoice(false)
  }

  const handleGetPrompts = () => {
    onComplete(messages, responseId)
  }

  const assistantMessages = messages.filter(m => m.role === 'assistant')
  const latestQuestion = assistantMessages[assistantMessages.length - 1]?.content

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-8">
        <div className="mb-8">
          <details className="mb-8 group">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors list-none flex items-center">
              <span className="mr-2 group-open:rotate-90 transition-transform inline-block">▸</span>
              View your reflection
            </summary>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-700 leading-relaxed font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                {messages[0]?.content}
              </p>
            </div>
          </details>

          {latestQuestion && !isLoading && (
            <div className="mb-8">
              <p className="text-xl text-gray-800 font-normal leading-relaxed">
                {latestQuestion}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="mb-8">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {showChoice ? (
            <div className="text-center space-y-6 py-12">
              <p className="text-gray-700 text-lg">
                Would you like to continue discussing this or get writing prompts now?
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleContinueConversation}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Discussion
                </button>
                <button
                  onClick={handleGetPrompts}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Writing Prompts
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continue writing..."
                disabled={isLoading || conversationCount >= maxConversations}
                className="w-full flex-1 resize-none border-none outline-none text-lg leading-relaxed text-gray-900 bg-transparent font-serif placeholder-gray-400 disabled:opacity-50"
                style={{ fontFamily: 'Georgia, serif' }}
              />

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {currentInput.length > 0 && `${currentInput.split(' ').filter(word => word.length > 0).length} words`}
                </div>
                <button
                  onClick={handleUserResponse}
                  disabled={!currentInput.trim() || isLoading || conversationCount >= maxConversations}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}