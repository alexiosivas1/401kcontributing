import { memo, useCallback, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { useEditableField } from '../hooks/useEditableField';

/**
 * EditableValue Component
 *
 * Inline editable field with double-click activation
 * Optimized with React.memo following OPTIMIZATION_LOG.md patterns
 *
 * Features:
 * - Double-click to edit
 * - Hover shows pencil icon
 * - Click outside to cancel
 * - Enter to save, Escape to cancel
 * - Built-in validation
 *
 * @param {*} value - Current value to display
 * @param {Function} onChange - Callback when value changes
 * @param {Function} formatter - Function to format display value
 * @param {Object} validation - Validation config {min, max, type, formatter}
 * @param {string} inputType - HTML input type (default: 'text')
 * @param {string} label - Accessible label for screen readers
 */
export const EditableValue = memo(function EditableValue({
  value,
  onChange,
  formatter,
  validation = {},
  inputType = 'text',
  label = 'Editable field',
}) {
  const {
    isEditing,
    value: editValue,
    startEdit,
    saveEdit,
    cancelEdit,
    handleChange,
    inputRef,
  } = useEditableField(value, onChange, validation);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit]
  );

  // Handle click outside to cancel
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        saveEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, saveEdit, inputRef]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={inputType}
        value={editValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={saveEdit}
        className="editable-field-input"
        aria-label={label}
      />
    );
  }

  return (
    <span
      className="editable-field"
      onDoubleClick={startEdit}
      role="button"
      tabIndex={0}
      aria-label={`${label}. Double-click to edit`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startEdit();
        }
      }}
    >
      <span className="editable-field-value">
        {formatter ? formatter(value) : value}
      </span>
      <Edit2 size={14} className="edit-icon" />
    </span>
  );
});

export default EditableValue;
