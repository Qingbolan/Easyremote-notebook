// src/hooks/useWebSocket.js
import { useEffect, useCallback, useRef } from 'react'
import useStore from '../store/notebookStore'

export function useWebSocket(url) {
  const wsRef = useRef(null)
  const store = useStore()

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      store.setConnectedStatus(true)
    }

    ws.onclose = () => {
      store.setConnectedStatus(false)
      setTimeout(() => {
        wsRef.current = new WebSocket(url)
      }, 3000)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleMessage(message)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [url])

  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'code_update':
        store.updateCell(message.cellId, message.content)
        break
      case 'execution_result':
        store.updateCell(message.cellId, message.output)
        break
      case 'ai_message':
        store.addAIMessage(message.content)
        break
    }
  }, [])

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  return { sendMessage, isConnected: store.connectedStatus }
}