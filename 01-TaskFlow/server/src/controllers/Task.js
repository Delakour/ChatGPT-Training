const Task = require("../models/Task");

/**
 * Validates task data for logical consistency
 * @param {Object} taskData - The task data to validate
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validateTaskData = (taskData) => {
    const errors = [];
    
    // Validate title
    if (!taskData.title || taskData.title.trim().length === 0) {
        errors.push("Title is required and cannot be empty");
    }
    
    if (taskData.title && taskData.title.trim().length > 200) {
        errors.push("Title must be less than 200 characters");
    }
    
    // Validate due date
    if (!taskData.dueDate) {
        errors.push("Due date is required");
    } else {
        const dueDate = new Date(taskData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        // Check if date is valid
        if (isNaN(dueDate.getTime())) {
            errors.push("Due date is not a valid date");
        } else if (dueDate < today) {
            errors.push("Due date cannot be in the past");
        }
        
        // Check if date is too far in the future (more than 10 years)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10);
        if (dueDate > maxDate) {
            errors.push("Due date cannot be more than 10 years in the future");
        }
    }
    
    // Validate priority
    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
        errors.push("Priority must be HIGH, MEDIUM, or LOW");
    }
    
    // Validate description length
    if (taskData.description && taskData.description.length > 1000) {
        errors.push("Description must be less than 1000 characters");
    }
    
    // Validate category
    if (taskData.category && taskData.category.trim().length > 50) {
        errors.push("Category must be less than 50 characters");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};


const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        return res.status(201).json(tasks);
    }
    catch (err) {
        console.error("❌ Error while searching tasks:", err);
        return res.status(500).json({ error: "some error occurred while searching the tasks" });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(400).json({ error: "task not found" });
        }

        return res.status(200).json(task);
    }
    catch (err) {
        console.error("❌ Error fetching task by id:", err);
        return res.status(500).json({ error: "a problem occurred while searching the task" });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, completed, description, category, priority, createdAt, updatedAt, dueDate } = req.body;

        // Validate task data
        const validation = validateTaskData({ title, description, category, priority, dueDate });
        
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: "Validation failed", 
                details: validation.errors 
            });
        }

        const newTask = new Task({
            title: title.trim(),
            completed: completed ?? false,
            description: description?.trim() || "",
            category: category?.trim() || "general",
            priority: priority || "MEDIUM",
            createdAt,
            updatedAt,
            dueDate
        });

        const savedTask = await newTask.save();

        return res.status(201).json(savedTask);
    }
    catch (err) {
        console.error("❌ Error creating task:", err);
        
        // Handle mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: "Validation failed", details: errors });
        }
        
        return res.status(500).json({ error: "An error occurred while creating the task" });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed, description, category, priority, createdAt, updatedAt, dueDate } = req.body;

        // Validate task data
        const validation = validateTaskData({ title, description, category, priority, dueDate });
        
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: "Validation failed", 
                details: validation.errors 
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title: title.trim(),
                completed: completed ?? false,
                description: description?.trim() || "",
                category: category?.trim() || "general",
                priority: priority || "MEDIUM",
                createdAt,
                updatedAt,
                dueDate
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        return res.status(200).json(updatedTask);
    }
    catch (err) {
        console.error("❌ Error updating task:", err);
        
        // Handle mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: "Validation failed", details: errors });
        }
        
        return res.status(500).json({ error: "An error occurred while updating the task" });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ error: "task not found" });
        }

        return res.status(200).json({ message: "task deleted successfully" });
    }
    catch (err) {
        console.error("❌ Error deleting task:", err);
        return res.status(500).json({ error: "problem when deleting the task" });
    }
};

module.exports = {
    getAllTasks, getById, createTask, updateTask, deleteTask
};