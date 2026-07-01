const express = require('express');
const router = express.Router();
const {
    createProject,
    getMyProjects,
    getCommunityProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/my-projects', protect, getMyProjects);
router.get('/community', getCommunityProjects);
router.route('/:id')
    // We might need a middleware to check auth optionally for getProjectById if we want to support public view without login,
    // but for now let's assume getProjectById handles logic if user is present or not, or we make it public route and handle logic inside.
    // For simplicity, let's make :id route purely public but sensitive logic inside controller checks visibility.
    // Actually, 'protect' will block non-logged-in users.
    // Let's create a "optional auth" middleware if needed, but for now let's keep it simple:
    // If you view the detailed builder, you likely needed to be logged in effectively unless it's a "share link".
    // Let's attach protect to update/delete, and keep get public but controller checks logic.
    .get(optionalProtect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;
