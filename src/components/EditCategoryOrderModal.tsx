import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import Dialog, { DialogButton } from "@/components/ui/Dialog";

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Category Order"
      maxWidthClass="max-w-sm"
      footer={
        <DialogButton
          variant="primary"
          onClick={() => {
            onSave(order);
            onClose();
          }}
        >
          Save Order
        </DialogButton>
      }
    >
      <div className="space-y-2">
          {order.map((cat, i) => (
            <div key={cat} className="flex items-center justify-between bg-white/5 p-3 rounded-[2px] border border-border-strong">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted/50" />
                <span className="text-sm font-semibold text-foreground">{cat}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="p-1.5 rounded-[2px] hover:bg-white/10 text-muted disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => moveDown(i)}
                  disabled={i === order.length - 1}
                  className="p-1.5 rounded-[2px] hover:bg-white/10 text-muted disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </Dialog>
  );
}
