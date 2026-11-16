const dataService = require('../services/dataService');

// @desc    Get all courses with search, filtering, sorting and pagination
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const result = await dataService.getCourses({
      search,
      category,
      level,
      sort,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      count: result.courses.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      courses: result.courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const data = await dataService.getCourseById(req.params.id);

    if (!data || !data.course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course: data.course,
      enrolledStudentsCount: data.enrolledStudentsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      category,
      duration,
      level,
      thumbnail,
      price,
      rating,
      lessons,
    } = req.body;

    if (!title || !description || !instructor || !category || !duration || !level) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, instructor, category, duration, level.',
      });
    }

    const course = await dataService.createCourse(
      {
        title,
        description,
        instructor,
        category,
        duration,
        level,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        price: price !== undefined ? price : 0,
        rating: rating !== undefined ? rating : 4.8,
        lessons,
      },
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await dataService.updateCourse(req.params.id, req.body);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const success = await dataService.deleteCourse(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course and related enrollments deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await dataService.getCategories();
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
};
