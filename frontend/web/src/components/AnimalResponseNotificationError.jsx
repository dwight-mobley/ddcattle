import React from 'react'

function AnimalResponseNotificationError() {
    return (
        <div className="mx-auto my-8 flex max-w-2xl items-center gap-4 rounded-xl border border-gray-200 bg-desert-sand p-5 text-gray-800 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-gray-500"
                    aria-hidden="true"
                >
                    <path d="M12 3L2.5 20h19L12 3z" />
                    <path d="M12 9v5" />
                    <path d="M12 17h.01" />
                </svg>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900">
                    Looks like the herd wandered off
                </h3>

                ```
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    We are currently having difficulties finding the animals.
                    Please try again later and we will have them rounded up.
                </p>
                ```

            </div>
        </div>
    )
}

export default AnimalResponseNotificationError