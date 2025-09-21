import { useState, useEffect } from 'react'
import { WritingPrompt, ChatMessage } from '@/lib/openai'
import { Check, Archive, Edit3 } from 'lucide-react'

interface PromptsDisplayProps {
  messages: ChatMessage[]
  onStartOver: () => void
}

export default function PromptsDisplay({ messages, onStartOver }: PromptsDisplayProps) {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generatePrompts()
  }, [messages])

  const generatePrompts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          type: 'prompts'
        })
      })

      const data = await response.json()
      if (data.prompts) {
        try {
          // Clean the response in case there's extra text
          let cleanedPrompts = data.prompts.trim()

          // Find JSON array in the response
          const jsonStart = cleanedPrompts.indexOf('[')
          const jsonEnd = cleanedPrompts.lastIndexOf(']') + 1

          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanedPrompts = cleanedPrompts.substring(jsonStart, jsonEnd)
          }

          const parsedPrompts = JSON.parse(cleanedPrompts)

          // Validate that it's an array
          if (!Array.isArray(parsedPrompts)) {
            throw new Error('Response is not an array')
          }

          const formattedPrompts: WritingPrompt[] = parsedPrompts.map((prompt: any, index: number) => ({
            id: `prompt-${Date.now()}-${index}`,
            content: prompt.content || 'No content provided',
            type: ['blog', 'social', 'internal'].includes(prompt.type) ? prompt.type : 'internal',
            saved: false,
            archived: false,
            createdAt: new Date().toISOString()
          }))
          setPrompts(formattedPrompts)
        } catch (parseError) {
          console.error('Error parsing prompts:', parseError, 'Raw response:', data.prompts)
          // Fallback: create a single prompt from the raw response
          setPrompts([{
            id: `prompt-fallback-${Date.now()}`,
            content: data.prompts || 'Unable to generate prompts. Please try again.',
            type: 'internal',
            saved: false,
            archived: false,
            createdAt: new Date().toISOString()
          }])
        }
      } else {
        // No prompts returned from API
        setPrompts([{
          id: `prompt-error-${Date.now()}`,
          content: 'Sorry, I had trouble generating prompts from your reflection. Please try starting a new reflection.',
          type: 'internal',
          saved: false,
          archived: false,
          createdAt: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error generating prompts:', error)
      // Network or other error
      setPrompts([{
        id: `prompt-network-error-${Date.now()}`,
        content: 'Unable to connect to generate prompts. Please check your connection and try again.',
        type: 'internal',
        saved: false,
        archived: false,
        createdAt: new Date().toISOString()
      }])
    }
    setIsLoading(false)
  }

  const savePrompt = (promptId: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === promptId ? { ...p, saved: true } : p
    ))

    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]')
      savedPrompts.push({ ...prompt, saved: true })
      localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts))
    }
  }

  const archivePrompt = (promptId: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === promptId ? { ...p, archived: true } : p
    ))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800'
      case 'social': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Blog Post'
      case 'social': return 'Social Media'
      case 'internal': return 'Internal Share'
      default: return 'Writing'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Crafting your writing prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl text-gray-900 font-normal mb-4">
            Your Writing Prompts
          </h1>
          <p className="text-gray-600">
            Here are some ideas inspired by your reflection
          </p>
        </div>

        <div className="space-y-6">
          {prompts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No prompts generated. Try starting a new reflection.
            </div>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`border rounded-lg p-6 transition-all duration-200 ${
                  prompt.archived
                    ? 'opacity-50 bg-gray-50'
                    : prompt.saved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(prompt.type)}`}>
                    {getTypeLabel(prompt.type)}
                  </span>
                </div>

                <p className="text-gray-900 leading-relaxed mb-6 font-serif">
                  {prompt.content}
                </p>

                <div className="flex space-x-3">
                  {!prompt.saved && !prompt.archived && (
                    <button
                      onClick={() => savePrompt(prompt.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Check size={16} />
                      <span>Save</span>
                    </button>
                  )}

                  {prompt.saved && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                      <Check size={16} />
                      <span>Saved</span>
                    </div>
                  )}

                  {!prompt.archived && (
                    <button
                      onClick={() => archivePrompt(prompt.id)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Archive size={16} />
                      <span>Archive</span>
                    </button>
                  )}

                  {prompt.archived && (
                    <div className="flex items-center space-x-2 px-4 py-2 text-gray-400">
                      <Archive size={16} />
                      <span>Archived</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onStartOver}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Start New Reflection
          </button>
        </div>
      </div>
    </div>
  )
}