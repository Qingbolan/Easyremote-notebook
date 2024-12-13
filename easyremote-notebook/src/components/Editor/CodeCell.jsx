// Editor/CodeCell.js
import React, { useCallback, useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { Play, Trash2, Loader2, X } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import useStore from '../../store/notebookStore';
import useMarkdownStore from '../../store/markdownStore';

const CodeCell = ({ cell, onDelete }) => {
    const { sendMessage } = useWebSocket('ws://localhost:8000/ws');
    const [output, setOutput] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const editorRef = useRef(null); // 用于存储 CodeMirror 实例

    const { currentCellId, setCurrentCell, addCell, cells } = useStore();
    const { setEditingCellId } = useMarkdownStore(); // 获取 setEditingCellId 方法
    const isCurrentCell = currentCellId === cell.id;

    // 创建新的Markdown单元格
    const createNewMarkdownCell = useCallback((afterIndex) => {
        const newCellId = Date.now().toString();
        const newCell = {
            id: newCellId,
            type: 'markdown',
            content: '',
            output: null,
            isNewCell: true
        };
        
        addCell(newCell, afterIndex + 1);
        setCurrentCell(newCellId);
        setEditingCellId(newCellId);
        
        // 使用 CodeMirror 实例聚焦编辑器
        if (editorRef.current) {
            editorRef.current.focus();
        }

        return newCellId;
    }, [addCell, setCurrentCell, setEditingCellId]);

    // 处理内容变化
    const handleChange = useCallback((value) => {
        sendMessage({
            type: 'code_update',
            cellId: cell.id,
            content: value
        });
    }, [cell.id, sendMessage]);

    // 执行代码
    const handleExecute = useCallback(async () => {
        try {
            setIsExecuting(true);
            sendMessage({
                type: 'execution_result',
                cellId: cell.id,
                code: cell.content
            });

            // 模拟代码执行延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 模拟输出结果
            const mockOutput = {
                type: 'image',
                content: "https://raw.githubusercontent.com/Qingbolan/EasyRemote/master/docs/easyremote-logo.png"
            };
            setOutput(mockOutput);
            setIsExecuting(false);

            // 在当前单元格之后添加一个新的Markdown单元格
            const currentIndex = cells.findIndex(c => c.id === cell.id);
            createNewMarkdownCell(currentIndex);
        } catch (error) {
            console.error('执行单元格时出错:', error);
            // 您可以在这里设置错误状态以在UI中显示
            setIsExecuting(false);
        }
    }, [cell.id, cell.content, cells, sendMessage, createNewMarkdownCell]);

    // 清除输出
    const handleClearOutput = useCallback(() => {
        setOutput(null);
    }, []);

    // 处理键盘事件
    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            handleExecute();
        } else if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
            const currentIndex = cells.findIndex(c => c.id === cell.id);
            const newIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
            
            if (newIndex >= 0 && newIndex < cells.length) {
                const targetCell = cells[newIndex];
                
                setTimeout(() => {
                    if (targetCell.type === 'code') {
                        setCurrentCell(targetCell.id);
                        if (editorRef.current) {
                            editorRef.current.focus();
                        }
                    } else if (targetCell.type === 'markdown') {
                        setCurrentCell(targetCell.id);
                        setEditingCellId(targetCell.id);
                    }
                }, 0);
            }
        }
    }, [cell.id, cells, handleExecute, setCurrentCell, setEditingCellId]);

    // 聚焦当前单元格的编辑器
    useEffect(() => {
        if (isCurrentCell && editorRef.current) {
            editorRef.current.focus();
        }
    }, [isCurrentCell]);

    // 获取 CodeMirror 实例
    const handleCreateEditor = useCallback((editor) => {
        editorRef.current = editor;
    }, []);

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
                        onCreateEditor={handleCreateEditor} // 获取 CodeMirror 实例
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
    );
}

export default CodeCell;
