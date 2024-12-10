// src/components/Editor/FileCell.jsx
import React, { useCallback } from 'react'
import { Upload, Trash2, Play } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'

const FileCell = ({ cell, onDelete, type }) => {
  const { sendMessage } = useWebSocket('ws://localhost:8000/ws')

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`http://localhost:8000/process_${type}`, {
        method: 'POST',
        body: formData
      })

      const result = await response.blob()
      const url = URL.createObjectURL(result)

      sendMessage({
        type: 'file_update',
        cellId: cell.id,
        content: {
          originalFile: file.name,
          processedUrl: url
        }
      })
    } catch (error) {
      console.error('File processing error:', error)
    }
  }, [cell.id, type])

  return (
    <div className="mb-4 rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between p-2 bg-gray-50">
        <span className="text-sm text-gray-500">
          {type === 'image' ? '图像处理' : '音频处理'}
        </span>
        <button
          onClick={() => onDelete(cell.id)}
          className="p-1 hover:bg-gray-200 rounded text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          <input
            type="file"
            accept={type === 'image' ? "image/*" : "audio/*"}
            onChange={handleFileUpload}
            className="hidden"
            id={`file-${cell.id}`}
          />
          
          <button
            onClick={() => document.getElementById(`file-${cell.id}`).click()}
            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Upload size={24} />
            <span className="text-sm text-gray-500">
              点击上传{type === 'image' ? '图片' : '音频'}文件
            </span>
          </button>

          {cell.content && (
            <div className="mt-4">
              {type === 'image' ? (
                <img
                  src={cell.content.processedUrl}
                  alt="Processed"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <audio
                  controls
                  src={cell.content.processedUrl}
                  className="w-full"
                />
              )}
              <div className="mt-2 text-sm text-gray-500">
                原始文件: {cell.content.originalFile}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileCell