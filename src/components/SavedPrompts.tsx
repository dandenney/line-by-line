import { useState, useEffect } from 'react'
import { WritingPrompt } from '@/lib/openai'
import { Book, ArrowLeft } from 'lucide-react'

interface SavedPromptsProps {
  onBack: () => void
}

export default function SavedPrompts({ onBack }: SavedPromptsProps) {
  const [savedPrompts, setSavedPrompts] = useState<WritingPrompt[]>([])

  useEffect(() => {
    const prompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]')
    setSavedPrompts(prompts)
  }, [])

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book size={24} className="text-gray-600" />
          </div>
          <h1 className="text-2xl text-gray-900 font-normal mb-4">
            Saved Prompts
          </h1>
          <p className="text-gray-600">
            {savedPrompts.length} writing ideas saved
          </p>
        </div>

        {savedPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No saved prompts yet</p>
            <p className="text-sm text-gray-400">
              Complete a reflection to start collecting writing ideas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="border rounded-lg p-6 bg-white border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(prompt.type)}`}>
                    {getTypeLabel(prompt.type)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-900 leading-relaxed font-serif">
                  {prompt.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}