const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/auth');

// Public route to list categories
router.get('/categories', getCategories);

// Course collection routes
router
  .route('/')
  .get(getCourses)
  .post(protect, admin, createCourse);

// Single course routes
router
  .route('/:id')
  .get(getCourseById)
  .put(protect, admin, updateCourse)
  .delete(protect, admin, deleteCourse);

module.exports = router;
