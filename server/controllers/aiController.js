const User = require('../models/User');
const Project = require('../models/Project');
const Credit = require('../models/Credit');
const generateWebsiteCode = require('../utils/generateCode');

// @desc    Generate website code
// @route   POST /api/ai/generate
// @access  Private
const generateCode = async (req, res) => {
    const { prompt } = req.body;
    const userId = req.user._id;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // 1. Check Credits
        const user = await User.findById(userId);
        if (user.credits <= 0) {
            return res.status(403).json({ message: 'Insufficient credits. Please upgrade.' });
        }

        // 2. Generate Code via Gemini
        const generatedCode = await generateWebsiteCode(prompt);

        // 3. Deduct Credit
        user.credits -= 1;
        await user.save();

        // 4. Log Credit Usage
        await Credit.create({
            userId,
            action: 'generate',
            amount: 1,
            description: `Generated website for prompt: ${prompt.substring(0, 50)}...`
        });

        // 5. Return Code (Don't save project yet)
        res.status(200).json({ generatedCode, credits: user.credits });

    } catch (error) {
        console.error("Geneation Error:", error);
        res.status(500).json({ message: 'AI Generation Failed', error: error.message });
    }
};

module.exports = { generateCode };
