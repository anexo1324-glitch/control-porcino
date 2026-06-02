import { Toast } from '@/utils/notifications';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '●';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getToastStyles(toast.type)}
            rounded-lg
            p-4
            shadow-lg
            animate-in
            slide-in-from-right-4
            fade-in
            duration-300
            flex
            items-start
            gap-3
            min-w-64
          `}
        >
          <div className="text-xl font-bold mt-1">{getToastIcon(toast.type)}</div>
          <div className="flex-1">
            <p className="font-bold">{toast.title}</p>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg opacity-75 hover:opacity-100 transition mt-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
