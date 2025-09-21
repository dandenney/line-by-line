import { useState, useEffect } from 'react'
import { ReflectionEntry, WritingPrompt } from '@/lib/openai'
import { dbOperations } from '@/lib/supabase'
import { Plus, Book, Lightbulb, Calendar, Archive } from 'lucide-react'

interface DashboardProps {
  onStartNewReflection: () => void
  onViewConversation: (entry: ReflectionEntry) => void
}

export default function Dashboard({ onStartNewReflection, onViewConversation }: DashboardProps) {
  const [reflectionEntries, setReflectionEntries] = useState<ReflectionEntry[]>([])
  const [savedPrompts, setSavedPrompts] = useState<WritingPrompt[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load reflection entries
      const entries = await dbOperations.getReflectionEntries()
      setReflectionEntries(entries)

      // Load saved prompts
      const prompts = await dbOperations.getSavedPrompts()
      setSavedPrompts(prompts)
    } catch (error) {
      console.error('Error loading data:', error)
    }
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
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-normal text-gray-900 mb-2">
              Your Reflections
            </h1>
            <p className="text-gray-600">
              {reflectionEntries.length} reflections • {savedPrompts.length} saved prompts
            </p>
          </div>
          <button
            onClick={onStartNewReflection}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            <span>New Reflection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reflections */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Book size={20} className="text-gray-600" />
              <h2 className="text-xl font-medium text-gray-900">Recent Reflections</h2>
            </div>

            {reflectionEntries.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reflections yet</h3>
                <p className="text-gray-600 mb-6">Start your learning journey by writing your first reflection.</p>
                <button
                  onClick={onStartNewReflection}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Write First Reflection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reflectionEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => onViewConversation(entry)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-gray-500">{formatDate(entry.completed_at)}</span>
                      <span className="text-sm text-gray-500">{entry.prompts.length} prompts</span>
                    </div>
                    <p className="text-gray-900 leading-relaxed font-serif mb-3">
                      {truncateText(entry.initial_reflection, 200)}
                    </p>
                    <div className="text-sm text-gray-500">
                      {entry.conversation_messages.filter(m => m.role === 'user').length - 1} follow-up exchanges
                    </div>
                  </div>
                ))}

                {reflectionEntries.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                      View all {reflectionEntries.length} reflections
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Saved Prompts */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Lightbulb size={20} className="text-gray-600" />
              <h2 className="text-xl font-medium text-gray-900">Saved Prompts</h2>
            </div>

            {savedPrompts.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                <Archive size={32} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">No saved prompts</h3>
                <p className="text-sm text-gray-600">Save writing prompts from your reflections to keep your best ideas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPrompts.slice(0, 6).map((prompt) => (
                  <div key={prompt.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(prompt.type)}`}>
                        {getTypeLabel(prompt.type)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(prompt.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed font-serif">
                      {truncateText(prompt.content, 120)}
                    </p>
                  </div>
                ))}

                {savedPrompts.length > 6 && (
                  <div className="text-center pt-2">
                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                      View all {savedPrompts.length} prompts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}