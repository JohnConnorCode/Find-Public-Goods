import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ProfileCard, { Profile } from '../../components/ProfileCard';
import FadeInCard from '../../components/FadeInCard';

const ProfilesIndex: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase.from('user_profiles').select('*');
      if (searchQuery.trim() !== '') {
        query = query.or(`username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto p-4">
         <FadeInCard>
      <h1 className="text-4xl font-bold text-center mb-8">User Profiles</h1>
      </FadeInCard>
      <FadeInCard>
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Search profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </FadeInCard>
      {loading && <p className="text-center">Loading profiles...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && profiles.length === 0 && (
        <p className="text-center text-gray-600">No profiles found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard key={profile.user_id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

export default ProfilesIndex;
