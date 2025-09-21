import { useState } from 'react'
import WritingInterface from './WritingInterface'
import ChatInterface from './ChatInterface'
import PromptsDisplay from './PromptsDisplay'
import { ChatMessage } from '@/lib/openai'

type AppState = 'writing' | 'chat' | 'prompts'

export default function JournalingApp() {
  const [currentState, setCurrentState] = useState<AppState>('writing')
  const [initialReflection, setInitialReflection] = useState('')
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([])

  const handleWritingSubmit = (content: string) => {
    setInitialReflection(content)
    setCurrentState('chat')
  }

  const handleChatComplete = (messages: ChatMessage[]) => {
    setConversationMessages(messages)
    setCurrentState('prompts')
  }

  const handleStartOver = () => {
    setCurrentState('writing')
    setInitialReflection('')
    setConversationMessages([])
  }

  return (
    <div className="min-h-screen">
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
            onStartOver={handleStartOver}
          />
        </div>
      )}
    </div>
  )
}