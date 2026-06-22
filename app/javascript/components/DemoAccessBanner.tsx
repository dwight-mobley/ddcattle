import React, { useState } from 'react';

const DemoAccessBanner = () => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="max-w-md w-full mx-auto mt-6 bg-slate-50 border border-slate-200 rounded-lg shadow-sm overflow-hidden font-sans">
      <div className="p-4 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span>🛠️</span> Reviewer Sandbox Access
        </h3>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-600 mb-4">
          Want to test the full CRUD features without creating an account? Use the temporary credentials below:
        </p>

        <div className="flex flex-col gap-2 mb-4 bg-white p-3 rounded border border-slate-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Username:</span>
            <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono font-bold select-all">
              admin
            </code>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Password:</span>
            <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono font-bold select-all">
              password123
            </code>
          </div>
        </div>

        <button
          onClick={() => setShowTerms(!showTerms)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none flex items-center gap-1"
        >
          {showTerms ? 'Hide Disclaimers' : 'View Terms & Disclaimers'}
        </button>

        {showTerms && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900 transition-all duration-300">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <span>⚠️</span> Yes, I know this is a security sin!
            </p>
            <p className="mb-2">
              This is intentionally exposed for hiring managers and reviewers to test the application easily. This environment is ephemeral and will be wiped shortly.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li><strong>Keep it clean:</strong> No inappropriate or offensive material.</li>
              <li><strong>Play nice:</strong> Test the CRUD features, but please don't try to permanently break the database.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoAccessBanner;