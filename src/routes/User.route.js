import { Router } from "express";
import { login, logout, register } from "../controllers/User.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.route("/signup").post(register)
router.route("/login").post(login)

router.route("/logout").post(verifyJWT,logout);
router.get('/check-auth', verifyJWT, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    res.status(200).json({
        success: true,
        user: req.user,
    });
});

export default router;