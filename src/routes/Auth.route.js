import {Router} from "express";
import passport from "passport";

const router = Router();

// Route to start Google OAuth authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route after Google OAuth login
router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or home
    res.redirect("/dd");
  }
);

// Route to handle logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;