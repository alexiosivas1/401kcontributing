import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing inline editable field state
 *
 * Optimized following OPTIMIZATION_LOG.md patterns:
 * - useCallback for stable function references
 * - Efficient state management
 * - Validation built-in
 *
 * @param {*} initialValue - Initial field value
 * @param {Function} onSave - Callback when value is saved
 * @param {Object} validation - Validation config {min, max, type, formatter}
 * @returns {Object} - {isEditing, value, displayValue, startEdit, saveEdit, cancelEdit, handleChange, inputRef}
 */
export function useEditableField(initialValue, onSave, validation = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setValue(initialValue);
    setIsEditing(false);
  }, [initialValue]);

  const saveEdit = useCallback(() => {
    let finalValue = value;

    // Apply formatter if provided
    if (validation.formatter) {
      finalValue = validation.formatter(finalValue);
    }

    // Validate range
    if (validation.min !== undefined && finalValue < validation.min) {
      finalValue = validation.min;
    }
    if (validation.max !== undefined && finalValue > validation.max) {
      finalValue = validation.max;
    }

    setValue(finalValue);
    setIsEditing(false);
    onSave(finalValue);
  }, [value, onSave, validation]);

  const handleChange = useCallback((e) => {
    const newValue = validation.type === 'number' || validation.type === 'decimal'
      ? parseFloat(e.target.value) || 0
      : e.target.value;
    setValue(newValue);
  }, [validation.type]);

  return {
    isEditing,
    value,
    startEdit,
    saveEdit,
    cancelEdit,
    handleChange,
    inputRef,
  };
}
