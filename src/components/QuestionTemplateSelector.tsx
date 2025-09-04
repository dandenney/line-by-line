'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'
import { QuestionTemplate } from '@/types/database'

interface AvailableTemplate {
  id: string
  name: string
  questions: string[]
}

interface QuestionTemplateSelectorProps {
  onTemplateChange?: (templateId: string) => void
  currentTemplateId?: string | null
}

export default function QuestionTemplateSelector({ 
  onTemplateChange,
  currentTemplateId 
}: QuestionTemplateSelectorProps) {
  const [templates, setTemplates] = useState<AvailableTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(currentTemplateId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadTemplates()
  }, [user])

  const loadTemplates = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Built-in question templates
      const builtInTemplates: AvailableTemplate[] = [
        {
          id: 'learning',
          name: 'Learning Reflection',
          questions: [
            "What did you learn today?",
            "What was most confusing or challenging today?",
            "What did you learn about how you learn?"
          ]
        },
        {
          id: 'standup',
          name: 'Daily Standup',
          questions: [
            "What slowed you down today, and how might someone else avoid it?",
            "Did something about your tools, stack, or workflow spark a rant or love letter?",
            "If today's lesson were a tweet-sized note to your past self, what would it say?"
          ]
        }
      ];

      setTemplates(builtInTemplates)

      // Get current selection from localStorage (user-specific)
      const storageKey = `questionTemplate_${user.id}`;
      const currentSelection = localStorage.getItem(storageKey) || 'learning';
      setSelectedTemplate(currentSelection)

    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Failed to load question templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    if (!user) return

    try {
      setSelectedTemplate(templateId)

      // Store selection in localStorage (user-specific)
      const storageKey = `questionTemplate_${user.id}`;
      localStorage.setItem(storageKey, templateId);

      // Clear any error and notify parent component
      setError(null)
      onTemplateChange?.(templateId)
    } catch (error) {
      console.error('Error updating template selection:', error)
      setError('Failed to save template selection')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700">
        Question Set
      </label>
      
      <div className="space-y-2">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium mb-1">
                  {template.name}
                  <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full">
                    Built-in
                  </span>
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {template.questions.map((question, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">{index + 1}.</span>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTemplate === template.id && (
                <div className="ml-4 text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          No question templates available
        </div>
      )}
    </motion.div>
  )
}