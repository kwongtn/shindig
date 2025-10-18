'use client';

/**
 * Toast utility for displaying DaisyUI toasts
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Show a toast notification
 * @param message - The message to display
 * @param type - The type of toast (success, error, warning, info)
 */
export const showToast = (message: string, type: ToastType = 'info'): void => {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;

  // Remove any existing toasts with the same message to prevent duplicates
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => {
    if (toast.textContent === message) {
      toast.remove();
    }
  });

  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast fixed z-[9999]';

    // Position below navbar for desktop (navbar is ~4rem height)
    // For mobile, position at bottom
    if (window.innerWidth >= 768) {
      // Desktop: Below navbar
      toastContainer.style.top = 'calc(4rem + 2rem)';
      toastContainer.style.right = '1rem';
      toastContainer.style.bottom = 'auto';
      toastContainer.style.left = 'auto';
    } else {
      // Mobile: Bottom of screen
      toastContainer.style.top = 'auto';
      toastContainer.style.bottom = '1rem';
      toastContainer.style.right = '1rem';
      toastContainer.style.left = 'auto';
    }

    document.body.appendChild(toastContainer);
  }

  // Create the toast element
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} shadow-lg mb-2`;
  toast.style.animation = 'fadeIn 0.25s ease-out';

  // Add the message
  toast.textContent = message;

  // Add to container
  toastContainer.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.25s ease-out';
    setTimeout(() => {
      toast.remove();
      // Clean up container if empty
      if (toastContainer && toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 250);
  }, 5000);
};

// Add CSS for fade animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(10px); }
    }
    
    /* Adjust toast position on window resize */
    @media (min-width: 768px) {
      #toast-container {
        top: calc(4rem + 2rem) !important;
        right: 1rem !important;
        bottom: auto !important;
        left: auto !important;
      }
    }
    
    @media (max-width: 767px) {
      #toast-container {
        top: auto !important;
        bottom: 1rem !important;
        right: 1rem !important;
        left: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Listen for window resize to adjust toast position
if (typeof window !== 'undefined') {
  const handleResize = () => {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      if (window.innerWidth >= 768) {
        // Desktop: Below navbar
        toastContainer.style.top = 'calc(4rem + 1rem)';
        toastContainer.style.right = '1rem';
        toastContainer.style.bottom = 'auto';
        toastContainer.style.left = 'auto';
      } else {
        // Mobile: Bottom of screen
        toastContainer.style.top = 'auto';
        toastContainer.style.bottom = '1rem';
        toastContainer.style.right = '1rem';
        toastContainer.style.left = 'auto';
      }
    }
  };

  window.addEventListener('resize', handleResize);

  // Clean up event listener on unload
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', handleResize);
  });
}
