import { Router } from "express";
import { createBoard, getAllBoards, getBoardById, deleteBoard } from "../controllers/Board.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();


router.route("/c").post(verifyJWT, createBoard);

router.route("/getAll").get(verifyJWT, getAllBoards);
router.route("/g/:boardId").get(verifyJWT, getBoardById);

// Update a specific board by ID
// router.route("/:id").put(verifyJWT, updateBoard);

router.route("/d/:boardId").delete(verifyJWT, deleteBoard);

export default router;
