import React, { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { Trash2, Eye, Edit2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'

const MarkdownCell = ({ cell, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(true)
  const [showButtons, setShowButtons] = useState(false)

  const handleChange = useCallback((value) => {
    onUpdate(cell.id, value)
    console.log('Markdown content:', value)
  }, [cell.id, onUpdate])

  return (
    <div className="mb-6 relative markdown-cell">
      <div
        className={`flex items-center justify-between transition-opacity duration-200 ${
          showButtons ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <div className="flex-grow"></div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-200 rounded"
          >
            {isEditing ? <Eye size={20} /> : <Edit2 size={20} />}
          </button>
          <button
            onClick={() => onDelete(cell.id)}
            className="p-2 hover:bg-gray-200 rounded text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      <div>
        {isEditing ? (
          <CodeMirror
            value={cell.content}
            height="auto"
            extensions={[markdown()]}
            onChange={handleChange}
            className="border rounded text-lg"
            theme={vscodeLight}
            style={{
              fontSize: '25px',
              lineHeight: '2.5',
            }}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'Enter') {
                setIsEditing(false)
              }
            }}
          />
        ) : (
          <div
            className="prose max-w-none p-6 text-lg leading-relaxed markdown-cell"
            onClick={() => setIsEditing(true)}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'Enter') {
                setIsEditing(true)
              }
            }}
            tabIndex={0}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cell.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownCell