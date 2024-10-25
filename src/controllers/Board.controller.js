import { Board } from '../models/Board.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

//Crate a board
export const createBoard = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title) {
      return res.status(400).json(new ApiResponse(400, 'Title is required'));
    }

    const newBoard = await Board.create({
      creator: req.user._id,
      title,
      description,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newBoard,'Board created successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while creating board');
  }
};

//Get all Board
export const getAllBoards = async (req, res) => {
  console.log(req.user?._id);
  if (!req.user || !req.user._id) {
    return res.status(401).json(new ApiResponse(401, 'Unauthorized access'))
  }
  try {

    
    const boards = await Board.find({ creator: req.user?._id.toString() }).sort({ createdAt: -1 });

    if (!boards || boards.length === 0) {
      return res.status(404).json(new ApiResponse(404, 'No boards found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200,boards, 'All boards fetched'));
  } catch (error) {
    throw new ApiError(500, 'Error while getting boards');
  }
};

// Get a specific board by ID
export const getBoardById = async (req, res) => {
  const {boardId} = req.params;
  try {
    const board = await Board.findById(boardId).populate('creator');
    if (!board) {
      return res.status(404).json(new ApiResponse(404, 'Board not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, board,'Board fetched successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while fetching board');
  }
};

//Delete Board
export const deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  console.log("bid:",boardId);

  if (!req.user || !req.user._id) {
    return res.status(401).json(new ApiResponse(401, 'Unauthorized access'));
  }

  try {
    const board = await Board.findOneAndDelete({ _id: boardId, creator: req.user._id });

    if (!board) {
      return res.status(404).json(new ApiResponse(404, 'Board not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Board deleted successfully'));
  } catch (error) {
    throw new ApiError(500, 'Error while deleting board');
  }
};