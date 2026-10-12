/**
 * Toast notification utility for showing success/error messages
 * This is a simple implementation that can be replaced with a library like react-hot-toast or sonner
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

class ToastManager {
  private container: HTMLElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(this.container);
      }
    }
    
    return this.container;
  }

  private show(message: string, type: ToastType, options: ToastOptions = {}) {
    const container = this.ensureContainer();
    const duration = options.duration || 4000;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `
      min-w-[300px] max-w-md p-4 rounded-lg shadow-lg
      flex items-start gap-3
      animate-in slide-in-from-right
      ${type === 'success' ? 'bg-green-50 border border-green-200' : ''}
      ${type === 'error' ? 'bg-red-50 border border-red-200' : ''}
      ${type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : ''}
      ${type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
    `;

    // Icon
    const icon = document.createElement('span');
    icon.className = 'text-lg';
    icon.innerHTML = 
      type === 'success' ? '✓' :
      type === 'error' ? '✕' :
      type === 'warning' ? '⚠' :
      'ℹ';
    icon.className += 
      type === 'success' ? ' text-green-600' :
      type === 'error' ? ' text-red-600' :
      type === 'warning' ? ' text-yellow-600' :
      ' text-blue-600';

    // Message
    const messageEl = document.createElement('div');
    messageEl.className = `flex-1 text-sm ${
      type === 'success' ? 'text-green-900' :
      type === 'error' ? 'text-red-900' :
      type === 'warning' ? 'text-yellow-900' :
      'text-blue-900'
    }`;
    messageEl.textContent = message;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = `text-gray-400 hover:text-gray-600 ml-2`;
    closeBtn.innerHTML = '✕';
    closeBtn.onclick = () => this.remove(toast);

    toast.appendChild(icon);
    toast.appendChild(messageEl);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => this.remove(toast), duration);

    return toast;
  }

  private remove(toast: HTMLElement) {
    toast.classList.add('animate-out', 'slide-out-to-right');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  success(message: string, options?: ToastOptions) {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.show(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.show(message, 'info', options);
  }

  warning(message: string, options?: ToastOptions) {
    return this.show(message, 'warning', options);
  }
}

export const toast = new ToastManager();

// React hook for using toast in components
export function useToast() {
  const toastFunction = (params: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }) => {
    const message = params.title || params.description || 'Notification';
    const fullMessage = params.title && params.description ? `${params.title}: ${params.description}` : message;
    
    if (params.variant === 'destructive') {
      return toast.error(fullMessage);
    } else if (params.variant === 'success') {
      return toast.success(fullMessage);
    } else {
      return toast.info(fullMessage);
    }
  };

  return {
    toast: toastFunction
  };
}
