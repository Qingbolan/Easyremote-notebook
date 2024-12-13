// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';

/**
 * 自定义 WebSocket 钩子。
 * @param {string} url - WebSocket 服务器的URL。
 * @returns {Object} - 包含发送消息的方法。
 */
export const useWebSocket = (url) => {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket连接已打开');
    };

    ws.current.onclose = () => {
      console.log('WebSocket连接已关闭');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };

    // 处理接收到的消息（根据需要实现）
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // 根据消息类型处理逻辑
      console.log('Received message:', message);
    };

    return () => {
      ws.current.close();
    };
  }, [url]);

  /**
   * 发送消息到 WebSocket 服务器。
   * @param {Object} message - 要发送的消息对象。
   */
  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接');
    }
  };

  return { sendMessage };
};
