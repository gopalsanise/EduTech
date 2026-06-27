import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Menu } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './layouts/Sidebar'
import Branding from './components/ui/Branding'

// Shared Pages
import Assignments from './pages/Assignments'
import Timetable from './pages/Timetable'

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin'
import StaffLogin from './pages/auth/StaffLogin'
import StudentLogin from './pages/auth/StudentLogin'
import Signup from './pages/auth/Signup'
import CreatePassword from './pages/auth/CreatePassword'
import TeacherApply from './pages/auth/TeacherApply'
import VerifyEmail from './pages/auth/VerifyEmail'
import TeacherStatus from './pages/auth/TeacherStatus'
import ForgotPassword from './pages/auth/ForgotPassword'
import ChangePassword from './pages/auth/ChangePassword'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminStaff from './pages/admin/Staff'
import Branches from './pages/admin/Branches'
import Semesters from './pages/admin/Semesters'
import AdminAttendance from './pages/admin/Attendance'
import AdminAttendanceReport from './pages/admin/AdminAttendanceReport'
import AdminExaminations from './pages/admin/Examinations'
import AdminResults from './pages/admin/Results'
import AdminTimetable from './pages/admin/Timetable'
import AdminCalendar from './pages/admin/Calendar'
import AdminUserManagement from './pages/admin/UserManagement'
import AdminSettings from './pages/admin/Settings'

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard'
import StaffStudents from './pages/staff/Students'
import StaffAttendance from './pages/staff/Attendance'
import StaffResults from './pages/staff/Results'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentResults from './pages/student/Results'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login/student" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen w-full bg-slate-950 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 min-h-screen lg:ml-64 overflow-x-hidden">
        {/* Mobile Topbar — hidden on lg+ */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <Branding size="sm" showCollegeName={false} />
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

const HomeRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/login/student"} replace />
}

const DashboardBridge = () => {
  const { user } = useAuth()
  if (user?.role === 'admin') return <AdminDashboard />
  if (user?.role === 'staff' || user?.role === 'teacher') return <StaffDashboard />
  return <StudentDashboard />
}

// Placeholder for coming-soon pages
const ComingSoon = ({ title }) => (
  <div className="p-4 md:p-6 lg:p-8 min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400">This feature is coming soon.</p>
    </div>
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Landing & Auth Routes */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/staff" element={<StaffLogin />} />
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-password" element={<CreatePassword />} />
            <Route path="/teacher/apply" element={<TeacherApply />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/status/teacher" element={<TeacherStatus />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Navigate to="/login/student" replace />} />

            {/* Dashboard (role-aware) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardBridge /></ProtectedRoute>} />


            {/* Admin Routes */}
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/students/add" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/branches" element={<ProtectedRoute allowedRoles={['admin']}><Branches /></ProtectedRoute>} />
            <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={['admin']}><Semesters /></ProtectedRoute>} />

            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaff /></ProtectedRoute>} />
            <Route path="/admin/staff/add" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaff /></ProtectedRoute>} />

            <Route path="/admin/results" element={<ProtectedRoute allowedRoles={['admin']}><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/results/internal" element={<ProtectedRoute allowedRoles={['admin']}><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/results/practical" element={<ProtectedRoute allowedRoles={['admin']}><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/results/semester" element={<ProtectedRoute allowedRoles={['admin']}><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/results/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminResults /></ProtectedRoute>} />

            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/mark" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/view" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendanceReport /></ProtectedRoute>} />

            <Route path="/admin/examinations" element={<ProtectedRoute allowedRoles={['admin']}><AdminExaminations /></ProtectedRoute>} />
            <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimetable /></ProtectedRoute>} />
            <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8 text-white">Calendar Placeholder</div></ProtectedRoute>} />
            <Route path="/admin/user-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff/students" element={<ProtectedRoute allowedRoles={['staff', 'teacher']}><StaffStudents /></ProtectedRoute>} />
            <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={['staff', 'teacher']}><StaffAttendance /></ProtectedRoute>} />
            <Route path="/staff/results" element={<ProtectedRoute allowedRoles={['staff', 'teacher']}><StaffResults /></ProtectedRoute>} />
            <Route path="/staff/assignments" element={<ProtectedRoute allowedRoles={['staff', 'teacher']}><Assignments /></ProtectedRoute>} />
            <Route path="/staff/timetable" element={<ProtectedRoute allowedRoles={['staff', 'teacher']}><Timetable /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student/ai" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />
            <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><Timetable /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><Assignments /></ProtectedRoute>} />
            <Route path="/student/notices" element={<ProtectedRoute allowedRoles={['student']}><ComingSoon title="Notices" /></ProtectedRoute>} />

            {/* Shared Routes */}
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

            {/* Catch-all - Redirect to entry point */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
