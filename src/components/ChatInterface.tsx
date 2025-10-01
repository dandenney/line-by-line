import { useState, useEffect, useRef } from 'react'
import { ChatMessage, WritingPrompt } from '@/lib/openai'
import { dbOperations } from '@/lib/supabase'
import PromptCard from './PromptCard'
import { ArrowRight } from 'lucide-react'

interface ChatInterfaceProps {
  initialReflection: string
  onComplete: () => void
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
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const [showPrompts, setShowPrompts] = useState(false)
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [reflectionSaved, setReflectionSaved] = useState(false)
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

  const handleGetPrompts = async () => {
    setShowChoice(false)
    setIsGeneratingPrompts(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          type: 'prompts',
          previousResponseId: responseId
        })
      })

      const data = await response.json()
      if (data.prompts) {
        try {
          let cleanedPrompts = data.prompts.trim()
          const jsonStart = cleanedPrompts.indexOf('[')
          const jsonEnd = cleanedPrompts.lastIndexOf(']') + 1

          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanedPrompts = cleanedPrompts.substring(jsonStart, jsonEnd)
          }

          const parsedPrompts = JSON.parse(cleanedPrompts)

          if (!Array.isArray(parsedPrompts)) {
            throw new Error('Response is not an array')
          }

          const formattedPrompts: WritingPrompt[] = parsedPrompts.map((prompt: any, index: number) => ({
            id: `prompt-${Date.now()}-${index}`,
            content: prompt.content || 'No content provided',
            type: ['blog', 'social', 'internal'].includes(prompt.type) ? prompt.type : 'internal',
            saved: false,
            archived: false,
            created_at: new Date().toISOString()
          }))
          setPrompts(formattedPrompts)
          setShowPrompts(true)
        } catch (parseError) {
          console.error('Error parsing prompts:', parseError)
          setPrompts([{
            id: `prompt-fallback-${Date.now()}`,
            content: data.prompts || 'Unable to generate prompts.',
            type: 'internal',
            saved: false,
            archived: false,
            created_at: new Date().toISOString()
          }])
          setShowPrompts(true)
        }
      }
    } catch (error) {
      console.error('Error generating prompts:', error)
    }
    setIsGeneratingPrompts(false)
  }

  useEffect(() => {
    if (prompts.length > 0 && !reflectionSaved) {
      saveReflectionEntry()
      setReflectionSaved(true)
    }
  }, [prompts, reflectionSaved])

  const saveReflectionEntry = async () => {
    try {
      await dbOperations.createReflectionEntry({
        initial_reflection: messages[0]?.content || '',
        conversation_messages: messages,
        prompts: prompts.map(p => ({
          id: p.id,
          content: p.content,
          type: p.type,
          saved: p.saved,
          archived: p.archived,
          created_at: p.created_at
        }))
      })
    } catch (error) {
      console.error('Error saving reflection entry:', error)
    }
  }

  const savePrompt = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      try {
        await dbOperations.savePrompt({
          content: prompt.content,
          type: prompt.type,
          saved: true,
          archived: prompt.archived,
          reflection_entry_id: null
        })

        setPrompts(prev => prev.map(p =>
          p.id === promptId ? { ...p, saved: true } : p
        ))
      } catch (error) {
        console.error('Error saving prompt:', error)
      }
    }
  }

  const archivePrompt = (promptId: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === promptId ? { ...p, archived: true } : p
    ))
  }

  const assistantMessages = messages.filter(m => m.role === 'assistant')
  const latestQuestion = assistantMessages[assistantMessages.length - 1]?.content

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-8">
        <div className="mb-8">
          <details className="mb-8 group" open={showPrompts}>
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors list-none flex items-center">
              <span className="mr-2 group-open:rotate-90 transition-transform inline-block">▸</span>
              View conversation
            </summary>
            <div className="mt-4 space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Reflection</p>
                <p className="text-gray-700 leading-relaxed font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  {messages[0]?.content}
                </p>
              </div>

              {messages.slice(1).map((message, index) => (
                <div key={index} className="space-y-2">
                  {message.role === 'assistant' && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Question</p>
                      <p className="text-gray-700 leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Response</p>
                      <p className="text-gray-700 leading-relaxed font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>

          {latestQuestion && !isLoading && !showPrompts && (
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

        {!showPrompts && (
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
        )}

        {isGeneratingPrompts && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Crafting your writing prompts...</p>
          </div>
        )}

        {showPrompts && prompts.length > 0 && (
          <div className="space-y-8">
            <div className="text-center mb-8 border-t border-gray-200 pt-12">
              <h2 className="text-2xl text-gray-900 font-normal mb-2">
                Your Writing Prompts
              </h2>
              <p className="text-gray-600">
                Here are some ideas inspired by your reflection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onSave={savePrompt}
                  onArchive={archivePrompt}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  ✅ Reflection complete! Your thoughts and prompts have been saved.
                </p>
              </div>
              <button
                onClick={onComplete}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}