const dataService = require('../services/dataService');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (Student)
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const enrollment = await dataService.enrollInCourse(req.user._id, courseId);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Get logged in user's enrolled courses
// @route   GET /api/enrollments/my
// @access  Private
const getMyEnrollments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const enrollments = await dataService.getMyEnrollments(req.user._id, status);

    const totalEnrolled = enrollments.length;
    const completedCount = enrollments.filter((e) => e.status === 'completed').length;
    const ongoingCount = totalEnrolled - completedCount;
    const averageProgress =
      totalEnrolled > 0
        ? Math.round(
            enrollments.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) /
              totalEnrolled
          )
        : 0;

    res.status(200).json({
      success: true,
      count: enrollments.length,
      stats: {
        totalEnrolled,
        completedCount,
        ongoingCount,
        averageProgress,
      },
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await dataService.checkEnrollmentStatus(req.user._id, courseId);

    res.status(200).json({
      success: true,
      isEnrolled: result.isEnrolled,
      enrollment: result.enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course progress & completed lessons
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
const updateProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, progressPercentage, completedLessons } = req.body;

    const enrollment = await dataService.updateProgress(req.user._id, courseId, {
      lessonId,
      progressPercentage,
      completedLessons,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found for this course.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully!',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments across all students (Admin)
// @route   GET /api/enrollments/all
// @access  Private/Admin
const getAllEnrollments = async (req, res, next) => {
  try {
    const adminData = await dataService.getAdminStats();
    res.status(200).json({
      success: true,
      count: adminData.recentEnrollments.length,
      enrollments: adminData.recentEnrollments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollmentStatus,
  updateProgress,
  getAllEnrollments,
};
