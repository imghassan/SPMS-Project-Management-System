import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const noop = () => {};

const fallbackApi = {
  success: noop,
  error: noop,
  info: noop,
  remove: noop
};

const ToastContext = createContext(fallbackApi);

const iconByType = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

const colorByType = {
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
    icon: '#10B981'
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    icon: '#EF4444'
  },
  info: {
    bg: 'rgba(0, 209, 255, 0.10)',
    border: 'rgba(0, 209, 255, 0.22)',
    icon: '#00D1FF'
  }
};

let idSeq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timeoutsRef.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = `${Date.now()}-${idSeq++}`;
      const toast = {
        id,
        type,
        message,
        duration: typeof opts.duration === 'number' ? opts.duration : 3200
      };
      setToasts((prev) => [toast, ...prev].slice(0, 4));

      const timeoutHandle = globalThis.setTimeout(() => {
        remove(id);
      }, toast.duration);
      timeoutsRef.current.set(id, timeoutHandle);

      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      success: (msg, opts) => push('success', msg, opts),
      error: (msg, opts) => push('error', msg, opts),
      info: (msg, opts) => push('info', msg, opts),
      remove
    }),
    [push, remove]
  );

  useEffect(() => {
    return () => {
      for (const handle of timeoutsRef.current.values()) clearTimeout(handle);
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 2000,
          width: 360,
          maxWidth: 'calc(100vw - 36px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none'
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = iconByType[t.type] || Info;
            const colors = colorByType[t.type] || colorByType.info;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  pointerEvents: 'auto',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  padding: '12px 12px',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} style={{ color: colors.icon }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: '#F8FAFC',
                      fontWeight: 700,
                      fontSize: 13,
                      lineHeight: 1.25
                    }}
                  >
                    {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      color: 'rgba(148, 163, 184, 0.95)',
                      fontSize: 12.5,
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {t.message}
                  </div>
                </div>

                <button
                  onClick={() => remove(t.id)}
                  style={{
                    color: 'rgba(148, 163, 184, 0.9)',
                    padding: 6,
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  return ctx || fallbackApi;
};

