import { useCallback, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { Play, Trash2, Loader2, X } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'

const CodeCell = ({ cell, onDelete }) => {
  const { sendMessage } = useWebSocket('ws://localhost:8000/ws')
  const [output, setOutput] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleChange = useCallback((value) => {
    sendMessage({
      type: 'code_update',
      cellId: cell.id,
      content: value
    })
  }, [cell.id])

  const handleExecute = useCallback(() => {
    setIsExecuting(true)
    sendMessage({
      type: 'execution_result',
      cellId: cell.id,
      code: cell.content
    })

    // 模拟接收后端返回的执行结果
    setTimeout(() => {
      const mockOutput = {
        // type: 'text',
        // content: `Executing code for cell ${cell.id}...\nResult: Hello, world!`
        type: 'image',
        content: "https://raw.githubusercontent.com/Qingbolan/EasyRemote/master/docs/easyremote-logo.png"
      }
      setOutput(mockOutput)
      setIsExecuting(false)
    }, 5000)
  }, [cell.id, cell.content])

  const handleClearOutput = useCallback(() => {
    setOutput(null)
  }, [])

  return (
    <div>
    <div className={`mb-4 rounded-lg border shadow-sm group ${isExecuting ? 'animate-pulse border-yellow-800' : 'bg-gradient-to-b from-rose-50/80 to-orange-50/80 -z-20 text-black'}`}>
      <div className="flex items-center justify-between p-2 
      border-b border-gray-600 rounded-t-lg">
        {/* <div className="font-mono text-sm text-gray-400">
          In [{cell.executionCount || ' '}]:
        </div> */}
        
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
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === 'Enter') {
              event.preventDefault()
              handleExecute()
            }
          }}
          theme={vscodeLight}
          style={{
            fontSize: '25px',
            lineHeight: '2.5',
          }}
          readOnly={isExecuting}
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