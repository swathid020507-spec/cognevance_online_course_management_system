# 🎓 Cognevance Technologies — Online Course Management System
### Level 2 Full Stack Web Developer Internship Capstone Project

![Cognevance LMS Banner](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Executive Summary

The **Cognevance Technologies Online Course Management System** is a full-stack educational web application developed for the **Cognevance Technologies Level 2 Full Stack Web Developer Internship Evaluation**.

The platform allows **Students** to explore technical curricula, enroll in courses, and interactively track their progress across individual lessons and modules. Simultaneously, it equips **Administrators** with an analytics dashboard to create and manage courses, view platform metrics, and oversee user access.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM, Lucide Icons | Responsive SPA, Component-driven architecture, Navy/White Theme |
| **Backend** | Node.js, Express.js 5 | RESTful API, Middleware architecture, Modular routes & controllers |
| **Database** | MongoDB, Mongoose 9 | Normalized schemas, Compound unique indexes, Population references |
| **Security & Auth** | JSON Web Tokens (JWT), BCryptJS, CORS | Stateless authentication, Salted password hashing, Role-Based Access Control (RBAC) |
| **Styling** | Modern CSS & Design Tokens | Crisp Navy Blue & White palette, responsive flexbox/grid layout |

---

## 🚀 Key Features

### 1. 🔐 Authentication & Authorization (RBAC)
- **Role-Based Access Control**: Differentiated capabilities and dashboards for **Students** and **Administrators**.
- **Secure Password Hashing**: Passwords salted and hashed with 10 rounds using `bcryptjs`.
- **JWT Stateless Authentication**: Secure authorization headers (`Bearer <token>`) with 30-day token lifetime.
- **Route Protection**: `ProtectedRoute` component guarding student dashboard, interactive classroom, and admin panels.
- **Demo Autofill**: Quick-fill buttons on the login page for evaluator demonstration.

### 2. 📚 Course Catalog & Management
- **Course Authoring**: Admin capabilities to Create, Read, Update, and Delete (CRUD) courses with field validation.
- **Course Attributes**: Title, description, instructor, category, duration, difficulty level, rating, thumbnail, and structured syllabus lessons.
- **Interactive Syllabus Viewer**: Lesson breakdown with estimated durations and curriculum overview.

### 3. 📝 Student Enrollment & Progress Tracking
- **Course Enrollment**: Students can enroll in available courses with a single action.
- **Duplicate Prevention**: Compound MongoDB unique index `{ student: 1, course: 1 }` prevents duplicate enrollments at both database and application levels.
- **Interactive Classroom**: Dedicated `/learn/:id` classroom view with embedded lecture preview, lesson checklist, and completion toggle.
- **Dynamic Progress Calculation**: Real-time progress bar recalculates automatically as lessons are marked complete.
- **Status Transition**: Automatically transitions enrollment status from `ongoing` to `completed` upon reaching 100% progress.

### 4. 📊 Student Dashboard
- **Personalized Hub**: Displays student greeting, enrolled tracks, and resume learning shortcuts.
- **Dynamic KPI Metrics**: Tracks Total Enrolled Courses, In-Progress count, Completed count, and Average Progress %.
- **Filter Tabs**: Filter between All, Ongoing, and Completed courses.

### 5. 🛡️ Administrator Command Center
- **Platform Analytics**: Dynamic counts of Total Students, Total Courses, Total Enrollments, and Completion Rate %.
- **Curriculum Distribution**: Aggregates courses categorized by technical track.
- **Recent Activity Feed**: Real-time log of recent student enrollments with student name, email, course title, and status.
- **User Management**: Inspect registered accounts, switch user roles between `student` and `admin`, or remove accounts.
- **Course Management Table**: Searchable table with quick actions to Edit details or Delete courses with confirmation modals.

### 6. 🔍 Search, Filtering & Sorting
- **Real-Time Search**: Search courses by title, keywords, or instructor name.
- **Category Filter Chips**: Fast filtering by *Web Development*, *Data Science*, *Cloud & DevOps*, *Artificial Intelligence*, *Mobile Development*, *Cybersecurity*, and *UI/UX Design*.
- **Skill Level Selector**: Filter by *Beginner*, *Intermediate*, or *Advanced*.
- **Sorting Options**: Sort by *Newest First*, *Highest Rated*, *Title (A-Z)*, and *Title (Z-A)*.

### 7. 🎨 Responsive Frontend Design
- **Theme**: Clean Navy Blue (`#0f172a`, `#1e293b`), Primary Blue (`#2563eb`), Clean White (`#ffffff`), and functional status accents.
- **Responsiveness**: Fluid layout across mobile phones, tablets, laptops, and desktop screens with an accessible navigation drawer.

---

## 📁 Project Directory Structure

```text
Cognevance_Online_Course_Management_System/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── courseController.js   # Course CRUD, filtering, search
│   │   ├── enrollmentController.js# Enrollment, progress tracking
│   │   └── adminController.js    # Admin stats, user management
│   ├── data/
│   │   └── seedData.js           # 9 realistic technical courses and demo data
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorMiddleware.js    # Centralized error & 404 handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt pre-save hook
│   │   ├── Course.js             # Course schema with embedded lessons
│   │   └── Enrollment.js         # Enrollment schema with unique index
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── courseRoutes.js       # /api/courses endpoints
│   │   ├── enrollmentRoutes.js   # /api/enrollments endpoints
│   │   └── adminRoutes.js        # /api/admin endpoints
│   ├── services/
│   │   └── dataService.js        # Unified data service with fallback support
│   ├── .env.example              # Safe environment variable template
│   ├── diagnose.js               # Atlas connection diagnostic tool
│   ├── package.json              # Backend scripts & dependencies
│   ├── seeder.js                 # Database seeder script
│   ├── server.js                 # Express server entrypoint
│   ├── set-env.js                # Helper script to set MONGODB_URI safely
│   └── test-db.js                # Database connection verification script
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── AlertMessage.jsx  # Notification & error alerts
│   │   │       ├── CourseCard.jsx    # Reusable course & progress card
│   │   │       ├── Footer.jsx        # Internship footer with curriculum links
│   │   │       ├── LoadingSpinner.jsx# Animated loading indicator
│   │   │       ├── Navbar.jsx        # Responsive navigation with role badge
│   │   │       └── ProtectedRoute.jsx# Auth and Admin route guards
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global React authentication provider
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Analytics, course CRUD, user management
│   │   │   ├── CourseDetailsPage.jsx # Course syllabus & enrollment card
│   │   │   ├── CourseLearnPage.jsx   # Interactive classroom & lesson tracking
│   │   │   ├── CoursesPage.jsx       # Course catalog with search & filters
│   │   │   ├── HomePage.jsx          # Hero, highlights, featured courses
│   │   │   ├── LoginPage.jsx         # Sign in with evaluation quick-fill
│   │   │   ├── NotFoundPage.jsx      # 404 page
│   │   │   ├── RegisterPage.jsx      # Student / Admin registration
│   │   │   └── StudentDashboard.jsx  # Student progress & enrolled tracks
│   │   ├── services/
│   │   │   └── api.js                # Centralized API fetch wrapper with JWT
│   │   ├── App.jsx                   # React Router layout
│   │   ├── index.css                 # Clean Navy & White styling system
│   │   └── main.jsx                  # React 19 entrypoint
│   ├── index.html
│   ├── vite.config.js                # Vite config with backend API proxy
│   └── package.json
│
├── .gitignore                        # Root Git ignore rules (protects all .env files)
└── README.md                         # Complete documentation
```

---

## ⚡ Installation & Quick Start Guide

### Step 1: Clone or Navigate to the Project
```bash
cd Cognevance_Online_Course_Management_System
```

---

### Step 2: Backend Configuration & Startup

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Create your local `backend/.env` file from the provided example template:
   ```bash
   cp .env.example .env
   ```
3. Configure the environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/cognevance_lms?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRE=30d
   ADMIN_SECRET=your_admin_secret_key_here
   ```
   > **Note on Database Connection**:
   > - The backend uses `MONGODB_URI` as its primary connection string variable (with `MONGO_URI` supported as fallback).
   > - **MongoDB Atlas (Cloud)**: Set `MONGODB_URI` to your Atlas connection string targeting the `cognevance_lms` database.
   > - **Local MongoDB**: Use `MONGODB_URI=mongodb://127.0.0.1:27017/cognevance_lms`.
   > - **Test Connection**: Run `npm run test:db` at any time to verify your database connection.

4. Seed the database with the initial 9 technical courses and evaluation accounts:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will start on `http://localhost:5000` with API routes mounted at `http://localhost:5000/api`.*

---

### Step 3: Frontend Startup

1. Open a second terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at `http://localhost:5173`.*

---

## 🔑 Demo Accounts (Configured for Evaluation Testing)

When running `npm run seed`, the database is populated with sample accounts for demonstration:

| Role | Email | Password | Pre-loaded Evaluation Data |
| :--- | :--- | :--- | :--- |
| **Lead Administrator** | `admin@cognevance.com` | `Admin@123` | Full access to Admin Console, Course CRUD, User Role Switcher, and Platform KPIs |
| **Student (Alex Morgan)** | `student@cognevance.com` | `Student@123` | Pre-enrolled in 3 courses with 60% progress, 100% completed, and 33% ongoing |

> 💡 **Demo Shortcut**: On the **Sign In** page, click the **"Fill Student"** or **"Fill Admin"** buttons to test without typing credentials. Real user accounts can also be created via the Register page.

---

## 📖 API Documentation Reference

All responses return standard JSON structures with `{ success: true, ... }` or `{ success: false, message: "..." }`.

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Admin account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user display name, bio, or password |

### 2. Course Endpoints (`/api/courses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | Get all courses (supports `?search=`, `?category=`, `?level=`, `?sort=`, `?page=`, `?limit=`) |
| `GET` | `/api/courses/categories` | Public | Retrieve list of distinct course categories |
| `GET` | `/api/courses/:id` | Public | Retrieve course details, lessons, and enrollment count |
| `POST` | `/api/courses` | Admin | Create a new technical course |
| `PUT` | `/api/courses/:id` | Admin | Update an existing course |
| `DELETE` | `/api/courses/:id` | Admin | Delete course and its associated enrollments |

### 3. Enrollment Endpoints (`/api/enrollments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/enrollments/:courseId` | Student | Enroll current user in a course (duplicate prevented) |
| `GET` | `/api/enrollments/my` | Student | Get all courses enrolled by the authenticated student |
| `GET` | `/api/enrollments/check/:courseId` | Student | Check if current user is enrolled in a specific course |
| `PUT` | `/api/enrollments/:courseId/progress`| Student | Mark lesson complete / update progress percentage |
| `GET` | `/api/enrollments/all` | Admin | Retrieve all enrollments across all students |

### 4. Admin Control Endpoints (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Real-time counts (students, courses, enrollments, completion rate, categories) |
| `GET` | `/api/admin/users` | Admin | List all registered users with enrollment counts and search filter |
| `PUT` | `/api/admin/users/:id/role`| Admin | Switch user role between `student` and `admin` |
| `DELETE` | `/api/admin/users/:id` | Admin | Remove user and cleanup their enrollment records |

---

## 🗄️ Database Schemas (Mongoose)

### 1. User Schema (`User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  timestamps: true
}
```

### 2. Course Schema (`Course.js`)
```javascript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  thumbnail: { type: String, required: true },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  lessons: [
    {
      title: { type: String, required: true },
      duration: { type: String, default: '15 mins' },
      videoUrl: { type: String },
      content: { type: String }
    }
  ],
  createdBy: { type: ObjectId, ref: 'User' },
  timestamps: true
}
```

### 3. Enrollment Schema (`Enrollment.js`)
```javascript
{
  student: { type: ObjectId, ref: 'User', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: String }],
  lastAccessedAt: { type: Date, default: Date.now },
  timestamps: true
}
// Compound unique index ensuring one enrollment per student per course:
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
```

---

## 🏆 Internship Evaluation Walkthrough

To demonstrate the application during the internship assessment:

1. **Demonstrate Home Page**:
   - Highlight the Cognevance Technologies theme, hero metrics, and featured courses.
2. **Demonstrate Course Catalog & Filtering**:
   - Navigate to `/courses`.
   - Test the live search bar, category chips, and level dropdown filter.
3. **Demonstrate Student Workflow**:
   - Sign in as `student@cognevance.com` using the Quick-Fill button.
   - Go to `/dashboard` to view enrolled courses, overall average progress, and ongoing vs completed tabs.
   - Click "Resume Learning" to open the interactive classroom (`/learn/:id`).
   - Check off a lesson — watch the progress bar instantly recalculate in real-time.
   - Return to `/courses` and enroll in a new course to verify instant enrollment.
4. **Demonstrate Admin Workflow**:
   - Sign out and sign in as `admin@cognevance.com`.
   - Navigate to the **Admin Control** (`/admin`).
   - Review live analytics: total students, total courses, completion rate, and curriculum breakdown.
   - Click **"Add New Course"** to publish a new course with custom thumbnail and duration.
   - Edit an existing course and view immediate table updates.
   - Switch to **User Management** and demonstrate changing a user's role from student to admin.

---

## 👨‍💻 Developer & Internship Information
- **Candidate Project**: Level 2 Full Stack Web Developer Internship
- **Organization**: Cognevance Technologies
- **Project Status**: Completed & Verified for Internship Evaluation
