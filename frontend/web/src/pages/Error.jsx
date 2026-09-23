import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  
  let title = "Lost on the Trail";
  let message = "You've wandered into uncharted territory. The page you're looking for doesn't exist or has been moved.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Off the Reservation (404)";
      message = "Looks like this mustang bolted the pasture. We couldn't find the page you were looking for.";
    } else {
      title = `Trail Blocked (${error.status})`;
      message = error.statusText || "An unexpected error occurred on the range.";
    }
  }

  return (
    <div className="min-h-screen bg-desert-sand font-sans text-charcoal flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-sage/20 p-10 md:p-14 text-center">
        
        {/* Western Branding Accent */}
        <div className="inline-block px-4 py-1.5 bg-sage/20 text-saddle-brown rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          Ranch Advisory
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-saddle-brown mb-4">
          {title}
        </h1>

        <p className="text-lg text-charcoal/80 leading-relaxed mb-10">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-8 py-4 bg-rust text-white font-semibold rounded-xl hover:bg-saddle-brown transition-all duration-300 uppercase tracking-widest text-sm shadow-md text-center"
          >
            Back to the Homestead
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 border-2 border-saddle-brown text-saddle-brown font-semibold rounded-xl hover:bg-saddle-brown hover:text-white transition-all duration-300 uppercase tracking-widest text-sm"
          >
            Re-check Trail
          </button>
        </div>

      </div>
    </div>
  );
}