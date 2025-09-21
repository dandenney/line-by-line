import { ReflectionEntry, ChatMessage } from '@/lib/openai'
import { ArrowLeft, Calendar, MessageCircle } from 'lucide-react'

interface ConversationViewProps {
  entry: ReflectionEntry
  onBack: () => void
}

export default function ConversationView({ entry, onBack }: ConversationViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
              <Calendar size={16} />
              <span>{formatDate(entry.completed_at)}</span>
              <span>•</span>
              <MessageCircle size={16} />
              <span>{entry.conversation_messages.length} messages</span>
            </div>

            <h1 className="text-2xl font-normal text-gray-900 mb-4">
              Reflection Discussion
            </h1>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Initial Reflection:</h2>
              <p className="text-gray-900 leading-relaxed font-serif">
                {entry.initial_reflection}
              </p>
            </div>
          </div>
        </div>

        {/* Conversation Messages */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Discussion</h2>

          {entry.conversation_messages.slice(1).map((message, index) => (
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
                <div className={`text-xs font-medium mb-2 ${
                  message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <p className="leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Generated Prompts Summary */}
        {entry.prompts.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Generated Writing Prompts ({entry.prompts.length})
            </h2>
            <div className="grid gap-4">
              {entry.prompts.map((prompt, index) => (
                <div key={prompt.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Prompt {index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prompt.type === 'blog' ? 'bg-blue-100 text-blue-800' :
                      prompt.type === 'social' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {prompt.type === 'blog' ? 'Blog Post' :
                       prompt.type === 'social' ? 'Social Media' : 'Internal Share'}
                    </span>
                  </div>
                  <p className="text-gray-900 leading-relaxed font-serif">
                    {prompt.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}