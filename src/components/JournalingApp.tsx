import { useState, useEffect } from 'react'
import WritingInterface from './WritingInterface'
import ChatInterface from './ChatInterface'
import PromptsDisplay from './PromptsDisplay'
import Dashboard from './Dashboard'
import ConversationView from './ConversationView'
import AuthForm from './AuthForm'
import { ChatMessage, ReflectionEntry } from '@/lib/openai'
import { dbOperations } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

type AppState = 'dashboard' | 'writing' | 'chat' | 'prompts' | 'conversation'

export default function JournalingApp() {
  const { user, loading, signOut } = useAuth()
  const [currentState, setCurrentState] = useState<AppState>('dashboard')
  const [initialReflection, setInitialReflection] = useState('')
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([])
  const [selectedEntry, setSelectedEntry] = useState<ReflectionEntry | null>(null)

  // Check if this is the user's first time - if no reflections exist, go to writing
  useEffect(() => {
    if (user) {
      checkFirstTime()
    }
  }, [user])

  const checkFirstTime = async () => {
    try {
      const entries = await dbOperations.getReflectionEntries()
      if (entries.length === 0) {
        setCurrentState('writing')
      }
    } catch (error) {
      console.error('Error checking first time:', error)
    }
  }

  const handleStartNewReflection = () => {
    setCurrentState('writing')
    setInitialReflection('')
    setConversationMessages([])
  }

  const handleWritingSubmit = (content: string) => {
    setInitialReflection(content)
    setCurrentState('chat')
  }

  const handleChatComplete = (messages: ChatMessage[]) => {
    setConversationMessages(messages)
    setCurrentState('prompts')
  }

  const handleReflectionComplete = () => {
    setCurrentState('dashboard')
    setInitialReflection('')
    setConversationMessages([])
  }

  const handleViewConversation = (entry: ReflectionEntry) => {
    setSelectedEntry(entry)
    setCurrentState('conversation')
  }

  const handleBackToDashboard = () => {
    setSelectedEntry(null)
    setCurrentState('dashboard')
  }

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen">
      {/* Auth Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Signed in as {user.email}
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {currentState === 'dashboard' && (
        <div className="animate-in fade-in duration-500">
          <Dashboard
            onStartNewReflection={handleStartNewReflection}
            onViewConversation={handleViewConversation}
          />
        </div>
      )}

      {currentState === 'writing' && (
        <div className="animate-in fade-in duration-500">
          <WritingInterface onSubmit={handleWritingSubmit} />
        </div>
      )}

      {currentState === 'chat' && (
        <div className="animate-in fade-in duration-500">
          <ChatInterface
            initialReflection={initialReflection}
            onComplete={handleChatComplete}
          />
        </div>
      )}

      {currentState === 'prompts' && (
        <div className="animate-in fade-in duration-500">
          <PromptsDisplay
            messages={conversationMessages}
            onComplete={handleReflectionComplete}
          />
        </div>
      )}

      {currentState === 'conversation' && selectedEntry && (
        <div className="animate-in fade-in duration-500">
          <ConversationView
            entry={selectedEntry}
            onBack={handleBackToDashboard}
          />
        </div>
      )}
    </div>
  )
}