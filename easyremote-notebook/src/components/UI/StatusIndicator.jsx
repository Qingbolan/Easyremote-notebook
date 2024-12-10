// src/components/UI/StatusIndicator.jsx
import React from 'react'
import useStore from '../../store/notebookStore'

const StatusIndicator = () => {
  const isConnected = useStore(state => state.connectedStatus)
  const kernelStatus = useStore(state => state.kernelStatus)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-500">
          {isConnected ? '已连接' : '未连接'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          kernelStatus === 'idle' ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <span className="text-sm text-gray-500">
          {kernelStatus === 'idle' ? '就绪' : '运行中'}
        </span>
      </div>
    </div>
  )
}

export default StatusIndicator