import React, { useState, useEffect } from "react";
import * as taskService from "../services/taskService";
import { useLanguage } from "../context/LanguageContext";
import "./TaskList.css";

function TaskList({ onEditTask }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, pending, overdue
  const [sortBy, setSortBy] = useState("priority"); // priority, dueDate, title, category, status, description
  const [sortDirection, setSortDirection] = useState("asc"); // asc, desc
  const { t } = useLanguage();

  useEffect(() => {
    loadTasks();
  }, []); // Removed the empty array issue - component remounts due to key prop

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    const classes = {
      HIGH: "priority-high",
      MEDIUM: "priority-medium",
      LOW: "priority-low"
    };
    return classes[priority] || classes.MEDIUM;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm(t('tasksList.deleteConfirm'))) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await taskService.toggleTaskComplete(task);
      
      // Update task in UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t._id === task._id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (err) {
      setError('Failed to update task status. Please try again.');
    }
  };

  const isOverdue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "⇅";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus === "completed") return task.completed;
    if (filterStatus === "pending") return !task.completed;
    if (filterStatus === "overdue") return !task.completed && isOverdue(task.dueDate);
    return true; // "all"
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "priority":
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      
      case "dueDate":
        comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;
      
      case "title":
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        break;
      
      case "description":
        const descA = a.description || "";
        const descB = b.description || "";
        comparison = descA.toLowerCase().localeCompare(descB.toLowerCase());
        break;
      
      case "category":
        comparison = a.category.toLowerCase().localeCompare(b.category.toLowerCase());
        break;
      
      case "status":
        comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
        break;
      
      default:
        comparison = 0;
    }
    
    // Apply sort direction
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const overdueTasks = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;

  return (
    <div className="task-list-container">
      <div className="task-list-card">
        <div className="task-list-header">
          <div className="task-list-title-section">
            <h1 className="task-list-title">{t('tasksList.title')}</h1>
            {!loading && !error && totalTasks > 0 && (
              <div className="task-stats">
                <span className="stat-item">{t('tasksList.total')}: <strong>{totalTasks}</strong></span>
                <span className="stat-item stat-completed">{t('tasksList.completed')}: <strong>{completedTasks}</strong></span>
                <span className="stat-item stat-pending">{t('tasksList.pending')}: <strong>{pendingTasks}</strong></span>
                {overdueTasks > 0 && (
                  <span className="stat-item stat-overdue">{t('tasksList.overdue')}: <strong>{overdueTasks}</strong></span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && !loading && (
          <div className="error-notification">
            <span className="error-notification-text">⚠️ {error}</span>
            <button 
              className="error-notification-close"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="filter-section">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={t('tasksList.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                {t('tasksList.filterAll')} ({totalTasks})
              </button>
              <button
                className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("pending")}
              >
                {t('tasksList.filterPending')} ({pendingTasks})
              </button>
              <button
                className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
                onClick={() => setFilterStatus("completed")}
              >
                {t('tasksList.filterCompleted')} ({completedTasks})
              </button>
              {overdueTasks > 0 && (
                <button
                  className={`filter-btn filter-btn-overdue ${filterStatus === "overdue" ? "active" : ""}`}
                  onClick={() => setFilterStatus("overdue")}
                >
                  {t('tasksList.filterOverdue')} ({overdueTasks})
                </button>
              )}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">{t('tasksList.loading')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              {t('tasksList.tryAgain')}
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">{t('tasksList.noTasks')}</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">{t('tasksList.noResults')}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              {t('tasksList.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th className="checkbox-column"></th>
                  <th className="sortable-header" onClick={() => handleSort("title")}>
                    {t('taskTable.task')} <span className="sort-icon">{getSortIcon("title")}</span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("description")}>
                    {t('taskTable.description')} <span className="sort-icon">{getSortIcon("description")}</span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("priority")}>
                    {t('taskTable.priority')} <span className="sort-icon">{getSortIcon("priority")}</span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("category")}>
                    {t('taskTable.category')} <span className="sort-icon">{getSortIcon("category")}</span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("dueDate")}>
                    {t('taskTable.dueDate')} <span className="sort-icon">{getSortIcon("dueDate")}</span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("status")}>
                    {t('taskTable.status')} <span className="sort-icon">{getSortIcon("status")}</span>
                  </th>
                  <th>{t('taskTable.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task, index) => {
                  const overdueTask = !task.completed && isOverdue(task.dueDate);
                  return (
                    <tr 
                      key={task._id || index}
                      className={`${task.completed ? 'completed-row' : ''} ${overdueTask ? 'overdue-row' : ''}`}
                    >
                      <td className="checkbox-column">
                        <div className="task-toggle-switch">
                          <input
                            type="checkbox"
                            className="task-toggle-input"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task)}
                            title={t('taskTable.toggleTooltip')}
                            id={`task-toggle-${task._id}`}
                          />
                          <label 
                            htmlFor={`task-toggle-${task._id}`} 
                            className="task-toggle-slider"
                          ></label>
                        </div>
                      </td>
                      <td>
                        <div className="task-title">{task.title}</div>
                      </td>
                      <td>
                        <div className="task-description">
                          {task.description || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                          {t(`priority.${task.priority}`)}
                        </span>
                      </td>
                      <td>
                        <div className="task-category">{task.category}</div>
                      </td>
                      <td>
                        <div className={`task-date ${overdueTask ? 'overdue-date' : ''}`}>
                          {overdueTask && '⚠️ '}
                          {formatDate(task.dueDate)}
                        </div>
                      </td>
                      <td>
                        <span 
                          className={`status-badge ${task.completed ? 'status-completed' : 'status-pending'} status-clickable`}
                          onClick={() => handleToggleComplete(task)}
                          title={t('taskTable.toggleTooltip')}
                        >
                          {task.completed ? t('status.completed') : t('status.pending')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => onEditTask && onEditTask(task)}
                            title={t('taskTable.editTooltip')}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(task._id)}
                            title={t('taskTable.deleteTooltip')}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;