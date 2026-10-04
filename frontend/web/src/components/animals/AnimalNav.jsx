import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AnimalNav({ slug }) {
  const basePath = `/animals/${slug}`;

  const linkClass = ({ isActive }) =>
    [
      'relative whitespace-nowrap px-1 py-4 text-sm font-semibold',
      'uppercase tracking-widest transition-colors duration-200',
      isActive
        ? 'text-rust'
        : 'text-charcoal/60 hover:text-saddle-brown',
    ].join(' ');

  return (
    <nav className="bg-white border-b border-sage/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex gap-8 overflow-x-auto">
          <NavLink
            to={basePath}
            end
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                Overview
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust" />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to={`${basePath}/timeline`}
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                Timeline
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust" />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to={`${basePath}/gallery`}
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                Gallery
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust" />
                )}
              </>
            )}
          </NavLink>

          {/*
            Future:

            <NavLink to={`${basePath}/training`}>
              Training
            </NavLink>

            <NavLink to={`${basePath}/rides`}>
              Riding Log
            </NavLink>
          */}
        </div>
      </div>
    </nav>
  );
}