
import React, { useState, useEffect } from 'react';
import { X, Info, Check, GripVertical, Pin, ArrowUpToLine } from 'lucide-react';
import { ColumnDef } from '../types';

interface CustomColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onSave: (cols: ColumnDef[]) => void;
  defaultColumns?: ColumnDef[]; // Optional prop to support resetting to defaults
}

export const CustomColumnsModal: React.FC<CustomColumnsModalProps> = ({ 
  isOpen, 
  onClose, 
  columns, 
  onSave,
  defaultColumns
}) => {
  const [localColumns, setLocalColumns] = useState<ColumnDef[]>(columns);
  
  useEffect(() => {
      setLocalColumns(columns);
  }, [columns, isOpen]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleVisibility = (id: string) => {
    setLocalColumns(prev => prev.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const togglePin = (id: string) => {
    setLocalColumns(prev => {
        const pinnedCount = prev.filter(c => c.pinned).length;
        const target = prev.find(c => c.id === id);
        
        if (target && !target.pinned && pinnedCount >= 8) {
            alert("最多可固定8项");
            return prev;
        }

        return prev.map(col => col.id === id ? { ...col, pinned: !col.pinned } : col);
    });
  };

  const moveTop = (id: string) => {
    const newCols = [...localColumns];
    const idx = newCols.findIndex(c => c.id === id);
    if (idx === -1) return;
    
    const [item] = newCols.splice(idx, 1);
    
    if (item.pinned) {
        newCols.unshift(item);
    } else {
        let lastPinnedIdx = -1;
        for (let i = newCols.length - 1; i >= 0; i--) {
            if (newCols[i].pinned) {
                lastPinnedIdx = i;
                break;
            }
        }
        newCols.splice(lastPinnedIdx + 1, 0, item);
    }
    setLocalColumns(newCols);
  };

  const handleDeselectAll = () => {
      setLocalColumns(prev => prev.map(c => ({...c, visible: false})));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      
      const newCols = [...localColumns];
      const visibleItems = newCols.filter(c => c.visible);
      const draggedItem = visibleItems[draggedIndex];
      const targetItem = visibleItems[index];
      
      const realDraggedIdx = newCols.findIndex(c => c.id === draggedItem.id);
      const realTargetIdx = newCols.findIndex(c => c.id === targetItem.id);
      
      const [removed] = newCols.splice(realDraggedIdx, 1);
      newCols.splice(realTargetIdx, 0, removed);
      
      setLocalColumns(newCols);
      setDraggedIndex(index); 
  };

  const handleSave = () => {
    const pinned = localColumns.filter(c => c.pinned);
    const unpinned = localColumns.filter(c => !c.pinned);
    const sorted = [...pinned, ...unpinned];
    onSave(sorted);
    onClose();
  };

  const visibleColumnsList = localColumns.filter(c => c.visible);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[650px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">自定义列</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex p-6 gap-0">
          <div className="flex-1 flex flex-col pr-6 border-r border-gray-100">
             <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded text-xs mb-4 flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5 fill-blue-600 text-white rounded-full"/>
                <span>请勾选当前页面您想展示的列，以后将默认展示您勾选的列。</span>
             </div>
             
             <div className="flex justify-between items-center mb-3">
               <span className="text-gray-500 text-xs">可选 <span onClick={handleDeselectAll} className="text-blue-600 cursor-pointer ml-1 hover:underline">取消全选</span></span>
             </div>

             <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                   {localColumns.map(col => (
                     <label key={col.id} className="flex items-center gap-2 cursor-pointer group select-none hover:bg-gray-50 p-1 rounded">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${col.visible ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                           {col.visible && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={col.visible} onChange={() => toggleVisibility(col.id)} />
                        <span className="text-sm text-gray-700">{col.label}</span>
                     </label>
                   ))}
                </div>
             </div>
          </div>

          <div className="w-[320px] flex flex-col pl-6">
             <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-xs">已选 （上下拖动调整顺序，最多可固定8项）</span>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                {visibleColumnsList.map((col, idx) => (
                  <div 
                    key={col.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    className={`group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-sm text-gray-700 relative select-none cursor-move ${draggedIndex === idx ? 'opacity-50 bg-gray-100' : ''}`}
                  >
                     <div className="flex items-center gap-3">
                        <span className="text-gray-300 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></span>
                        <span>{col.label}</span>
                     </div>
                     
                     <div className="flex items-center gap-1">
                        <div className={`flex items-center gap-1 ${col.pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                            {!col.pinned && (
                                <>
                                    <button onClick={() => toggleVisibility(col.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500" title="隐藏"><X size={14} /></button>
                                    <button onClick={() => moveTop(col.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600" title="置顶"><ArrowUpToLine size={14} /></button>
                                </>
                            )}
                            <button onClick={() => togglePin(col.id)} className={`p-1 hover:bg-gray-200 rounded ${col.pinned ? 'text-gray-400' : 'text-gray-400 hover:text-blue-600'}`} title={col.pinned ? '取消固定' : '固定'}>
                               <Pin size={14} className={col.pinned ? 'fill-gray-400 text-gray-400 transform -rotate-45' : ''} />
                            </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg">
           <button 
                onClick={() => defaultColumns && setLocalColumns(defaultColumns)}
                className={`px-4 py-1.5 border border-gray-200 bg-white rounded text-sm text-gray-600 hover:bg-gray-50 shadow-sm ${!defaultColumns ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!defaultColumns}
           >
                恢复默认
           </button>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-1.5 border border-gray-200 bg-white rounded text-sm text-gray-600 hover:bg-gray-50 shadow-sm">取消</button>
              <button 
                onClick={handleSave} 
                className="px-6 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm"
              >
                保存
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
