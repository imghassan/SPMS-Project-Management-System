const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

// @desc    Create a new board (project)
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, isPublic } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Project name is required.' });
        }

        // Find or create a default workspace for this user
        let workspace = await Workspace.findOne({ owner: userId });
        if (!workspace) {
            workspace = await Workspace.create({
                name: 'My Workspace',
                description: 'Default workspace',
                owner: userId,
                members: []
            });
        }

        // Create the board
        const board = await Board.create({
            name: name.trim(),
            workspace: workspace._id,
            owner: userId,
            members: [],
            isPublic: isPublic ?? false
        });

        // Add the board to the workspace's boards array
        await Workspace.findByIdAndUpdate(workspace._id, {
            $push: { boards: board._id }
        });

        res.status(201).json({
            success: true,
            data: board
        });
    } catch (error) {
        console.error('createBoard error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all boards for the current user
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
    try {
        const userId = req.user.id;
        const boards = await Board.find({
            $or: [{ owner: userId }, { members: userId }]
        });
        res.status(200).json({ success: true, data: boards });
    } catch (error) {
        console.error('getBoards error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
