import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { ScrollRestoration } from "react-router-dom";
export default function MainLayout() {
  return (
    <div className="app-container">
      {/* The Navbar will stay fixed on every page */}
      <Navbar /> 
      
      <main className="content">
        {/* Child route components render here */}
        <Outlet /> 
      </main>
      <ScrollRestoration />
    </div>
  );
}
