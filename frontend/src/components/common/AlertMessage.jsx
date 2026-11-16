import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertMessage = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const config = {
    error: {
      className: 'alert alert-error',
      icon: <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />,
    },
    success: {
      className: 'alert alert-success',
      icon: <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />,
    },
    info: {
      className: 'alert alert-info',
      icon: <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />,
    },
  };

  const current = config[type] || config.error;

  return (
    <div className={current.className} role="alert">
      {current.icon}
      <div style={{ flex: 1, fontWeight: 500 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.8,
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
