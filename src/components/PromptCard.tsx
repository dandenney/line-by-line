import { Check, Archive } from 'lucide-react'
import { WritingPrompt } from '@/lib/openai'

interface PromptCardProps {
  prompt: WritingPrompt
  onSave: (id: string) => void
  onArchive: (id: string) => void
}

export default function PromptCard({ prompt, onSave, onArchive }: PromptCardProps) {
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
    <div
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
            onClick={() => onSave(prompt.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <Check size={16} />
            <span>Save</span>
          </button>
        )}

        {prompt.saved && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
            <Check size={16} />
            <span>Saved</span>
          </div>
        )}

        {!prompt.archived && (
          <button
            onClick={() => onArchive(prompt.id)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Archive size={16} />
            <span>Archive</span>
          </button>
        )}

        {prompt.archived && (
          <div className="flex items-center space-x-2 px-4 py-2 text-gray-400 text-sm">
            <Archive size={16} />
            <span>Archived</span>
          </div>
        )}
      </div>
    </div>
  )
}
