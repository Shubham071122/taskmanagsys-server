import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
}

const register = async(req,res) => {
    const {fullName, email, password} = req.body;
    console.log("reg:",req.body);

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(400, "User with email or already exist");
    }

    const user = await User.create({
        fullName,
        email,
        password,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log("createdUser:",createdUser);

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registring the user"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "User Registered!"));
}

const login = async(req,res) => {
    const {email, password} = req.body;
    
    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({email});

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials!");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const logedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log("acc:",accessToken);
    console.log("ref:",refreshToken);
    console.log("liu:",logedInUser)

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: logedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully!"
            )
        );

};

const logout = async(req,res) => {
    try {
        if (!req.user || !req.user._id) {
            return res
                .status(400)
                .json(new ApiResponse(400, {}, "User not authenticated"));
        }

        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: null } },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        };

        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(200)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Server error"));
    }
}

export {register,login,logout}