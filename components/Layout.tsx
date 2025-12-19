
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 sm:py-10">
      <header className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-3 shadow-xl shadow-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.905c-.921-.154-1.859-.235-2.812-.235H12m0 0V3m0 0c1.472 0 2.882.265 4.185.75M12 3c-1.472 0-2.882.265-4.185.75M5.25 4.905c.921-.154 1.859-.235 2.812-.235H12m7.5 14.347l-1.018-4.072M5.25 19.252l1.018-4.072M18.33 8.291c.973.155 1.932.342 2.87.56l-1.018 4.072M5.67 8.291c-.973.155-1.932.342-2.87.56l1.018 4.072M12 22.5c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">LegalPulse</h1>
        <p className="text-slate-500 font-medium">Asesoría Estratégica con Inteligencia Artificial</p>
      </header>
      <main className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {children}
      </main>
      <footer className="mt-8 text-center text-slate-400 text-xs max-w-sm">
        <p>2026 ©LegalPulse. Esta herramienta proporciona orientación y no sustituye el consejo legal vinculante de un abogado colegiado.</p>
      </footer>
    </div>
  );
};
