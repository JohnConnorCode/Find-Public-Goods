import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const Header: React.FC = () => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Find Public Goods
        </Link>
        <nav className="space-x-6">
          <Link href="/projects" className="hover:text-blue-600">
            Projects
          </Link>
          <Link href="/projects/add" className="hover:text-blue-600">
            Add Project
          </Link>
          
          
{user ? (
  <>
    <Link href="/profile" className="hover:text-blue-600">
      My Profile
    </Link>
    <button onClick={handleLogout} className="hover:text-blue-600">
      Log Out
    </button>
  </>
) : (
  <Link href="/auth" className="hover:text-blue-600">
    Log In / Register
  </Link>
)}


        </nav>
      </div>
    </header>
  );
};

export default Header;
