import { useState } from "react";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "../context/LanguageContext";
import "./TaskManager.css";

function TaskManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t, isRTL } = useLanguage();

  const handleTaskAdded = (newTask) => {
    // Refresh the task list
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setEditingTask(null);
  };

  const handleTaskUpdated = (updatedTask) => {
    // Refresh the task list
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="task-manager" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="task-manager-header">
        <h1 className="task-manager-title">{t('app.title')}</h1>
        <div className="header-actions">
          <LanguageToggle />
          <ThemeToggle />
          <button 
            className="add-task-btn"
            onClick={() => setShowForm(true)}
          >
            {t('buttons.addTask')}
          </button>
        </div>
      </header>

      <main className="task-manager-main">
        <TaskList key={refreshKey} onEditTask={handleEditTask} />
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={handleCloseForm}
            >
              ✕
            </button>
            <TaskForm 
              taskToEdit={editingTask}
              onTaskAdded={handleTaskAdded} 
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;
