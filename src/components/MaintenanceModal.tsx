'use client';

import React, { useState } from 'react';

export default function MaintenanceModal() {
  const [open, setOpen] = useState(true);

  function close() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative mx-4 w-full max-w-4xl rounded-xl bg-white p-10 shadow-2xl">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
              <path d="M11.3 1.046a1 1 0 0 1 1.4 0l1.093 1.093a2 2 0 0 0 2.828 0l.212-.212a1 1 0 0 1 1.414 0l2.826 2.826a1 1 0 0 1 0 1.414l-.212.212a2 2 0 0 0 0 2.828L22.954 10.7a1 1 0 0 1 0 1.4l-3.09 3.09a6.5 6.5 0 1 1-9.153-9.153l3.09-3.09Z"/>
              <path d="M7.5 14a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-2">Maintenance Notice</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are currently unable to provide online services as our website is
              undergoing maintenance and updates.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
