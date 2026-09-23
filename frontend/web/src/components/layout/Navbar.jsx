import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Adjust this import path based on your folder structure
import { selectCurrentToken, logOut } from "../../features/auth/authSlice";
import logo from "../../assets/ddcc-B7n0MI5M.png";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Barn", path: "/barn" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if a token exists in Redux to determine logged-in state
  const token = useSelector(selectCurrentToken);
  const isLoggedIn = !!token;

  const handleLogout = () => {
    dispatch(logOut());
    setIsMobileMenuOpen(false);
    navigate("/"); // Redirect to home after logging out
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-saddle-brown/10 bg-desert-sand/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3" onClick={closeMobileMenu}>
          <div className="flex items-center justify-center rounded-full text-desert-sand">
            <img src={logo} alt="DD Cattle Company Logo" className="h-20 w-20" />
          </div>

          <div className="leading-none">
            <span className="block font-serif text-xl tracking-wide text-saddle-brown">
              DD Cattle Company
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em] text-sage">
              Est. 2022
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/" && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-rust"
                    : "text-charcoal/70 hover:text-saddle-brown"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-rust" />
                )}
              </Link>
            );
          })}

          {/* Desktop Auth State */}
          <div className="ml-4 pl-4 border-l border-saddle-brown/20">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-saddle-brown px-4 py-1.5 text-sm font-medium text-saddle-brown transition-colors hover:bg-saddle-brown hover:text-desert-sand"
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-sage/50 px-4 py-1.5 text-sm font-medium text-charcoal/80 transition-colors hover:border-saddle-brown hover:text-saddle-brown"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-saddle-brown transition-colors hover:bg-saddle-brown/5 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 transition-transform duration-200"
          >
            {isMobileMenuOpen ? (
              // X icon when open
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Hamburger icon when closed
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-saddle-brown/10 bg-desert-sand px-6 py-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            {links.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/" && location.pathname.startsWith(link.path));

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive ? "text-rust" : "text-charcoal/80 hover:text-saddle-brown"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Mobile Auth State */}
            <div className="mt-4 pt-4 border-t border-saddle-brown/10">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-base font-medium text-rust hover:text-rust/80 transition-colors"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block py-2 text-base font-medium text-saddle-brown hover:text-saddle-brown/80 transition-colors"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}