'use client';

/**
 * Toast utility for displaying DaisyUI toasts
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Show a toast notification
 * @param message - The message to display
 * @param type - The type of toast (success, error, warning, info)
 * @param duration - Duration in milliseconds before toast auto-dismisses (default 5000ms)
 */
export const showToast = (message: string, type: ToastType = 'info', duration: number = 5000): void => {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;

  // Remove any existing toasts with the same message to prevent duplicates
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => {
    if (toast.textContent?.includes(message)) {
      toast.remove();
    }
  });

  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container fixed z-[9999]';

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
  toast.className = `alert alert-${type} shadow-lg mb-2 flex items-center justify-between relative`;
  toast.style.animation = 'fadeIn 0.25s ease-out';
  toast.style.minWidth = '400px';  // Minimum width on desktop

  // Create content wrapper for message and close button
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'flex items-center flex-grow';

  // Add the message
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  messageElement.style.flex = '1';
  contentWrapper.appendChild(messageElement);

  // Add the close button
  const closeButton = document.createElement('button');
  closeButton.className = 'ml-2 toast-close-btn';
  closeButton.innerHTML = '&times;';
  closeButton.style.fontSize = '1.5rem';
  closeButton.style.lineHeight = '1';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.cursor = 'pointer';
  closeButton.title = 'Close toast';
  contentWrapper.appendChild(closeButton);

  toast.appendChild(contentWrapper);

  // Add progress bar container at the bottom
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container absolute bottom-0 left-0 right-0 h-1';
  progressContainer.style.height = '4px';
  progressContainer.style.bottom = '0';

  const progressBar = document.createElement('div');
  progressBar.className = `progress-bar bg-white`;
  progressBar.style.width = '100%';
  progressBar.style.height = '100%';
  progressBar.style.transition = `width ${duration}ms linear`;
  progressBar.style.backgroundColor = type === 'success' ? '#10b981' :
    type === 'error' ? '#ef4444' :
      type === 'warning' ? '#f59e0b' : '#3b82f6';

  progressContainer.appendChild(progressBar);
  toast.appendChild(progressContainer);

  // Add to container
  toastContainer.appendChild(toast);

  // Set up auto-dismiss timer
  const dismissTimer = setTimeout(() => {
    removeToast(toast, toastContainer);
  }, duration);

  // Handle progress bar countdown (decreasing width)
  setTimeout(() => {
    progressBar.style.width = '0%';
  }, 10); // Small delay to ensure transition applies

  // Handle close button click
  closeButton.addEventListener('click', () => {
    removeToast(toast, toastContainer, dismissTimer);
  });

  // Prevent dismissing the toast if clicking inside the toast but not the close button
  toast.addEventListener('click', (e) => {
    if (e.target !== closeButton) {
      e.stopPropagation();
    }
  });
};

// Helper function to remove a toast
function removeToast(toast: HTMLElement, toastContainer: HTMLElement | null, timer?: NodeJS.Timeout) {
  if (timer) {
    clearTimeout(timer); // Clear the auto-dismiss timer
  }

  toast.style.animation = 'fadeOut 0.25s ease-out';
  setTimeout(() => {
    toast.remove();
    // Clean up container if empty
    if (toastContainer && toastContainer.children.length === 0) {
      toastContainer.remove();
    }
  }, 250);
}

// Add CSS for fade animations and progress bar
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
    
    .toast-container {
      max-width: calc(100vw - 2rem);  /* Ensure container fits within viewport with margins */
      width: auto;
    }
    
    .alert {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      min-width: 300px;  /* Minimum width on desktop */
      max-width: 100%;
    }
    
    /* On mobile devices, ensure the toast takes full width with reasonable margins */
    @media (max-width: 767px) {
      .alert {
        min-width: auto;
        width: calc(100vw - 2rem);
        max-width: calc(100vw - 2rem);
      }
    }
    
    .progress-container {
      overflow: hidden;
      border-radius: 0 0 4px 4px;
    }
    
    .progress-bar {
      height: 100%;
    }
    
    .toast-close-btn {
      background: none;
      border: none;
      color: inherit;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      margin-left: auto;
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
