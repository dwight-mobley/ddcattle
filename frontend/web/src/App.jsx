
import RanchHome from './pages/Home';
import AnimalTimelinePage from './pages/animals/AnimalTimelinePage';
import AnimalGalleryPage from './pages/animals/AnimalGalleryPage';
import AnimalOverview from './pages/animals/AnimalOverview';
import AdminSettings from './pages/admin/Settings';
import MedicalRecordCreate from './pages/admin/MedicalRecordCreate';
import MedicalRecordEdit from './pages/admin/MedicalRecordEdit';
import AnimalsAdmin from './pages/admin/AnimalsAdmin';
import AnimalCreate from './pages/admin/AnimalCreate';
import AnimalEdit from './pages/admin/AnimalEdit';
import RemindersAdmin from './pages/admin/RemindersAdmin';
import ReminderCreate from './pages/admin/ReminderCreate';
import ReminderEdit from './pages/admin/ReminderEdit';
import MediaAdmin from './pages/admin/MediaAdmin';
import BulkMediaUpload from './components/BulkMediaUpload';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import TheBarn from './pages/TheBarn';
import AnimalDetails from './pages/animals/AnimalDetails';
import ErrorPage from './pages/Error';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Loading from './components/Loader';
import RequireAdmin from './components/auth/RequireAuth';
import MedicalRecordsAdmin from './pages/admin/MedicalRecordsAdmin';
import Dashboard from './pages/admin/Dashboard';

const router = createBrowserRouter([
    {
        path: '/', element: <MainLayout />, errorElement: <ErrorPage />, loadingElement: <Loading />,
        children: [
            { index: true, element: <RanchHome /> },
            { path: 'login', element: <Login /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
            { path: 'barn', element: <TheBarn /> },
            {
                path: 'animals/:slug',
                element: <AnimalDetails />,
                children: [
                    { index: true, element: <AnimalOverview /> },
                    { path: 'timeline', element: <AnimalTimelinePage /> },
                    { path: 'gallery', element: <AnimalGalleryPage /> },
                ],
            },
        ],
    },
    {
        path: '/admin', element: <RequireAdmin><DashboardLayout /></RequireAdmin>,
        children: [
            { path: '', index: true, element: <Dashboard /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'animals', element: <AnimalsAdmin /> },
            { path: 'animals/new', element: <AnimalCreate /> },
            { path: 'animals/:slug/edit', element: <AnimalEdit /> },
            { path: 'reminders', element: <RemindersAdmin /> },
            { path: 'reminders/new', element: <ReminderCreate /> },
            { path: 'reminders/:id/edit', element: <ReminderEdit /> },
            { path: 'media', element: <MediaAdmin /> },
            { path: 'media/upload', element: <BulkMediaUpload /> },
            { path: 'medical', element: <MedicalRecordsAdmin /> },
            { path: 'medical/new', element: <MedicalRecordCreate /> },
            { path: 'medical/:id/edit', element: <MedicalRecordEdit /> },
            { path: 'settings', element: <AdminSettings /> },
        ],
    },
]);
function App() { return <RouterProvider router={router} />; }
export default App;

