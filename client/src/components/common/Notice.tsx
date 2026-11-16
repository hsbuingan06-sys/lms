import { CircleHelp, Check, X } from 'lucide-react';

export function Notice({ message, error, onClose }: { message: string; error?: boolean; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        error ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-primary/25 bg-primary/5 text-primary'
      }`}
    >
      {error ? <CircleHelp size={16} /> : <Check size={16} />}
      <span className="flex-1 text-xs">{message}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Đóng thông báo">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
