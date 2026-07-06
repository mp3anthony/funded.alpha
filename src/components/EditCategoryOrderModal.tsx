import { useState, useEffect } from "react";
import { X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSave: (newOrder: string[]) => void;
}

export default function EditCategoryOrderModal({ isOpen, onClose, categories, onSave }: Props) {
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOrder(categories);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Category Order</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-muted hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {order.map((cat, i) => (
            <div key={cat} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-border-strong">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted/50" />
                <span className="text-sm font-semibold text-foreground">{cat}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => moveDown(i)}
                  disabled={i === order.length - 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => {
              onSave(order);
              onClose();
            }}
            className="w-full py-3 bg-primary text-primary-fg font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
