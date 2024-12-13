// CodeCell.js
import { useCallback, useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { vscodeLight } from '@uiw/codemirror-theme-vscode'
import { Play, Trash2, Loader2, X } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'
import useStore from '../../store/notebookStore'
import useMarkdownStore from '../../store/markdownStore'

const CodeCell = ({ cell, onDelete }) => {
  const { sendMessage } = useWebSocket('ws://localhost:8000/ws')
  const [output, setOutput] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const editorRef = useRef(null)

  const { currentCellId, setCurrentCell, addCell, cells } = useStore()
  const { setEditingCellId } = useMarkdownStore()
  const isCurrentCell = currentCellId === cell.id

  const createNewMarkdownCell = useCallback((afterIndex) => {
    const newCellId = Date.now().toString()
    const newCell = {
      id: newCellId,
      type: 'markdown',
      content: '',
      output: null,
      isNewCell: true
    }
    
    addCell(newCell, afterIndex + 1)
    setCurrentCell(newCellId)
    setEditingCellId(newCellId)
    
    requestAnimationFrame(() => {
      const editor = document.querySelector(`[data-cell-id="${newCellId}"] .cm-editor`)
      if (editor) {
        editor.focus()
      }
    })

    return newCellId
  }, [addCell, setCurrentCell, setEditingCellId])

  const handleChange = useCallback((value) => {
    sendMessage({
      type: 'code_update',
      cellId: cell.id,
      content: value
    })
  }, [cell.id])

  const handleExecute = useCallback(async () => {
    setIsExecuting(true)
    sendMessage({
      type: 'execution_result',
      cellId: cell.id,
      code: cell.content
    })

    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockOutput = {
      type: 'image',
      content: "https://raw.githubusercontent.com/Qingbolan/EasyRemote/master/docs/easyremote-logo.png"
    }
    setOutput(mockOutput)
    setIsExecuting(false)

    const currentIndex = cells.findIndex(c => c.id === cell.id)
    createNewMarkdownCell(currentIndex)
  }, [cell.id, cell.content, cells, createNewMarkdownCell])

  const handleClearOutput = useCallback(() => {
    setOutput(null)
  }, [])

  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      handleExecute()
    } else if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault()
      const currentIndex = cells.findIndex(c => c.id === cell.id)
      const newIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
      
      if (newIndex >= 0 && newIndex < cells.length) {
        const targetCell = cells[newIndex]
        
        setTimeout(() => {
          if (targetCell.type === 'code') {
            setCurrentCell(targetCell.id)
            requestAnimationFrame(() => {
              const editor = document.querySelector(`[data-cell-id="${targetCell.id}"] .cm-editor`)
              if (editor) {
                editor.focus()
              }
            })
          } else if (targetCell.type === 'markdown') {
            setCurrentCell(targetCell.id)
            setEditingCellId(targetCell.id)
          }
        }, 0)
      }
    }
  }, [cell.id, cells, handleExecute, setCurrentCell, setEditingCellId])

  useEffect(() => {
    if (isCurrentCell) {
      const focusEditor = () => {
        const editor = document.querySelector(`[data-cell-id="${cell.id}"] .cm-editor`)
        if (editor) {
          editor.focus()
          
          const view = editor.querySelector('.cm-content')
          if (view) {
            view.click()
            
            const range = document.createRange()
            range.selectNodeContents(view)
            range.collapse(false)
            
            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(focusEditor)
      })
    }
  }, [isCurrentCell, cell.id])

  return (
    <div
      onMouseEnter={() => setCurrentCell(cell.id)}
      data-cell-id={cell.id}
    >
      <div className={`mb-4 rounded-lg border shadow-sm group ${
        isExecuting ? 'animate-pulse border-yellow-800' : 'bg-gradient-to-b from-rose-50/80 to-orange-50/80 -z-20 text-black'
      }`}>
        <div className="flex items-center justify-between p-2 border-b border-gray-600 rounded-t-lg">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleExecute}
              className="p-2 hover:bg-yellow-600 rounded"
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleClearOutput}
              className="p-2 hover:bg-yellow-600 rounded"
              disabled={!output}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(cell.id)}
              className="p-2 hover:bg-gray-600 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <CodeMirror
            value={cell.content}
            height="auto"
            extensions={[python()]}
            onChange={handleChange}
            className="border-t border-b rounded-b-lg"
            onKeyDown={handleKeyDown}
            theme={vscodeLight}
            style={{
              fontSize: '25px',
              lineHeight: '2.5',
            }}
            readOnly={isExecuting}
            ref={editorRef}
            autoFocus={isCurrentCell}
          />
          {isExecuting && (
            <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center rounded-b-lg">
              <Loader2 className="w-16 h-16 animate-spin text-red-500" />
            </div>
          )}
        </div>

        {output && (
          <div className="p-4 border-t rounded-b-lg">
            {output.type === 'text' ? (
              <pre className="font-mono text-sm whitespace-pre-wrap text-black">
                {output.content}
              </pre>
            ) : output.type === 'image' ? (
              <img src={output.content} alt="Output" className="max-w-full" />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeCell