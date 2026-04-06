import React, { useState, useEffect } from "react";
import * as taskService from "../services/taskService";
import { useLanguage } from "../context/LanguageContext";
import "./TaskForm.css";

function TaskForm({ taskToEdit, onTaskAdded, onTaskUpdated }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "general",
    dueDate: "",
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const isEditMode = !!taskToEdit;

  // Populate form when editing
  useEffect(() => {
    if (taskToEdit) {
      setTask({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "MEDIUM",
        category: taskToEdit.category || "general",
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : "",
        completed: taskToEdit.completed || false
      });
    }
  }, [taskToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleComplete = () => {
    setTask(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const errors = [];
    
    if (!task.title.trim()) {
      errors.push('Task title is required');
    } else if (task.title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (!task.dueDate) {
      errors.push('Due date is required');
    } else {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.push('Due date cannot be in the past');
      }
      
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      if (dueDate > maxDate) {
        errors.push('Due date cannot be more than 10 years in the future');
      }
    }
    
    if (task.description && task.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
    
    if (task.category && task.category.trim().length > 50) {
      errors.push('Category must be less than 50 characters');
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let result;
      
      if (isEditMode) {
        // Update existing task
        const taskData = {
          ...taskToEdit,
          ...task
        };
        result = await taskService.updateTask(taskToEdit._id, taskData);
      } else {
        // Create new task
        result = await taskService.createTask(task);
      }
      
      setSuccess(true);
      
      // Clear form if adding
      if (!isEditMode) {
        setTask({
          title: "",
          description: "",
          priority: "MEDIUM",
          category: "general",
          dueDate: "",
          completed: false
        });
      }

      // Call appropriate callback
      if (isEditMode && onTaskUpdated) {
        onTaskUpdated(result);
      } else if (!isEditMode && onTaskAdded) {
        onTaskAdded(result);
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} task`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <div className="task-form-card">
        <div className="task-form-header">
          <h2 className="task-form-title">
            {isEditMode ? t('taskForm.editTitle') : t('taskForm.addTitle')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          {success && (
            <div className="success-message">
              {isEditMode ? t('taskForm.taskUpdated') : t('taskForm.taskAdded')}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              {t('taskForm.titleLabel')} <span className="required">{t('taskForm.required')}</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              className="form-input"
              placeholder={t('taskForm.titlePlaceholder')}
              maxLength="200"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('taskForm.descriptionLabel')}
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder={t('taskForm.descriptionPlaceholder')}
              rows="4"
              maxLength="1000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                {t('taskForm.priorityLabel')} <span className="required">{t('taskForm.required')}</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="LOW">{t('priority.LOW')}</option>
                <option value="MEDIUM">{t('priority.MEDIUM')}</option>
                <option value="HIGH">{t('priority.HIGH')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                {t('taskForm.categoryLabel')}
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={task.category}
                onChange={handleChange}
                className="form-input"
                placeholder={t('taskForm.categoryPlaceholder')}
                maxLength="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              {t('taskForm.dueDateLabel')} <span className="required">{t('taskForm.required')}</span>
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={task.dueDate}
              onChange={handleChange}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label className="toggle-container">
              <span className="toggle-label">{t('taskForm.completedLabel')}</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={task.completed}
                  onChange={handleToggleComplete}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading 
              ? (isEditMode ? t('taskForm.submitUpdating') : t('taskForm.submitAdding')) 
              : (isEditMode ? t('taskForm.submitUpdate') : t('taskForm.submitAdd'))
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;