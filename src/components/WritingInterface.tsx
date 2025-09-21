import { useState, useRef, useEffect } from 'react'

interface WritingInterfaceProps {
  onSubmit: (content: string) => void
}

export default function WritingInterface({ onSubmit }: WritingInterfaceProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-8">
        <div className="mb-12">
          <h1 className="text-2xl text-gray-800 font-normal mb-8 text-center">
            What stood out to you today?
          </h1>
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 resize-none border-none outline-none text-lg leading-relaxed text-gray-900 bg-transparent font-serif placeholder-gray-400"
            placeholder="Start writing..."
            style={{ fontFamily: 'Georgia, serif' }}
          />

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {content.length > 0 && `${content.split(' ').filter(word => word.length > 0).length} words`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}