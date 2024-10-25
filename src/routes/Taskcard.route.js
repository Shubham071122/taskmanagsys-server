import { Router } from "express";
import { createTaskCard, getTaskCardsByBoard, updateTaskCard, deleteTaskCard } from "../controllers/Taskcard.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();


router.route("/c").post(verifyJWT, createTaskCard);

router.route("/get-all/:boardId").get(verifyJWT, getTaskCardsByBoard);

router.route("/u/:cardId").put(verifyJWT, updateTaskCard);

router.route("/d/:cardId").delete(verifyJWT, deleteTaskCard);

export default router;
