/* eslint-disable react/display-name */
'use client';

import { useForm } from '@/hooks/useForm';
import { showToast } from '@/utils/toast';
import 'easymde/dist/easymde.min.css';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import { forwardRef, useImperativeHandle } from 'react';
import { db } from '@/utils/firebase';

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(
  () => import('react-simplemde-editor'),
  { ssr: false }
);

// Utility functions for timezone-aware datetime conversion
const convertToLocalISOString = (date: Date): string => {
  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const convertToLocalISOStringForFirestore = (dateString: string): Date => {
  // Create a date in the browser's local timezone
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create a new Date object using local time components
  return new Date(year, month - 1, day, hours, minutes);
};

interface EventFormProps {
  mode: 'add' | 'edit';
  eventId?: string;
  onChange: (dirty: boolean) => void;
  userId: string | undefined;
  drawerIsOpen: boolean;
  onAIDataExtract: (handleAIDataExtract: (data: Record<string, unknown> | null) => void) => void; // Callback to handle AI extraction
  onClose?: () => void; // Callback to close the drawer
}

// Define a ref type that exposes the delete and fieldVisited methods
export interface EventFormRef {
  handleDeleteClick: () => void;
  setAllFieldsVisited: () => void;
}

interface FormValues {
  title: string;
  subtitle: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  eventLinks: string[];
  organizerIds: string[];
  bannerUri: string;
  tagIds: string[];
  isPaid: boolean;
  isWalkInAvailable: boolean;
  isConfirmed: boolean;
  isApproved: boolean;
  // For edit mode
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}



const EventForm = forwardRef<EventFormRef, EventFormProps>(({ mode, eventId, onChange, userId, drawerIsOpen, onAIDataExtract, onClose }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTimeoutId, setDeleteTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // For edit mode data
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  // Organizers and tags data for dropdowns
  const [organizers, setOrganizers] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [organizersLoading, setOrganizersLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Memoized SimpleMDE options to prevent re-renders
  const memoizedSimpleMDEOptions = useMemo(() => ({
    minHeight: '150px',
    // Add your theme based on user's preference
    // For now, using the default theme
    status: false, // Disable status bar
  }), []);

  // Initialize form with default values
  const initialFormValues: FormValues = useMemo(() => ({
    title: '',
    subtitle: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    eventLinks: [],
    organizerIds: [],
    bannerUri: '',
    tagIds: [],
    isPaid: false,
    isWalkInAvailable: true,
    isConfirmed: false,
    isApproved: false
  }), []);

  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [fieldVisited, setFieldVisited] = useState<Record<string, boolean>>({});
  const { values, errors, handleChange, handleBlur, handleSubmit, setValues, setField, isDirty } = useForm<FormValues>({
    initialValues: initialFormValues,
    onSubmit: async (values) => {
      console.log('EventForm: onSubmit handler called', { values, userId, mode, eventId });
      // Mark ALL fields as visited to ensure validation on submit
      setFieldVisited(prev => ({
        ...prev,
        title: true,
        subtitle: true,
        description: true,
        startDatetime: true,
        endDatetime: true,
        eventLinks: true,
        organizerIds: true,
        bannerUri: true,
        tagIds: true,
        isPaid: true,
        isWalkInAvailable: true,
        isConfirmed: true,
        isApproved: true,
      }));

      // Check for validation errors before submission
      const validationErrors: Partial<Record<keyof FormValues, unknown>> = {};
      if (!values.title.trim()) {
        validationErrors.title = 'Title is required';
      }
      if (!values.startDatetime) {
        validationErrors.startDatetime = 'Start datetime is required';
      }
      if (!values.endDatetime) {
        validationErrors.endDatetime = 'End datetime is required';
      }
      if (values.startDatetime && values.endDatetime) {
        if (convertToLocalISOStringForFirestore(values.startDatetime) >= convertToLocalISOStringForFirestore(values.endDatetime)) {
          validationErrors.endDatetime = 'End datetime must be after start datetime';
        }
      }
      if (!values.eventLinks || values.eventLinks.length === 0) {
        validationErrors.eventLinks = ['At least one event link is required'];
      }

      console.log('EventForm: Validation errors before submission:', validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        console.log('EventForm: Form has validation errors, not submitting');
        return;
      }

      if (!userId) {
        console.log('EventForm: No userId found, showing error toast');
        showToast('You must be logged in to submit an event', 'error');
        return;
      }

      console.log('EventForm: Starting submission process');
      setSubmitting(true);
      setError(null);

      try {
        // Prepare data for Firestore - use local timezone when converting datetime values to Timestamps
        const eventData = {
          ...values,
          authorId: doc(db, `users/${userId}`),
          organizerIds: values.organizerIds.map(id => doc(db, `organizers/${id}`)),
          tagIds: values.tagIds.map(id => doc(db, `tags/${id}`)),
          startDatetime: values.startDatetime ? Timestamp.fromDate(convertToLocalISOStringForFirestore(values.startDatetime)) : null,
          endDatetime: values.endDatetime ? Timestamp.fromDate(convertToLocalISOStringForFirestore(values.endDatetime)) : null,
          createdAt: mode === 'add' ? Timestamp.fromDate(new Date()) :
            values.createdAt ? Timestamp.fromDate(new Date(values.createdAt)) :
              Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };
        console.log('EventForm: Prepared event data for Firestore', eventData);

        let eventIdForToast = '';

        if (mode === 'add') {
          console.log('EventForm: Adding new event to Firestore');
          const newEventRef = doc(collection(db, 'events')); // Generate new ID
          await setDoc(newEventRef, eventData);
          eventIdForToast = newEventRef.id;
          console.log('EventForm: New event added successfully with ID:', eventIdForToast);
          showToast(`🎉 Event added successfully! ID: ${eventIdForToast}`, 'success');
          localStorage.removeItem('eventFormDraft');
        } else if (mode === 'edit' && eventId) {
          console.log('EventForm: Updating existing event in Firestore with ID:', eventId);
          const eventRef = doc(db, 'events', eventId);
          // Remove id, createdAt from update since they're read-only in edit mode
          const { id, createdAt, ...updateData } = eventData;
          await updateDoc(eventRef, updateData);
          eventIdForToast = eventId;
          console.log('EventForm: Event updated successfully');
          showToast(`🎉 Event updated successfully! ID: ${eventIdForToast}`, 'success');
        } else if (mode === 'edit' && !eventId) {
          console.error('EventForm: Missing eventId in edit mode');
          showToast('Missing event ID for edit mode', 'error');
          return;
        }

        // Close the drawer after successful submission
        if (onClose) {
          setTimeout(onClose, 1000); // Delay closing to allow user to see the success message
        }


        // Optionally close the drawer or redirect
        // This would be handled by parent component
      } catch (err) {
        console.error('EventForm: Error submitting event:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showToast('Failed to submit event. Please try again.', 'error');
      } finally {
        console.log('EventForm: Setting submitting to false');
        setSubmitting(false);
      }
    },
    validate: (values) => {
      const newErrors: Partial<Record<keyof FormValues, unknown>> = {};
      console.log('EventForm: Starting validation for values:', values);

      if (!values.title.trim()) {
        newErrors.title = 'Title is required';
      }

      if (!values.startDatetime) {
        newErrors.startDatetime = 'Start datetime is required';
      }

      if (!values.endDatetime) {
        newErrors.endDatetime = 'End datetime is required';
      }

      if (values.startDatetime && values.endDatetime) {
        if (convertToLocalISOStringForFirestore(values.startDatetime) >= convertToLocalISOStringForFirestore(values.endDatetime)) {
          newErrors.endDatetime = 'End datetime must be after start datetime';
        }
      }

      if (!values.eventLinks || values.eventLinks.length === 0) {
        newErrors.eventLinks = ['At least one event link is required'];
      } else {
        // Validate URLs
        for (const link of values.eventLinks) {
          try {
            new URL(link);
          } catch (err) {
            if (!newErrors.eventLinks) {
              newErrors.eventLinks = ['Invalid URL in event links'];
            }
            break;
          }
        }
      }

      console.log('EventForm: Validation completed with errors:', newErrors);
      return newErrors;
    }
  });

  // Debug form initialization
  useEffect(() => {
    console.log('EventForm: Component mounted with props:', { mode, eventId, userId, drawerIsOpen });
  }, [mode, eventId, userId, drawerIsOpen]);

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === 'edit' && eventId && userId && !editDataLoaded) {
      const loadEventData = async () => {
        try {
          const eventRef = doc(db, 'events', eventId);
          const eventDoc = await getDoc(eventRef);

          if (eventDoc.exists()) {
            const eventData = eventDoc.data();

            // Check if user is the author or admin
            const isAuthor = eventData.authorId?.path === `users/${userId}`;

            if (isAuthor || isAdmin) {
              // Format the data for the form
              const formattedData: FormValues = {
                ...initialFormValues,
                id: eventDoc.id,
                title: eventData.title || '',
                subtitle: eventData.subtitle || '',
                description: eventData.description || '',
                startDatetime: eventData.startDatetime && typeof eventData.startDatetime.toDate === 'function'
                  ? convertToLocalISOString(eventData.startDatetime.toDate())
                  : eventData.startDatetime || '',
                endDatetime: eventData.endDatetime && typeof eventData.endDatetime.toDate === 'function'
                  ? convertToLocalISOString(eventData.endDatetime.toDate())
                  : eventData.endDatetime || '',
                eventLinks: eventData.eventLinks || [],
                organizerIds: eventData.organizerIds?.map((ref: { id: string }) => ref.id) || [],
                bannerUri: eventData.bannerUri || '',
                tagIds: eventData.tagIds?.map((ref: { id: string }) => ref.id) || [],
                isPaid: eventData.isPaid || false,
                isWalkInAvailable: eventData.isWalkInAvailable || true,
                isConfirmed: eventData.isConfirmed || false,
                isApproved: eventData.isApproved || false,
                createdAt: eventData.createdAt ? eventData.createdAt.toDate().toISOString() : undefined,
                updatedAt: eventData.updatedAt ? eventData.updatedAt.toDate().toISOString() : undefined
              };

              setValues(formattedData);
              setEditDataLoaded(true);
            } else {
              setError('You do not have permission to edit this event');
            }
          } else {
            setError('Event not found');
          }
        } catch (err) {
          console.error('Error loading event data:', err);
          setError('Failed to load event data');
        }
      };

      loadEventData();
    }
  }, [mode, eventId, userId, editDataLoaded, isAdmin, initialFormValues, setValues]);

  // Load organizers and tags data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        // Load organizers
        const organizersQuery = query(collection(db, 'organizers'));
        const organizersSnapshot = await getDocs(organizersQuery);
        const organizersList = organizersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setOrganizers(organizersList);
        setOrganizersLoading(false);

        // Load tags
        const tagsQuery = query(collection(db, 'tags'));
        const tagsSnapshot = await getDocs(tagsQuery);
        const tagsList = tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setTags(tagsList);
        setTagsLoading(false);
      } catch (err) {
        console.error('Error loading reference data:', err);
        setOrganizersLoading(false);
        setTagsLoading(false);
      }
    };

    loadReferenceData();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (userId) {
      const checkAdmin = async () => {
        try {
          const userDoc = await getDoc(doc(db, `users/${userId}`));
          const userData = userDoc.data();
          setIsAdmin(!!userData?.claims?.isAdmin);
        } catch (err) {
          console.error('Error checking admin status:', err);
        }
      };

      checkAdmin();
    }
  }, [userId]);

  // Handle date changes - set endDatetime to 3 hours after startDatetime if endDatetime is empty or before startDatetime
  useEffect(() => {
    if (values.startDatetime && (!values.endDatetime || convertToLocalISOStringForFirestore(values.startDatetime) > convertToLocalISOStringForFirestore(values.endDatetime))) {
      const startDate = convertToLocalISOStringForFirestore(values.startDatetime);
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
      setField('endDatetime', convertToLocalISOString(endDate));
    }
  }, [values.startDatetime, setField]);

  // Handle localStorage draft saving (only for add mode)
  useEffect(() => {
    if (mode === 'add' && drawerIsOpen && isDirty) {
      // Save form values to localStorage periodically
      const saveDraftInterval = setInterval(() => {
        localStorage.setItem('eventFormDraft', JSON.stringify(values));
      }, 500); // Save every .5 seconds

      return () => clearInterval(saveDraftInterval);
    }
  }, [values, isDirty, mode, drawerIsOpen]);

  // Check for draft on component mount (only for add mode)
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showUndoButton, setShowUndoButton] = useState(false);

  const defaultDraftValues = useMemo(() => ({
    title: "",
    subtitle: "",
    description: "",
    startDatetime: "",
    endDatetime: "",
    eventLinks: [],
    organizerIds: [],
    bannerUri: "",
    tagIds: [],
    isPaid: false,
    isWalkInAvailable: true,
    isConfirmed: false,
    isApproved: false
  }), []);

  useEffect(() => {
    // Reset form state when drawer opens/closes or mode changes
    if (mode === 'add' && drawerIsOpen && !editDataLoaded) {
      // Check for existing draft on drawer open
      const draft = localStorage.getItem('eventFormDraft');
      if (draft) {
        try {
          const draftValues = JSON.parse(draft);

          // Check if the draft is different from the default values
          const isDefaultDraft = JSON.stringify(draftValues) === JSON.stringify(defaultDraftValues);

          if (!isDefaultDraft) {
            // Show alert instead of automatically restoring
            setShowDraftAlert(true);
          }
        } catch (err) {
          console.error('Error parsing draft:', err);
        }
      }
    } else if (mode === 'edit') {
      // Reset draft-related states in edit mode
      setShowDraftAlert(false);
      setShowUndoButton(false);
    }
  }, [mode, drawerIsOpen, editDataLoaded, defaultDraftValues]);

  // Function to restore draft
  const restoreDraft = () => {
    const draft = localStorage.getItem('eventFormDraft');
    if (draft) {
      try {
        const draftValues = JSON.parse(draft);
        setValues(draftValues);
        setShowDraftAlert(false);
        setShowUndoButton(true); // Show undo button after restore
      } catch (err) {
        console.error('Error parsing draft:', err);
      }
    }
  };

  // Function to undo draft restoration (just reset to initial values)
  const undoDraft = () => {
    setValues(initialFormValues);
    setShowUndoButton(false); // Hide undo button
    setShowDraftAlert(true);
  };

  // Effect to reset form when drawer opens/closes (to fix persistence issue)
  useEffect(() => {
    if (!drawerIsOpen) {
      // Reset all draft-related states when drawer closes
      setShowDraftAlert(false);
      setShowUndoButton(false);
    } else {
      // When drawer opens in 'add' mode, reset to initial values
      if (mode === 'add' && !editDataLoaded) {
        setValues(initialFormValues);
        setFieldTouched({});  // Reset touched fields
        setFieldVisited({});  // Reset visited fields
      }
    }
  }, [drawerIsOpen, mode, editDataLoaded, initialFormValues, setValues]);

  // Custom field blur handler to track visited fields
  const handleFieldBlur = (fieldName: string) => {
    // Mark the field as visited so errors persist after leaving the field
    setFieldVisited(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Expose the delete and field visited methods via the ref
  useImperativeHandle(ref, () => ({
    handleDeleteClick,
    setAllFieldsVisited: () => {
      setFieldVisited({
        title: true,
        subtitle: true,
        description: true,
        startDatetime: true,
        endDatetime: true,
        eventLinks: true,
        organizerIds: true,
        bannerUri: true,
        tagIds: true,
        isPaid: true,
        isWalkInAvailable: true,
        isConfirmed: true,
        isApproved: true,
      });
    }
  }));

  // Disable localStorage draft saving for edit mode as per requirements
  useEffect(() => {
    if (mode === 'edit') {
      // Do not save drafts in edit mode
      return;
    }

    if (mode === 'add' && drawerIsOpen && isDirty) {
      // Save form values to localStorage periodically
      const saveDraftInterval = setInterval(() => {
        localStorage.setItem('eventFormDraft', JSON.stringify(values));
      }, 5000); // Save every 5 seconds

      return () => clearInterval(saveDraftInterval);
    }
  }, [values, isDirty, mode, drawerIsOpen]);

  // Handle AI data extraction
  useEffect(() => {
    if (onAIDataExtract) {
      onAIDataExtract(handleAIDataExtract);
    }
  }, [onAIDataExtract]);

  // Debug form values changes
  useEffect(() => {
    console.log('EventForm: Form values changed:', values);
  }, [values]);

  // Debug form errors changes
  useEffect(() => {
    console.log('EventForm: Form errors changed:', errors);
  }, [errors]);

  // Notify parent when form is dirty
  useEffect(() => {
    console.log('EventForm: Form isDirty state changed to:', isDirty);
    onChange(isDirty);
  }, [isDirty, onChange]);

  // Debug form values changes
  useEffect(() => {
    console.log('EventForm: Form values changed:', values);
  }, [values]);

  // Debug form errors changes
  useEffect(() => {
    console.log('EventForm: Form errors changed:', errors);
  }, [errors]);

  // Function to handle AI data extraction
  const handleAIDataExtract = (data: Record<string, unknown> | null) => {
    // Check if data exists
    if (!data) {
      return;
    }

    // Prepare updated values from the AI extraction
    const updatedValues: Partial<FormValues> = {};

    // Map the extracted data to form fields, only if they exist in the data
    if (typeof data.title === 'string' && data.title !== null && data.title !== '') {
      updatedValues.title = data.title;
    }

    if (data.startTime !== undefined && data.startTime !== null) {
      // Convert to the correct format for datetime-local input using local timezone
      const startTime = new Date(data.startTime as string);
      updatedValues.startDatetime = convertToLocalISOString(startTime);
    }

    if (data.endTime !== undefined && data.endTime !== null) {
      // Convert to the correct format for datetime-local input using local timezone
      const endTime = new Date(data.endTime as string);
      updatedValues.endDatetime = convertToLocalISOString(endTime);
    }

    if (typeof data.description === 'string' && data.description !== null && data.description !== '') {
      updatedValues.description = data.description;
    }

    if (typeof data.bannerUri === 'string' && data.bannerUri !== null && data.bannerUri !== '') {
      updatedValues.bannerUri = data.bannerUri;
    }

    // Add the URL to eventLinks if it's not already in the array
    if (data.url && typeof data.url === 'string') {
      const eventLinks = [...values.eventLinks];
      if (!eventLinks.includes(data.url)) {
        eventLinks.push(data.url);
      }
      updatedValues.eventLinks = eventLinks;
    }

    // Update the form values
    setValues(prev => ({
      ...prev,
      ...updatedValues
    }));
  };

  // Handle adding a new event link
  const addEventLink = () => {
    const newLink = (document.getElementById('new-event-link') as HTMLInputElement)?.value;
    if (!newLink) return;

    try {
      new URL(newLink); // Validate the URL

      if (!values.eventLinks.includes(newLink)) {
        setField('eventLinks', [...values.eventLinks, newLink]);
      }
      // Clear any previous errors when adding a valid link
      setFieldTouched(prev => ({
        ...prev,
        eventLinks: true
      }));
    } catch (err) {
      setError('Please enter a valid URL');
      // Mark as touched when there's an error during validation
      handleFieldBlur('eventLinks');
    }
  };

  // Handle removing an event link
  const removeEventLink = (index: number) => {
    const newLinks = [...values.eventLinks];
    newLinks.splice(index, 1);
    setField('eventLinks', newLinks);
  };

  // Handle adding an organizer
  const addOrganizer = (organizerId: string) => {
    if (!values.organizerIds.includes(organizerId)) {
      setField('organizerIds', [...values.organizerIds, organizerId]);
    }
  };

  // Handle removing an organizer
  const removeOrganizer = (organizerId: string) => {
    setField('organizerIds', values.organizerIds.filter(id => id !== organizerId));
  };

  // Handle adding a tag
  const addTag = (tagId: string) => {
    if (!values.tagIds.includes(tagId)) {
      setField('tagIds', [...values.tagIds, tagId]);
    }
  };

  // Handle removing a tag
  const removeTag = (tagId: string) => {
    setField('tagIds', values.tagIds.filter(id => id !== tagId));
  };

  // Handle deleting the event (edit mode only)
  const handleDelete = async () => {
    if (!eventId || !userId) return;

    setSubmitting(true);
    setError(null);

    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);

      showToast(`🎉 Event deleted successfully! ID: ${eventId}`, 'success');
      // Close the drawer after successful deletion
      if (onClose) {
        setTimeout(onClose, 1000); // Delay closing to allow user to see the success message
      }
      // This would be handled by parent component
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showToast('Failed to delete event. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete button click (with confirmation)
  const handleDeleteClick = () => {
    if (deleteConfirm) {
      // Second click - proceed with deletion
      handleDelete();
    } else {
      // First click - show confirmation
      setDeleteConfirm(true);

      // Reset after 5 seconds if not acted upon
      const timeoutId = setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
      setDeleteTimeoutId(timeoutId);
    }
  };

  // Cleanup delete timeout
  useEffect(() => {
    return () => {
      if (deleteTimeoutId) {
        clearTimeout(deleteTimeoutId);
      }
    };
  }, [deleteTimeoutId]);

  return (
    <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Draft restore alert */}
      {((showDraftAlert && mode === 'add') || (showUndoButton && mode === 'add')) && (
        <div className="alert alert-info alert-soft flex items-center justify-between">
          <div>
            {showDraftAlert && "You have an unsaved draft. Restore draft?"}
            {showUndoButton && "Draft restored. Undo?"}
          </div>
          <div className="flex gap-2">
            {showDraftAlert && (
              <button
                type="button"
                className="btn btn-soft btn-primary"
                onClick={restoreDraft}
              >
                Restore
              </button>
            )}
            {showUndoButton && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={undoDraft}
              >
                Undo
              </button>
            )}
          </div>
        </div>
      )}

      {/* ID, Created, and Updated fields (only in edit mode) */}
      {mode === 'edit' && (
        <div className="space-y-4">
          {values.id && (
            <div>
              <label className="label">
                <span className="label-text">ID</span>
              </label>
              <input
                type="text"
                value={values.id}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>
          )}

          {values.createdAt && (
            <div>
              <label className="label">
                <span className="label-text">Created</span>
              </label>
              <input
                type="text"
                value={new Date(values.createdAt).toLocaleString()}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>
          )}

          {values.updatedAt && (
            <div>
              <label className="label">
                <span className="label-text">Last Updated</span>
              </label>
              <input
                type="text"
                value={new Date(values.updatedAt).toLocaleString()}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>
          )}
        </div>
      )}

      {/* Title field */}
      <div>
        <label className="label">
          <span className="label-text">Title *</span>
        </label>
        <input
          type="text"
          name="title"
          value={values.title}
          onChange={(e) => {
            console.log('EventForm: Title field changed to:', e.target.value);
            handleChange(e);
          }}
          onBlur={(e) => {
            console.log('EventForm: Title field blurred, errors:', errors, 'fieldVisited:', fieldVisited);
            handleBlur(e);
            handleFieldBlur('title');
          }}
          className={`input input-bordered w-full ${fieldVisited.title && errors.title ? 'input-error' : ''}`}
        />
        {fieldVisited.title && errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Subtitle field */}
      <div>
        <label className="label">
          <span className="label-text">Subtitle</span>
        </label>
        <input
          type="text"
          name="subtitle"
          value={values.subtitle}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>

      {/* Description field */}
      <div>
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <SimpleMDE
          value={values.description}
          onChange={(value) => setField('description', value)}
          options={memoizedSimpleMDEOptions}
        />
      </div>

      {/* Start and End Datetime fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Start Datetime *</span>
          </label>
          <input
            type="datetime-local"
            name="startDatetime"
            value={values.startDatetime}
            onChange={handleChange}
            onBlur={(e) => {
              handleBlur(e);
              handleFieldBlur('startDatetime');
            }}
            className={`input input-bordered w-full ${fieldVisited.startDatetime && errors.startDatetime ? 'input-error' : ''}`}
          />
          {fieldVisited.startDatetime && errors.startDatetime && <p className="text-error text-sm mt-1">{errors.startDatetime}</p>}
        </div>

        <div>
          <label className="label">
            <span className="label-text">End Datetime *</span>
          </label>
          <input
            type="datetime-local"
            name="endDatetime"
            value={values.endDatetime}
            onChange={handleChange}
            onBlur={(e) => {
              handleBlur(e);
              handleFieldBlur('endDatetime');
            }}
            className={`input input-bordered w-full ${fieldVisited.endDatetime && errors.endDatetime ? 'input-error' : ''}`}
          />
          {fieldVisited.endDatetime && errors.endDatetime && <p className="text-error text-sm mt-1">{errors.endDatetime}</p>}
        </div>
      </div>

      {/* Event Links field */}
      <div>
        <label className="label">
          <span className="label-text">Event Links *</span>
        </label>

        {/* Display existing links as badges */}
        {values.eventLinks.map((link, index) => (
          <div key={index} className="flex items-center mb-2">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-neutral badge-outline break-all mr-2"
            >
              {link}
            </a>
            <button
              type="button"
              onClick={() => removeEventLink(index)}
              className="btn btn-ghost btn-xs"
            >
              ×
            </button>
          </div>
        ))}

        {/* Input for new link */}
        <div className="flex">
          <input
            type="text"
            id="new-event-link"
            placeholder="https://example.com/event"
            onBlur={() => handleFieldBlur('eventLinks')}
            className={`input input-bordered flex-grow ${fieldVisited.eventLinks && errors.eventLinks ? 'input-error' : ''}`}
          />
          <button
            type="button"
            onClick={addEventLink}
            className="btn btn-primary ml-2"
          >
            Add Link
          </button>
        </div>

        {fieldVisited.eventLinks && errors.eventLinks && Array.isArray(errors.eventLinks) && errors.eventLinks.length > 0 && (
          <p className="text-error text-sm mt-1">{errors.eventLinks[0]}</p>
        )}
      </div>

      {/* Organizers field */}
      <div>
        <label className="label">
          <span className="label-text">Organizers</span>
        </label>
        <div className="relative">
          {organizersLoading && (
            <span className="loading loading-spinner loading-xs absolute right-2 top-1/2 transform -translate-y-1/2"></span>
          )}

          {/* Selected organizers as badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {values.organizerIds.map((id) => {
              const organizer = organizers.find(org => org.id === id);
              return (
                <div key={id} className="badge badge-neutral badge-outline">
                  {organizer?.name}
                  <button
                    type="button"
                    onClick={() => removeOrganizer(id)}
                    className="ml-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dropdown to select organizers */}
          <select
            className="select select-bordered w-full"
            onChange={(e) => addOrganizer(e.target.value)}
            value=""
          >
            <option value="" disabled>Select organizer</option>
            {organizers
              .filter(org => !values.organizerIds.includes(org.id))
              .map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Event Banner URI field */}
      <div>
        <label className="label">
          <span className="label-text">Event Banner URI</span>
        </label>
        <input
          type="text"
          name="bannerUri"
          value={values.bannerUri}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Image preview if bannerUri has value */}
        {values.bannerUri && (
          <div className="mt-2">
            <div className="text-sm mb-1">Preview:</div>
            <img
              src={values.bannerUri}
              alt="Event banner preview"
              className="w-full object-cover"
              style={{ aspectRatio: '16/9' }}
            />
          </div>
        )}
      </div>

      {/* Tags field */}
      <div>
        <label className="label">
          <span className="label-text">Tags</span>
        </label>
        <div className="relative">
          {tagsLoading && (
            <span className="loading loading-spinner loading-xs absolute right-2 top-1/2 transform -translate-y-1/2"></span>
          )}

          {/* Selected tags as badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {values.tagIds.map((id) => {
              const tag = tags.find(t => t.id === id);
              return (
                <div key={id} className="badge badge-neutral badge-outline">
                  {tag?.name}
                  <button
                    type="button"
                    onClick={() => removeTag(id)}
                    className="ml-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dropdown to select tags */}
          <select
            className="select select-bordered w-full"
            onChange={(e) => addTag(e.target.value)}
            value=""
          >
            <option value="" disabled>Select tag</option>
            {tags
              .filter(tag => !values.tagIds.includes(tag.id))
              .map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Boolean fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Is Paid Event</span>
            <input
              type="checkbox"
              name="isPaid"
              checked={values.isPaid}
              onChange={(e) => setField('isPaid', e.target.checked)}
              className="toggle toggle-primary"
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Walk-In Available</span>
            <input
              type="checkbox"
              name="isWalkInAvailable"
              checked={values.isWalkInAvailable}
              onChange={(e) => setField('isWalkInAvailable', e.target.checked)}
              className="toggle toggle-primary"
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Details Confirmed</span>
            <input
              type="checkbox"
              name="isConfirmed"
              checked={values.isConfirmed}
              onChange={(e) => setField('isConfirmed', e.target.checked)}
              className="toggle toggle-primary"
            />
          </label>
        </div>

        {isAdmin && (
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Is Approved</span>
              <input
                type="checkbox"
                name="isApproved"
                checked={values.isApproved}
                onChange={(e) => setField('isApproved', e.target.checked)}
                className="toggle toggle-primary"
              />
            </label>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error alert-outline">
          {error}
        </div>
      )}

      {/* Submit overlay */}
      {(submitting || loading) && (
        <div className="absolute inset-0 bg-base-100/80 flex flex-col items-center justify-center z-10">
          <span className="loading loading-spinner loading-md mb-2"></span>
          <p>{submitting ? 'Submitting Entry, please wait...' : 'Loading...'}</p>
        </div>
      )}

      {/* Submit button
    <div className="pt-4">
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
        onClick={() => console.log('EventForm: Submit button clicked - form state is submitting:', submitting, 'mode:', mode)}
      >
        {submitting ? 'Submitting...' : 'Submit Event'}
      </button>
    </div> */}

      {/* Delete button (only in edit mode) */}
      {mode === 'edit' && (
        <div className="pt-4">
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`btn ${deleteConfirm ? 'btn-outline btn-error' : 'btn-error'}`}
          >
            {deleteConfirm ? '⚠️ Really delete event?' : 'Delete Event'}
          </button>
        </div>
      )}
    </form>
  );
});

export default EventForm;
