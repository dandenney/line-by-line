'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import QuestionTemplateSelector from './QuestionTemplateSelector'

interface SettingsProps {
  onClose: () => void
}

export default function Settings({ onClose }: SettingsProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const handleTemplateChange = () => {
    setHasChanges(true)
    // Could add more logic here if needed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Question Template Selection */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Daily Questions
              </h3>
              <p className="text-gray-600 text-sm">
                Choose the set of questions you&apos;d like to answer each day. You can switch between different question sets anytime.
              </p>
            </div>
            
            <QuestionTemplateSelector onTemplateChange={handleTemplateChange} />
          </section>

          {/* Future settings sections can go here */}
          {/* 
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Streak Settings
            </h3>
            // Streak day settings, etc.
          </section>
          */}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Changes saved automatically
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}