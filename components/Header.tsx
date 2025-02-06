import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch user session on mount and on auth state changes.
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

  // For "My Profile", link to /profiles/edit if logged in.
  const myProfileLink = user ? `/profiles/edit` : '/auth';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo / Home */}
        <Link href="/" legacyBehavior>
          <a className="flex items-center">
            {/* The logo SVG already contains the site name, so we display only the logo.
                Increase the size as needed; here we set it to 4rem (64px). */}
            <img
              src="/logo.svg"
              alt="Find Public Goods Logo"
              className="w-16 h-16"
            />
          </a>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/projects" legacyBehavior>
            <a className="cursor-pointer hover:text-blue-600">Projects</a>
          </Link>
          <Link href="/profiles" legacyBehavior>
            <a className="cursor-pointer hover:text-blue-600">Profiles</a>
          </Link>
          <Link href="/projects/add" legacyBehavior>
            <a className="cursor-pointer hover:text-blue-600">Add Project</a>
          </Link>
          {user ? (
            <>
              <Link href={myProfileLink} legacyBehavior>
                <a className="cursor-pointer hover:text-blue-600">My Profile</a>
              </Link>
              <button onClick={handleLogout} className="cursor-pointer hover:text-blue-600">
                Log Out
              </button>
            </>
          ) : (
            <Link href="/auth" legacyBehavior>
              <a className="cursor-pointer hover:text-blue-600">Log In / Register</a>
            </Link>
          )}
        </nav>
        {/* Mobile Hamburger Menu */}
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
            <Link href="/projects" legacyBehavior>
              <a onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Projects
              </a>
            </Link>
            <Link href="/profiles" legacyBehavior>
              <a onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Profiles
              </a>
            </Link>
            <Link href="/projects/add" legacyBehavior>
              <a onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Add Project
              </a>
            </Link>
            {user ? (
              <>
                <Link href={myProfileLink} legacyBehavior>
                  <a onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                    My Profile
                  </a>
                </Link>
                <button
                  onClick={async () => {
                    await handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/auth" legacyBehavior>
                <a onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                  Log In / Register
                </a>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
