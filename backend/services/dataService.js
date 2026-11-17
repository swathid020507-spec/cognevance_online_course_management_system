const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { getSampleData } = require('../data/seedData');

// In-memory dynamic fallback store
let memoryStore = {
  users: [],
  courses: [],
  enrollments: [],
  initialized: false,
};

// Initialize in-memory store with sample data
const initMemoryStore = async () => {
  if (memoryStore.initialized) return;
  const data = await getSampleData();
  memoryStore.users = data.users;
  memoryStore.courses = data.courses;
  memoryStore.enrollments = data.enrollments;
  memoryStore.initialized = true;
  console.log(`[DataService] Initialized in-memory fallback store with ${memoryStore.courses.length} courses.`);
};

// Check if MongoDB connection is active
const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Auto-seed MongoDB safely if courses are missing without overwriting users or enrollments
const autoSeedMongoIfEmpty = async () => {
  try {
    if (!isMongoConnected()) return;
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('[DataService] No courses found in MongoDB. Safely seeding initial 9 courses...');
      const { users, courses, enrollments } = await getSampleData();

      // 1. Safely insert users only if they don't already exist (avoid duplicate key collisions)
      for (const u of users) {
        const existing = await User.findOne({ email: u.email });
        if (!existing) {
          await User.create(u);
        }
      }

      // 2. Safely insert courses (only if not already existing by title)
      for (const c of courses) {
        const existingCourse = await Course.findOne({ title: c.title });
        if (!existingCourse) {
          await Course.create(c);
        }
      }

      // 3. Safely insert enrollments if none exist
      const enrollmentCount = await Enrollment.countDocuments();
      if (enrollmentCount === 0 && enrollments && enrollments.length > 0) {
        try {
          await Enrollment.insertMany(enrollments);
        } catch (e) {
          console.warn('[DataService] Initial enrollments skipped or partial:', e.message);
        }
      }

      console.log('[DataService] Safe course seed to MongoDB completed successfully!');
    } else {
      console.log(`[DataService] MongoDB active with ${courseCount} existing courses.`);
    }
  } catch (err) {
    console.warn('[DataService Auto-Seed Warning]:', err.message);
  }
};

// Initialize fallback store on module load so it is immediately available
initMemoryStore();

// ================= COURSE OPERATIONS =================
const getCourses = async ({ search, category, level, sort, page = 1, limit = 12 }) => {
  if (isMongoConnected()) {
    const query = {};
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { instructor: searchRegex },
        { category: searchRegex },
      ];
    }
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }
    if (level && level !== 'All' && level.trim() !== '') {
      query.level = level;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'title-asc') sortOptions = { title: 1 };
    else if (sort === 'title-desc') sortOptions = { title: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    return { total, courses, page: pageNum, pages: Math.ceil(total / limitNum) || 1 };
  }

  // Fallback to in-memory store
  await initMemoryStore();
  let results = [...memoryStore.courses];

  // 1. Search
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.instructor.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }

  // 2. Category Filter
  if (category && category !== 'All' && category.trim()) {
    results = results.filter(
      (c) => c.category.toLowerCase() === category.trim().toLowerCase()
    );
  }

  // 3. Level Filter
  if (level && level !== 'All' && level.trim()) {
    results = results.filter((c) => c.level === level);
  }

  // 4. Sort
  if (sort === 'oldest') {
    results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'rating') {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === 'title-asc') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'title-desc') {
    results.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    // newest first
    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const total = results.length;
  const startIndex = (pageNum - 1) * limitNum;
  const pagedCourses = results.slice(startIndex, startIndex + limitNum);

  return {
    total,
    courses: pagedCourses,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  };
};

const getCourseById = async (id) => {
  if (isMongoConnected()) {
    const course = await Course.findById(id).populate('createdBy', 'name email');
    if (!course) return null;
    const enrolledStudentsCount = await Enrollment.countDocuments({ course: course._id });
    return { course, enrolledStudentsCount };
  }

  await initMemoryStore();
  const course = memoryStore.courses.find((c) => String(c._id) === String(id));
  if (!course) return null;
  const enrolledStudentsCount = memoryStore.enrollments.filter(
    (e) => String(e.course) === String(id) || String(e.course?._id) === String(id)
  ).length;
  return { course, enrolledStudentsCount };
};

const createCourse = async (courseData, userId) => {
  if (isMongoConnected()) {
    return await Course.create({ ...courseData, createdBy: userId });
  }

  await initMemoryStore();
  const newCourse = {
    _id: new mongoose.Types.ObjectId().toString(),
    ...courseData,
    createdBy: userId,
    createdAt: new Date(),
    rating: courseData.rating || 4.8,
    price: courseData.price || 0,
    lessons: courseData.lessons || [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Introduction & Curriculum Setup',
        duration: '15 mins',
        videoUrl: 'https://www.youtube.com/embed/7CqJlxBYj-M',
        content: 'Overview of syllabus, prerequisites, and developer setup.',
      },
    ],
  };
  memoryStore.courses.unshift(newCourse);
  return newCourse;
};

const updateCourse = async (id, updateData) => {
  if (isMongoConnected()) {
    return await Course.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  await initMemoryStore();
  const index = memoryStore.courses.findIndex((c) => String(c._id) === String(id));
  if (index === -1) return null;
  memoryStore.courses[index] = { ...memoryStore.courses[index], ...updateData };
  return memoryStore.courses[index];
};

const deleteCourse = async (id) => {
  if (isMongoConnected()) {
    await Course.findByIdAndDelete(id);
    await Enrollment.deleteMany({ course: id });
    return true;
  }

  await initMemoryStore();
  memoryStore.courses = memoryStore.courses.filter((c) => String(c._id) !== String(id));
  memoryStore.enrollments = memoryStore.enrollments.filter((e) => String(e.course) !== String(id));
  return true;
};

const getCategories = async () => {
  if (isMongoConnected()) {
    return await Course.distinct('category');
  }

  await initMemoryStore();
  const cats = [...new Set(memoryStore.courses.map((c) => c.category))];
  return cats;
};

// ================= ENROLLMENT OPERATIONS =================
const enrollInCourse = async (studentId, courseId) => {
  if (isMongoConnected()) {
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      const err = new Error('You are already enrolled in this course.');
      err.statusCode = 400;
      throw err;
    }
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'ongoing',
      progressPercentage: 0,
      completedLessons: [],
      lastAccessedAt: new Date(),
    });
    return await Enrollment.findById(enrollment._id).populate('course');
  }

  await initMemoryStore();
  const course = memoryStore.courses.find((c) => String(c._id) === String(courseId));
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  const existing = memoryStore.enrollments.find(
    (e) => String(e.student) === String(studentId) && (String(e.course) === String(courseId) || String(e.course?._id) === String(courseId))
  );

  if (existing) {
    const err = new Error('You are already enrolled in this course.');
    err.statusCode = 400;
    throw err;
  }

  const newEnrollment = {
    _id: new mongoose.Types.ObjectId().toString(),
    student: studentId,
    course: course,
    status: 'ongoing',
    progressPercentage: 0,
    completedLessons: [],
    enrolledAt: new Date(),
    lastAccessedAt: new Date(),
  };
  memoryStore.enrollments.push(newEnrollment);
  return newEnrollment;
};

const getMyEnrollments = async (studentId, statusFilter) => {
  if (isMongoConnected()) {
    const filter = { student: studentId };
    if (statusFilter && ['ongoing', 'completed'].includes(statusFilter)) {
      filter.status = statusFilter;
    }
    return await Enrollment.find(filter).populate('course').sort({ lastAccessedAt: -1 });
  }

  await initMemoryStore();
  let list = memoryStore.enrollments.filter(
    (e) => String(e.student) === String(studentId) || String(e.student?._id) === String(studentId)
  );

  if (statusFilter && ['ongoing', 'completed'].includes(statusFilter)) {
    list = list.filter((e) => e.status === statusFilter);
  }

  return list.map((e) => {
    // Ensure course object is populated
    const courseObj =
      typeof e.course === 'object' && e.course !== null
        ? e.course
        : memoryStore.courses.find((c) => String(c._id) === String(e.course));
    return { ...e, course: courseObj };
  });
};

const checkEnrollmentStatus = async (studentId, courseId) => {
  if (isMongoConnected()) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId }).populate('course');
    return enrollment ? { isEnrolled: true, enrollment } : { isEnrolled: false, enrollment: null };
  }

  await initMemoryStore();
  const enrollment = memoryStore.enrollments.find(
    (e) =>
      (String(e.student) === String(studentId) || String(e.student?._id) === String(studentId)) &&
      (String(e.course) === String(courseId) || String(e.course?._id) === String(courseId))
  );

  if (!enrollment) return { isEnrolled: false, enrollment: null };
  const courseObj =
    typeof enrollment.course === 'object' && enrollment.course !== null
      ? enrollment.course
      : memoryStore.courses.find((c) => String(c._id) === String(enrollment.course));

  return { isEnrolled: true, enrollment: { ...enrollment, course: courseObj } };
};

const updateProgress = async (studentId, courseId, { lessonId, progressPercentage, completedLessons }) => {
  if (isMongoConnected()) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) return null;
    const course = await Course.findById(courseId);
    if (!course) return null;

    if (completedLessons && Array.isArray(completedLessons)) {
      enrollment.completedLessons = completedLessons;
    } else if (lessonId) {
      const idx = enrollment.completedLessons.indexOf(lessonId);
      if (idx === -1) enrollment.completedLessons.push(lessonId);
      else enrollment.completedLessons.splice(idx, 1);
    }

    if (course.lessons && course.lessons.length > 0) {
      const pct = Math.round((enrollment.completedLessons.length / course.lessons.length) * 100);
      enrollment.progressPercentage = Math.min(100, Math.max(0, pct));
    } else if (progressPercentage !== undefined) {
      enrollment.progressPercentage = Math.min(100, Math.max(0, Number(progressPercentage)));
    }

    enrollment.status = enrollment.progressPercentage >= 100 ? 'completed' : 'ongoing';
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    return await Enrollment.findById(enrollment._id).populate('course');
  }

  await initMemoryStore();
  const enrIndex = memoryStore.enrollments.findIndex(
    (e) =>
      (String(e.student) === String(studentId) || String(e.student?._id) === String(studentId)) &&
      (String(e.course) === String(courseId) || String(e.course?._id) === String(courseId))
  );

  if (enrIndex === -1) return null;
  const enr = memoryStore.enrollments[enrIndex];
  const course = memoryStore.courses.find((c) => String(c._id) === String(courseId));

  if (completedLessons && Array.isArray(completedLessons)) {
    enr.completedLessons = completedLessons;
  } else if (lessonId) {
    const idx = enr.completedLessons.indexOf(lessonId);
    if (idx === -1) enr.completedLessons.push(lessonId);
    else enr.completedLessons.splice(idx, 1);
  }

  if (course && course.lessons && course.lessons.length > 0) {
    const pct = Math.round((enr.completedLessons.length / course.lessons.length) * 100);
    enr.progressPercentage = Math.min(100, Math.max(0, pct));
  } else if (progressPercentage !== undefined) {
    enr.progressPercentage = Math.min(100, Math.max(0, Number(progressPercentage)));
  }

  enr.status = enr.progressPercentage >= 100 ? 'completed' : 'ongoing';
  enr.lastAccessedAt = new Date();
  enr.course = course;
  memoryStore.enrollments[enrIndex] = enr;
  return enr;
};

// ================= USER OPERATIONS =================
const findUserByEmail = async (email) => {
  if (isMongoConnected()) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  await initMemoryStore();
  return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = async (id) => {
  if (isMongoConnected()) {
    return await User.findById(id);
  }

  await initMemoryStore();
  return memoryStore.users.find((u) => String(u._id) === String(id));
};

const createUser = async ({ name, email, password, role }) => {
  if (isMongoConnected()) {
    return await User.create({ name, email, password, role });
  }

  await initMemoryStore();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'student',
    avatar: '',
    bio: '',
    createdAt: new Date(),
    matchPassword: async function (entered) {
      return await bcrypt.compare(entered, this.password);
    },
  };
  memoryStore.users.push(newUser);
  return newUser;
};

const updateUser = async (id, updateData) => {
  if (isMongoConnected()) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  await initMemoryStore();
  const idx = memoryStore.users.findIndex((u) => String(u._id) === String(id));
  if (idx === -1) return null;
  memoryStore.users[idx] = { ...memoryStore.users[idx], ...updateData };
  return memoryStore.users[idx];
};

const deleteUser = async (id) => {
  if (isMongoConnected()) {
    await User.findByIdAndDelete(id);
    await Enrollment.deleteMany({ student: id });
    return true;
  }

  await initMemoryStore();
  memoryStore.users = memoryStore.users.filter((u) => String(u._id) !== String(id));
  memoryStore.enrollments = memoryStore.enrollments.filter((e) => String(e.student) !== String(id));
  return true;
};

// ================= ADMIN STATS =================
const getAdminStats = async () => {
  if (isMongoConnected()) {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const ongoingEnrollments = totalEnrollments - completedEnrollments;

    const recentEnrollments = await Enrollment.find()
      .populate('student', 'name email avatar')
      .populate('course', 'title category level thumbnail')
      .sort({ createdAt: -1 })
      .limit(6);

    const categoryDistribution = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      stats: {
        totalStudents,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        ongoingEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      },
      recentEnrollments,
      categoryDistribution,
    };
  }

  await initMemoryStore();
  const totalStudents = memoryStore.users.filter((u) => u.role === 'student').length;
  const totalAdmins = memoryStore.users.filter((u) => u.role === 'admin').length;
  const totalCourses = memoryStore.courses.length;
  const totalEnrollments = memoryStore.enrollments.length;
  const completedEnrollments = memoryStore.enrollments.filter((e) => e.status === 'completed').length;
  const ongoingEnrollments = totalEnrollments - completedEnrollments;

  const catMap = {};
  memoryStore.courses.forEach((c) => {
    catMap[c.category] = (catMap[c.category] || 0) + 1;
  });
  const categoryDistribution = Object.keys(catMap).map((k) => ({ _id: k, count: catMap[k] }));

  const recentEnrollments = memoryStore.enrollments.slice(-6).map((e) => {
    const studentObj =
      typeof e.student === 'object' && e.student !== null
        ? e.student
        : memoryStore.users.find((u) => String(u._id) === String(e.student));
    const courseObj =
      typeof e.course === 'object' && e.course !== null
        ? e.course
        : memoryStore.courses.find((c) => String(c._id) === String(e.course));
    return { ...e, student: studentObj, course: courseObj };
  });

  return {
    stats: {
      totalStudents,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      ongoingEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
    },
    recentEnrollments,
    categoryDistribution,
  };
};

const getAllUsersWithEnrollments = async ({ search, role }) => {
  if (isMongoConnected()) {
    const query = {};
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    if (role && ['student', 'admin'].includes(role)) {
      query.role = role;
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    return await Promise.all(
      users.map(async (u) => {
        const count = await Enrollment.countDocuments({ student: u._id });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          createdAt: u.createdAt,
          enrollmentCount: count,
        };
      })
    );
  }

  await initMemoryStore();
  let list = [...memoryStore.users];
  if (search) {
    const t = search.trim().toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }
  if (role) {
    list = list.filter((u) => u.role === role);
  }

  return list.map((u) => {
    const count = memoryStore.enrollments.filter(
      (e) => String(e.student) === String(u._id) || String(e.student?._id) === String(u._id)
    ).length;
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
      enrollmentCount: count,
    };
  });
};

module.exports = {
  isMongoConnected,
  autoSeedMongoIfEmpty,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  enrollInCourse,
  getMyEnrollments,
  checkEnrollmentStatus,
  updateProgress,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  getAdminStats,
  getAllUsersWithEnrollments,
};
