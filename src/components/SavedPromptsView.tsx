import { useState, useEffect } from 'react'
import { WritingPrompt } from '@/lib/openai'
import { ArrowLeft, Book, Trash2 } from 'lucide-react'

interface SavedPromptsViewProps {
  onBack: () => void
}

export default function SavedPromptsView({ onBack }: SavedPromptsViewProps) {
  const [savedPrompts, setSavedPrompts] = useState<WritingPrompt[]>([])

  useEffect(() => {
    const prompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]')
    setSavedPrompts(prompts.sort((a: WritingPrompt, b: WritingPrompt) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  }, [])

  const removePrompt = (promptId: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== promptId)
    setSavedPrompts(updatedPrompts)
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts))
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book size={24} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-4">
            Saved Writing Prompts
          </h1>
          <p className="text-gray-600">
            {savedPrompts.length} writing ideas saved from your reflections
          </p>
        </div>

        {savedPrompts.length === 0 ? (
          <div className="text-center py-16">
            <Book size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No saved prompts yet</h3>
            <p className="text-gray-600 mb-6">
              Complete reflections and save the writing prompts you find inspiring.
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(prompt.type)}`}>
                    {getTypeLabel(prompt.type)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(prompt.createdAt)}
                    </span>
                    <button
                      onClick={() => removePrompt(prompt.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove prompt"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-900 leading-relaxed font-serif text-lg">
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