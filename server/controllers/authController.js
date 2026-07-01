const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            credits: user.credits,
            plan: user.plan,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            title: user.title,
            location: user.location,
            skills: user.skills,
            socials: user.socials,
            preferences: user.preferences,
            stats: user.stats,
            visibility: user.visibility,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        title: user.title,
        location: user.location,
        skills: user.skills,
        socials: user.socials,
        preferences: user.preferences,
        stats: user.stats,
        creditsUsed: user.creditsUsed,
        visibility: user.visibility,
        role: user.role
    });
};

// @desc    Deduct credits for AI generation
// @route   POST /api/auth/deduct-credits
// @access  Private
const deductCredits = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.credits < 5) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        user.credits -= 5;
        await user.save();

        res.json({ credits: user.credits, message: 'Credits deducted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.username = req.body.username || user.username;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.title = req.body.title !== undefined ? req.body.title : user.title;
            user.location = req.body.location !== undefined ? req.body.location : user.location;

            if (req.body.skills !== undefined) {
                user.skills = req.body.skills;
            }

            if (req.body.socials) {
                user.socials = { ...user.socials, ...req.body.socials };
            }
            if (req.body.preferences) {
                user.preferences = { ...user.preferences, ...req.body.preferences };
            }
            if (req.body.visibility) {
                user.visibility = { ...user.visibility, ...req.body.visibility };
            }

            // Only update password if provided
            if (req.body.password) {
                // Future Implementation: Verify old password before setting new one.
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                credits: updatedUser.credits,
                plan: updatedUser.plan,
                avatar: updatedUser.avatar,
                banner: updatedUser.banner,
                bio: updatedUser.bio,
                title: updatedUser.title,
                location: updatedUser.location,
                skills: updatedUser.skills,
                socials: updatedUser.socials,
                preferences: updatedUser.preferences,
                stats: updatedUser.stats,
                creditsUsed: updatedUser.creditsUsed,
                visibility: updatedUser.visibility,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload Avatar
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        user.avatar = req.file.path; // Cloudinary URL
        await user.save();
        res.json({ avatar: user.avatar });
    } catch (error) {
        console.error("Avatar upload error:", error);
        res.status(500).json({ message: 'Avatar upload failed' });
    }
};

// @desc    Upload Banner
// @route   PUT /api/auth/banner
// @access  Private
const updateBanner = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        user.banner = req.file.path; // Cloudinary URL
        await user.save();
        res.json({ banner: user.banner });
    } catch (error) {
        console.error("Banner upload error:", error);
        res.status(500).json({ message: 'Banner upload failed' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    deductCredits,
    updateProfile,
    updateAvatar,
    updateBanner,
};
