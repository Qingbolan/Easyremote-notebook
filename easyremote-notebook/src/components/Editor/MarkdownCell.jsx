import React, { useState, useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { Trash2, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import useMarkdownStore from '../../store/markdownStore';

const MarkdownCell = ({ cell, onDelete, onUpdate, viewMode = 'complete', isNewCell = false }) => {
  const [showButtons, setShowButtons] = useState(false);
  const { editingCellId, setEditingCellId } = useMarkdownStore();
  
  // 计算当前单元格是否处于编辑状态
  const isEditing = editingCellId === cell.id;

  // step mode下的已有cell设为预览状态
  useEffect(() => {
    if (viewMode === 'step' && !editingCellId) {
      // 仅在初始化时设置为预览状态
      setEditingCellId(null);
    }
  }, [cell.id, isNewCell, setEditingCellId]);

  // 处理编辑状态切换
  const toggleEditing = useCallback(() => {
    if (!isEditing) {
      setEditingCellId(cell.id); // 直接切换到新的编辑单元格
    } else {
      setEditingCellId(null);
    }
  }, [isEditing, cell.id, setEditingCellId]);

  const handleChange = useCallback((value) => {
    onUpdate(cell.id, value);
  }, [cell.id, onUpdate]);

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
            onClick={toggleEditing}
            className="p-2 hover:bg-gray-200 rounded"
          >
            {isEditing ? <Eye size={20} /> : <Edit2 size={20} />}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(cell.id)}
              className="p-2 hover:bg-gray-200 rounded text-red-500"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
      <div>
        {isEditing ? (
          <CodeMirror
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
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'Enter') {
                toggleEditing();
              }
            }}
            autoFocus
          />
        ) : (
          <div
            className="prose max-w-none text-lg leading-relaxed markdown-cell"
            onClick={toggleEditing}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'Enter') {
                toggleEditing();
              }
            }}
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
  );
};

export default React.memo(MarkdownCell);