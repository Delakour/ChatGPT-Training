const API_URL = process.env.REACT_APP_SERVER_URL;

/**
 * Task API Service
 * Handles all API calls related to tasks
 */

/**
 * Fetches all tasks from the server
 * @returns {Promise<Array>} Array of tasks
 */
export const getAllTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks/all`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Creates a new task
 * @param {Object} taskData - The task data to create
 * @returns {Promise<Object>} The created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_URL}/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...taskData,
        completed: taskData.completed ?? false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle validation errors with details
      if (errorData.details && Array.isArray(errorData.details)) {
        throw new Error(errorData.details.join(', '));
      }
      
      throw new Error(errorData.error || `Failed to create task: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating task:', error);
    throw error;
  }
};

/**
 * Updates an existing task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The updated task data
 * @returns {Promise<Object>} The updated task
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle validation errors with details
      if (errorData.details && Array.isArray(errorData.details)) {
        throw new Error(errorData.details.join(', '));
      }
      
      throw new Error(errorData.error || `Failed to update task: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error updating task:', error);
    throw error;
  }
};

/**
 * Deletes a task
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise<Object>} The deletion response
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    throw error;
  }
};

/**
 * Toggles the completed status of a task
 * @param {Object} task - The task to toggle
 * @returns {Promise<Object>} The updated task
 */
export const toggleTaskComplete = async (task) => {
  try {
    const updatedTaskData = {
      ...task,
      completed: !task.completed
    };
    
    return await updateTask(task._id, updatedTaskData);
  } catch (error) {
    console.error('❌ Error toggling task completion:', error);
    throw error;
  }
};
