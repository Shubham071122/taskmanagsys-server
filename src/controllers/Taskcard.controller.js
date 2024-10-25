import mongoose from 'mongoose';
import { Board } from '../models/Board.model.js';
import { TaskCard } from '../models/Taskcard.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create a new task card
  export const createTaskCard = async (req, res) => {
    const { title, description, status, boardId, dueDate, priority, assignee } =
      req.body;

      // console.log('Incoming data:', { title, description, status, boardId, dueDate, priority, assignee });

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

      const boardObjectId = mongoose.Types.ObjectId.isValid(boardId) ? new mongoose.Types.ObjectId(boardId) : null;

      if (!boardObjectId) {
        return res.status(400).json({ message: "Invalid Board ID" });
      }

      const board = await Board.findById(boardObjectId);
      if (!board) {
        return res.status(404).json(new ApiResponse(404, 'Board not found'));
      }
      // console.log('Board found.');

      let assignedUserId = null;
      let assignedUserEmail = null;
      if (assignee) {
        console.log('Checking assignee');
        const assignedUser = await User.find({ email: assignee });
        console.log('Assigned user:', assignedUser);
        if (assignedUser.length === 0) {
          return res.status(404).json(new ApiResponse(404, 'Assignee not found'));
        }
        assignedUserId = assignedUser[0]._id;
        assignedUserEmail = assignedUser.email; 
      }

      const taskCard = await TaskCard.create({
        creator: req.user._id,
        board: boardObjectId,
        title,
        description,
        status: status || 'Todo',
        dueDate,
        priority: priority || 'Medium',
        assignee: assignedUserId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { taskCard, assignedUserEmail }, 'Task created successfully'));
    } catch (error) {
      throw new ApiError(500, 'Error while creating task');
    }
  };

//Update a task card
export const updateTaskCard = async (req, res) => {
  const { title, description, status, dueDate, priority, assignee } = req.body;
  const { cardId } = req.params;

  try {
    let taskCard = await TaskCard.findById(cardId);
    if (!taskCard) {
      return res.status(404).json(new ApiResponse(404, 'Task not found'));
    }

    const currentDate = new Date();
    if (dueDate && new Date(dueDate) <= currentDate) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Due date must be in the future'));
    }

    if (assignee) {
      const assignedUser = await User.findById(assignee);
      if (!assignedUser) {
        return res.status(404).json(new ApiResponse(404, 'Assignee not found'));
      }
    }

    // Updating fields
    taskCard.title = title || taskCard.title;
    taskCard.description = description || taskCard.description;
    taskCard.status = status || taskCard.status;
    taskCard.dueDate = dueDate || taskCard.dueDate;
    taskCard.priority = priority || taskCard.priority;
    taskCard.assignee = assignee || taskCard.assignee;

    await taskCard.save();

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

    const tasks = await TaskCard.find({ board: boardId }).sort({ createdAt: -1 });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, 'No tasks found for this board'));
    }

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
