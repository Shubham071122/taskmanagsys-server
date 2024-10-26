import mongoose from 'mongoose';
import { Board } from '../models/Board.model.js';
import { TaskCard } from '../models/Taskcard.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { json } from 'express';

//Formate Time:
function formatDate(dueDate) {
  const date = new Date(dueDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('/');

  return `${year}-${month}-${day}`;
}

// Create a new task card
export const createTaskCard = async (req, res) => {
  const { title, description, status, boardId, dueDate, priority, assignee } =
    req.body;

  console.log('Incoming data:', { title, description, status, boardId, dueDate, priority, assignee });

  try {
    if (!title || !description || !dueDate || !boardId) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            'Title, description, due date, and boardId are required',
          ),
        );
    }

    const currentDate = new Date();
    if (new Date(dueDate) <= currentDate) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Due date must be in the future'));
    }

    const boardObjectId = mongoose.Types.ObjectId.isValid(boardId)
      ? new mongoose.Types.ObjectId(boardId)
      : null;

    if (!boardObjectId) {
      return res.status(400).json({ message: 'Invalid Board ID' });
    }

    const board = await Board.findById(boardObjectId);
    if (!board) {
      return res.status(404).json(new ApiResponse(404, 'Board not found'));
    }

    let assignedUserId = null;
    let assignedUserEmail = null;
    if (assignee) {
      const assignedUser = await User.find({ email: assignee });
      // console.log('Assigned user:', assignedUser);
      if (assignedUser.length === 0) {
        return res.status(404).json(new ApiResponse(404, 'Assignee not found'));
      }
      assignedUserId = assignedUser[0]._id;
      assignedUserEmail = assignedUser.email;
    }

    let taskCard = await TaskCard.create({
      creator: req.user._id,
      board: boardObjectId,
      title,
      description,
      status: status || 'Todo',
      dueDate,
      priority: priority || 'Medium',
      assignee: assignedUserId,
    });

    taskCard.assignee = assignedUserEmail;

    // console.log('taskCard:', taskCard);
    return res
      .status(201)
      .json(new ApiResponse(201, { taskCard }, 'Task created successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while creating task');
  }
};

//Update a task card
export const updateTaskCard = async (req, res) => {
  const { title, description, status, dueDate, priority, assignee } = req.body;
  const { cardId } = req.params;
  console.log("updt:",req.body);

  try {
    let taskCard = await TaskCard.findById(cardId);
    if (!taskCard) {
      return res.status(404).json(new ApiResponse(404, 'Task not found'));
    }
    console.log("TASK:",taskCard);
    const convertedDate = convertDateFormat(dueDate);
    console.log("convertedDate:",convertedDate)
    
    const currentDate = new Date();
    if (dueDate && new Date(convertedDate) <= currentDate) {
      return res
      .status(400)
      .json(new ApiResponse(400, 'Due date must be in the future'));
    }
    console.log("TASK2:",currentDate);


    let assigneeId = null;
    if (assignee && !taskCard.assignee) {
      const assignedUser = await User.find({email: assignee});
      if (assignedUser.length === 0) {
        return res.status(404).json(new ApiResponse(404, 'Assignee not found'));
      }
      assigneeId = assignedUser[0]._id;
    }

    // Updating fields
    taskCard.title = title || taskCard.title;
    taskCard.description = description || taskCard.description;
    taskCard.status = status || taskCard.status;
    taskCard.dueDate = convertedDate || taskCard.dueDate;
    taskCard.priority = priority || taskCard.priority;
    taskCard.assignee = assigneeId || taskCard.assignee;

    await taskCard.save();

    console.log("taskCarddd:",taskCard);

    return res
      .status(200)
      .json(new ApiResponse(200, taskCard, 'Task updated successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while updating task');
  }
};

// Geting all task cards for a specific board
export const getTaskCardsByBoard = async (req, res) => {
  const { boardId } = req.params;
  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json(new ApiResponse(404, 'Board not found'));
    }

    let tasks = await TaskCard.find({ board: boardId })
      .populate({
        path: 'assignee',
        select: 'email',
      })
      .sort({ createdAt: -1 });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, 'No tasks found for this board'));
    }

    tasks = tasks.map((task) => {
      const newTask = JSON.parse(JSON.stringify(task));
      return {
        ...newTask,
        assignee: newTask.assignee?.email,
        dueDate: formatDate(newTask.dueDate),
      };
    });


    return res
      .status(200)
      .json(new ApiResponse(200, tasks, 'Tasks fetched successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while fetching tasks');
  }
};

// Delete a task card
export const deleteTaskCard = async (req, res) => {
  const { cardId } = req.params;
  try {
    const taskCard = await TaskCard.findByIdAndDelete(cardId);
    if (!taskCard) {
      return res.status(404).json(new ApiResponse(404, 'Task not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Task deleted successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while deleting task');
  }
};
