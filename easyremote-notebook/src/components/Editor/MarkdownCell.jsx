// Editor/MarkdownCell.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { Trash2, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import useMarkdownStore from '../../store/markdownStore'; // 确保正确导入
import useStore from '../../store/notebookStore';

const MarkdownCell = ({ cell, onDelete, onUpdate, viewMode = 'complete', isNewCell = false }) => {
  const [showButtons, setShowButtons] = useState(false);
  const { editingCellId, setEditingCellId } = useMarkdownStore();
  const { addCell, cells, updateCell, deleteCell, setCurrentCell } = useStore();
  const editorRef = useRef(null); // 用于存储 CodeMirror 实例

  const isEditing = editingCellId === cell.id;
  const hasContent = cell.content.trim().length > 0;

  // 切换编辑模式
  const toggleEditing = useCallback(() => {
    if (!isEditing) {
      setEditingCellId(cell.id);
    } else {
      setEditingCellId(null);
    }
  }, [isEditing, cell.id, setEditingCellId]);

  // 判断Markdown内容是否为空
  const isEmptyMarkdownCell = useCallback((content) => {
    return content.trim() === '';
  }, []);

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
    setEditingCellId(newCellId);

    // 使用 CodeMirror 实例聚焦编辑器
    if (editorRef.current) {
      editorRef.current.focus();
    }

    return newCellId;
  }, [addCell, setEditingCellId]);

  // 创建新的Code单元格
  const createNewCodeCell = useCallback((content, afterIndex) => {
    const newCellId = Date.now().toString();
    const newCell = {
      id: newCellId,
      type: 'code',
      content: content.trim(),
      output: null,
      isNewCell: true
    };

    addCell(newCell, afterIndex + 1);
    setCurrentCell(newCellId);
    setEditingCellId(null);

    // 使用 CodeMirror 实例聚焦编辑器
    if (editorRef.current) {
      editorRef.current.focus();

      const view = editorRef.current.getDoc(); // 获取 CodeMirror 文档
      if (view) {
        view.scrollIntoView({ line: view.lastLine() });
      }
    }

    return newCellId;
  }, [addCell, setEditingCellId, setCurrentCell]);

  // 处理内容变化
  const handleChange = useCallback((value) => {
    const currentIndex = cells.findIndex(c => c.id === cell.id);

    if (value.includes('```')) {
      const [beforeBackticks, ...rest] = value.split('```');
      const codeContent = rest.join('```').trim();

      if (isEmptyMarkdownCell(beforeBackticks)) {
        // 如果Markdown内容为空，删除当前单元格并创建新的Code单元格
        createNewCodeCell(codeContent, currentIndex);
        deleteCell(cell.id);
      } else {
        // 更新当前Markdown单元格内容并创建新的Code单元格
        onUpdate(cell.id, beforeBackticks.trim());
        createNewCodeCell(codeContent, currentIndex);
      }
      return;
    }

    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1];
    const secondLastLine = lines[lines.length - 2];

    // 检查是否符合自动创建新的Markdown单元格的条件
    if (
      lines.length >= 2 &&
      /^#{1,6}\s+.+/.test(secondLastLine) &&
      lastLine.trim() === ''
    ) {
      onUpdate(cell.id, value);
      createNewMarkdownCell(currentIndex);
      return;
    }

    onUpdate(cell.id, value);
  }, [cell.id, cells, onUpdate, createNewCodeCell, createNewMarkdownCell, deleteCell, isEmptyMarkdownCell]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    const currentIndex = cells.findIndex(c => c.id === cell.id);

    if (event.ctrlKey && event.key === 'Enter') {
      toggleEditing();
    } else if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      createNewMarkdownCell(currentIndex);
    } else if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const newIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < cells.length) {
        const targetCell = cells[newIndex];
        setEditingCellId(null);
        
        setTimeout(() => {
          if (targetCell.type === 'markdown') {
            setEditingCellId(targetCell.id);
            if (editorRef.current) {
              editorRef.current.focus();
            }
          } else if (targetCell.type === 'code') {
            setCurrentCell(targetCell.id);
          }
        }, 0);
      }
    }
  }, [cell.id, cells, toggleEditing, createNewMarkdownCell, setEditingCellId, setCurrentCell]);

  // 聚焦编辑器
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing]);

  // 获取 CodeMirror 实例
  const handleCreateEditor = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  return (
    <div
      onMouseEnter={() => setCurrentCell(cell.id)}
      data-cell-id={cell.id}
      className="relative group"
    >
      <div className={`markdown-cell ${!hasContent && !isEditing ? 'min-h-[40px]' : ''}`}>
        <div
          className={`
            flex items-center justify-between transition-opacity duration-200
            ${showButtons || isEditing ? 'opacity-100' : 'opacity-0'}
            ${isEditing || !hasContent ? 'h-10 relative' : 'absolute top-0 left-0 right-0 z-10'}
          `}
          onMouseEnter={() => setShowButtons(true)}
          onMouseLeave={() => setShowButtons(false)}
        >
          <div className="flex-grow"></div>
          <div className="flex items-end gap-2 px-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleEditing();
              }}
              className="p-2 hover:bg-gray-200 rounded"
            >
              {isEditing ? <Eye size={20} /> : <Edit2 size={20} />}
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cell.id);
                }}
                className="p-2 hover:bg-gray-200 rounded text-red-500"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        <div
          className={`${isEditing || !hasContent ? 'mt-2' : ''}`}
          onMouseEnter={() => setShowButtons(true)}
          onMouseLeave={() => setShowButtons(false)}
        >
          {isEditing ? (
            <CodeMirror
              onCreateEditor={handleCreateEditor} // 获取 CodeMirror 实例
              value={cell.content}
              height="auto"
              extensions={[markdown()]}
              onChange={handleChange}
              className="border rounded text-lg bg-white"
              theme={vscodeLight}
              style={{
                fontSize: '25px',
                lineHeight: '2.5',
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <div
              className="prose max-w-none text-lg leading-relaxed markdown-cell min-h-[30px] py-1"
              onClick={toggleEditing}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cell.content || 'Click to edit...'}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MarkdownCell);
