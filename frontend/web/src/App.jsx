import RanchHome from './pages/Home';
import AnimalsAdmin from './pages/admin/AnimalsAdmin';
import AnimalCreate from './pages/admin/AnimalCreate';
import AnimalEdit from './pages/admin/AnimalEdit';
import BulkMediaUpload from './components/BulkMediaUpload';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import TheBarn from './pages/TheBarn';
import AnimalDetails from './pages/AnimalDetails';
import ErrorPage from './pages/Error';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Loading from './components/Loader';


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    loadingElement: <Loading />, 
    children: [
      {
        index: true,
        element: <RanchHome />,
       
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "barn",
        element: <TheBarn />,
      },
      {
        path: "animals/:slug",
        element: <AnimalDetails />,
      },
    ],
  },
  {
    path:'/admin',
    element: <DashboardLayout />, 
    children: [
      {
        path:'animals',   
        element: <AnimalsAdmin />,        
      },
      {
        path: 'animals/new',
        element: <AnimalCreate />,
      },
      {
        path: 'animals/:slug/edit',
        element: <AnimalEdit />,
      },
      {
        path: 'media',
        element: <BulkMediaUpload />,
      }
    ]
  }

]); 

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;