import "./App.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CoursesList from "./pages/CoursesList";
import CourseCreate from "./pages/CourseCreate";
import CourseEdit from "./pages/CourseEdit";
import CourseDetail from "./pages/CourseDetail";
import Overview from "./pages/Overview";
import UsersList from "./pages/UsersList";
import UserDetail from "./pages/UserDetail";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetail from "./pages/CompanyDetail";
import Categories from "./pages/Categories";
// Notifications and Conversations pages removed
import Settings from "./pages/Settings";
import AdminNavbar from "./components/AdminNavbar";
import AdminFooter from "./components/AdminFooter";

// Sidebar removed — admin uses top navbar and footer

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <AdminNavbar />

        <div className="max-w-6xl mx-auto">
          <main>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/courses" element={<CoursesList />} />
              <Route path="/courses/new" element={<CourseCreate />} />
              <Route path="/courses/:id/edit" element={<CourseEdit />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/companies" element={<CompaniesList />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>

        <AdminFooter />
      </div>
    </BrowserRouter>
  );
}
