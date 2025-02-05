// components/Header.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/">
          <span className="text-2xl font-bold text-blue-600 cursor-pointer">
            Find Public Goods
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/projects">
            <span className="cursor-pointer hover:text-blue-600">Projects</span>
          </Link>
          <Link href="/projects/add">
            <span className="cursor-pointer hover:text-blue-600">Add Project</span>
          </Link>
          {user ? (
            <>
              <Link href="/profile">
                <span className="cursor-pointer hover:text-blue-600">My Profile</span>
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                className="cursor-pointer hover:text-blue-600"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link href="/auth">
              <span className="cursor-pointer hover:text-blue-600">Log In / Register</span>
            </Link>
          )}
        </nav>
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <Link href="/projects">
              <span className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Projects
              </span>
            </Link>
            <Link href="/projects/add">
              <span className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Add Project
              </span>
            </Link>
            {user ? (
              <>
                <Link href="/profile">
                  <span className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                    My Profile
                  </span>
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setMobileOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/auth">
                <span className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                  Log In / Register
                </span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
