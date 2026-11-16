const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollmentStatus,
  updateProgress,
  getAllEnrollments,
} = require('../controllers/enrollmentController');
const { protect, admin } = require('../middleware/auth');

// Student enrollment routes (protected)
router.get('/my', protect, getMyEnrollments);
router.get('/all', protect, admin, getAllEnrollments);
router.get('/check/:courseId', protect, checkEnrollmentStatus);
router.post('/:courseId', protect, enrollInCourse);
router.put('/:courseId/progress', protect, updateProgress);

module.exports = router;
