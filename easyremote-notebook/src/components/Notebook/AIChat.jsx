// src/components/Notebook/AIChat.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'
import useStore from '../../store/notebookStore'

const AIChat = () => {
  const [prompt, setPrompt] = useState('')
  const messagesEndRef = useRef(null)
  const { sendMessage } = useWebSocket('ws://localhost:8000/ws')
  const messages = useStore((state) => state.aiMessages)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!prompt.trim()) return

    sendMessage({
      type: 'ai_message',
      content: {
        role: 'user',
        content: prompt,
        timestamp: Date.now()
      }
    })

    setPrompt('')
  }

  return (
    <div className="flex flex-col h-full border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold">AI 助手</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? '你' : 'AI 助手'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="询问 AI 助手..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Send size={16} />
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIChat