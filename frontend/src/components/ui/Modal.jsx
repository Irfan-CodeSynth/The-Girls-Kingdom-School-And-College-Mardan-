import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] z-10 overflow-hidden font-sans`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5]">
                <h3 className="text-lg font-bold text-[#111827]">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6 text-[#1E293B]">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#FAF8F5] border-t border-[#EFE5E0]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
