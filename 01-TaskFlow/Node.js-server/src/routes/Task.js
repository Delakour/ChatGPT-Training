const express = require("express");
const router = express.Router();

const { getAllTasks, getById, createTask, updateTask, deleteTask } = require("../controllers/Task");

router.get("/all", getAllTasks);
router.get("/:id", getById);
router.post("/create", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;