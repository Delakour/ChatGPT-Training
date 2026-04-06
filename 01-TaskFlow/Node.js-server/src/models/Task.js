const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [1, "Title cannot be empty"],
    maxlength: [200, "Title must be less than 200 characters"]
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description must be less than 1000 characters"]
  },
  priority: {
    type: String,
    enum: {
      values: ["HIGH", "MEDIUM", "LOW"],
      message: "Priority must be HIGH, MEDIUM, or LOW"
    },
    default: "MEDIUM",
  },
  category: {
    type: String,
    trim: true,
    default: "general",
    maxlength: [50, "Category must be less than 50 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"],
    validate: {
      validator: function(value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(value);
        dueDate.setHours(0, 0, 0, 0);
        
        // Allow due date to be today or in the future
        return dueDate >= today;
      },
      message: "Due date cannot be in the past"
    }
  },
},
  {
    timestamps: true
  });

// Pre-save middleware to update the updatedAt field
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-update middleware
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
