import { createContext, useContext, useState, useCallback } from 'react';

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popups, setPopups] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setPopups(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const showModal = useCallback((content, options = {}) => {
    const id = Date.now();
    const modal = {
      id,
      type: 'modal',
      content,
      title: options.title,
      onClose: options.onClose,
      buttons: options.buttons || ['OK']
    };
    
    setPopups(prev => [...prev, modal]);
    return id;
  }, []);

  const showAlert = useCallback((title, message, onClose) => {
    const id = Date.now();
    const alert = {
      id,
      type: 'alert',
      title,
      message,
      onClose: () => {
        setPopups(prev => prev.filter(p => p.id !== id));
        if (onClose) onClose();
      }
    };
    
    setPopups(prev => [...prev, alert]);
    return id;
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    const id = Date.now();
    const confirm = {
      id,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        setPopups(prev => prev.filter(p => p.id !== id));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setPopups(prev => prev.filter(p => p.id !== id));
        if (onCancel) onCancel();
      }
    };
    
    setPopups(prev => [...prev, confirm]);
    return id;
  }, []);

  const closePopup = useCallback((id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setPopups([]);
  }, []);

  return (
    <PopupContext.Provider value={{ popups, showToast, showModal, showAlert, showConfirm, closePopup, closeAll }}>
      {children}
      <PopupRenderer popups={popups} />
    </PopupContext.Provider>
  );
}

function PopupRenderer({ popups }) {
  return (
    <>
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {popups.filter(p => p.type === 'toast' || (!p.type && p.message)).map(popup => (
          <div
            key={popup.id}
            className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-lg ${
              popup.type === 'success' || (popup.type === 'toast' && popup.type === 'success')
                ? 'bg-green-500/20 border-green-500/30 text-green-200'
                : popup.type === 'error' || (popup.type === 'toast' && popup.type === 'error')
                ? 'bg-red-500/20 border-red-500/30 text-red-200'
                : popup.type === 'warning' || (popup.type === 'toast' && popup.type === 'warning')
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-200'
            } animate-slide-up`}
          >
            {popup.message}
          </div>
        ))}
      </div>

      {/* Modal Container */}
      {popups.filter(p => p.type === 'modal' || p.type === 'alert' || p.type === 'confirm').map(popup => (
        <div
          key={popup.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => popup.type === 'modal' && popup.onClose && popup.onClose()}
        >
          <div
            className="bg-bg border border-white/10 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {popup.title && (
              <h3 className="text-xl font-bold mb-4 text-white">{popup.title}</h3>
            )}
            
            {popup.message && (
              <p className="text-white/80 mb-6">{popup.message}</p>
            )}
            
            {popup.content && (
              <div className="mb-6">{popup.content}</div>
            )}
            
            <div className="flex gap-3 justify-end">
              {popup.type === 'confirm' ? (
                <>
                  <button
                    onClick={popup.onCancel}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={popup.onConfirm}
                    className="px-4 py-2 bg-cyan hover:bg-cyan-600 rounded text-white transition"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={popup.onClose || (() => {})}
                  className="px-4 py-2 bg-cyan hover:bg-cyan-600 rounded text-white transition"
                >
                  {popup.buttons?.[0] || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
}

