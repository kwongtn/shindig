'use client';

import { auth } from '@/utils/firebase';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import AIBar from './AIBar';
import EventForm, { EventFormRef } from './EventForm';

interface EventDrawerProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  eventId?: string;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const EventDrawer = ({
  isOpen,
  mode = 'add',
  eventId,
  onClose,
  onOpenChange
}: EventDrawerProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [handleAIDataExtract, setHandleAIDataExtract] = useState<((data: Record<string, unknown> | null) => void) | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const eventFormRef = useRef<EventFormRef>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Subscribe to authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Handle escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isDirty]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure overflow is reset when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle click outside drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isDirty]);

  // Close drawer when user logs out
  useEffect(() => {
    if (!user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleClose = () => {
    if (isDirty) {
      const result = confirm('Changes will be discarded if the drawer closes. Do you want to continue?');
      if (result) {
        setIsDirty(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleFormChange = (dirty: boolean) => {
    setIsDirty(dirty);
  };

  // Handle AI data extraction completion
  const handleExtractComplete = (data: any) => {
    if (handleAIDataExtract) {
      handleAIDataExtract(data);
    }
  };

  // Handle delete button click (with confirmation) in edit mode
  const handleDeleteClick = () => {
    if (eventFormRef.current) {
      eventFormRef.current.handleDeleteClick();
    }
  };

  // Listen for closeDrawer event from EventForm
  useEffect(() => {
    const handleCloseDrawer = () => {
      onClose();
    };

    window.addEventListener('closeDrawer', handleCloseDrawer);
    return () => window.removeEventListener('closeDrawer', handleCloseDrawer);
  }, [onClose]);

  // Title based on mode
  const title = mode === 'add' ? 'Add Event Entry' : 'Edit Event Entry';

  return (
    <>
      {/* Backdrop/scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-[700px] max-w-full transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-base-100 shadow-2xl flex flex-col`}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100 p-4">
          <div className="flex items-center">
            <button
              onClick={handleClose}
              className="mr-3 btn btn-ghost"
              aria-label="Close drawer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-4 overflow-x-hidden">
          <AIBar
            onExtractComplete={handleExtractComplete}
            isFormDirty={isDirty}
          />
          <EventForm
            ref={eventFormRef}
            mode={mode}
            eventId={eventId}
            onChange={handleFormChange}
            userId={user?.uid}
            drawerIsOpen={isOpen}
            onAIDataExtract={setHandleAIDataExtract}
            onClose={onClose}
          />
        </div>

        {/* Footer - Sticky */}
        <div className="border-t border-base-300 bg-base-100 p-4">
          <div className="flex justify-between items-center">
            {mode === 'edit' && (
              <button
                className="btn btn-error"
                onClick={handleDeleteClick}
              >
                {deleteConfirm ? '⚠️ Really delete event?' : 'Delete Event'}
              </button>
            )}
            <div className="flex justify-end gap-2 ml-auto">
              <button
                className="btn btn-soft"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  console.log('EventDrawer: Submit button clicked');
                  // Mark all fields as visited in the form before submitting
                  if (eventFormRef.current && typeof eventFormRef.current.setAllFieldsVisited === 'function') {
                    eventFormRef.current.setAllFieldsVisited();
                  }
                  // The actual submission will be handled by the EventForm component
                  const form = document.getElementById('event-form') as HTMLFormElement;
                  if (form) {
                    console.log('EventDrawer: Found form element, dispatching submit event');
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  } else {
                    console.error('EventDrawer: Form element with ID "event-form" not found');
                  }
                }}
                disabled={isLoading}
              >
                {mode === 'add' ? 'Submit' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDrawer;
