'use client';

import { useState, useCallback } from 'react';

interface FormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  validate?: (values: T) => Partial<Record<keyof T, any>> | null;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: FormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, any>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Check if any field has been modified
  const isDirty = Object.keys(values).some(
    key => values[key as keyof T] !== initialValues[key as keyof T]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const setField = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when setting field programmatically
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (validate) {
      const fieldErrors = validate({ ...values, [name]: e.target.value });
      setErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  }, [validate, values]);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const formErrors = validate(values);
    setErrors(formErrors || {});
    
    return !formErrors || Object.keys(formErrors).length === 0;
  }, [validate, values]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    handleChange,
    setField,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    reset
  };
};