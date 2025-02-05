// pages/profile.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

interface Profile {
  username: string;
  bio: string;
  profile_photo: string;
  interests: string[];
  social_links: string[];
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    username: '',
    bio: '',
    profile_photo: '',
    interests: [],
    social_links: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch the logged-in user's profile on mount.
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        // If no session, redirect to the auth page.
        router.push('/auth');
        return;
      }
      const userId = session.user.id;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        // If the profile doesn't exist, start with an empty form.
        setProfile({
          username: '',
          bio: '',
          profile_photo: '',
          interests: [],
          social_links: []
        });
      } else {
        setProfile({
          username: data.username || '',
          bio: data.bio || '',
          profile_photo: data.profile_photo || '',
          interests: data.interests || [],
          social_links: data.social_links || []
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Interests dynamic field handling
  const handleInterestChange = (index: number, value: string) => {
    const updated = [...profile.interests];
    updated[index] = value;
    setProfile(prev => ({ ...prev, interests: updated }));
  };
  const addInterest = () => {
    setProfile(prev => ({ ...prev, interests: [...prev.interests, ''] }));
  };
  const removeInterest = (index: number) => {
    const updated = profile.interests.filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, interests: updated }));
  };

  // Social links dynamic field handling (max 5)
  const handleSocialLinkChange = (index: number, value: string) => {
    const updated = [...profile.social_links];
    updated[index] = value;
    setProfile(prev => ({ ...prev, social_links: updated }));
  };
  const addSocialLink = () => {
    if (profile.social_links.length < 5) {
      setProfile(prev => ({ ...prev, social_links: [...prev.social_links, ''] }));
    }
  };
  const removeSocialLink = (index: number) => {
    const updated = profile.social_links.filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, social_links: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError('User not logged in.');
      router.push('/auth');
      return;
    }
    const userId = session.user.id;
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        username: profile.username,
        bio: profile.bio,
        profile_photo: profile.profile_photo,
        interests: profile.interests,
        social_links: profile.social_links
      }, { onConflict: 'user_id' });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Profile updated successfully.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {message && <p className="text-green-600 text-center mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block font-medium mb-1">Display Name</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block font-medium mb-1">Profile Photo URL</label>
          <input
            type="url"
            value={profile.profile_photo}
            onChange={(e) => handleInputChange('profile_photo', e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          {profile.profile_photo && (
            <div className="mt-2">
              <img
                src={profile.profile_photo}
                alt="Profile Photo"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={4}
          />
        </div>

        {/* Interests (Repeater Field) */}
        <div>
          <label className="block font-medium mb-1">Interests</label>
          {profile.interests.map((interest, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={interest}
                onChange={(e) => handleInterestChange(index, e.target.value)}
                className="flex-grow p-2 border rounded"
                placeholder="e.g., Renewable Energy"
              />
              <button
                type="button"
                onClick={() => removeInterest(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInterest}
            className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
          >
            Add Interest
          </button>
        </div>

        {/* Social Links (Repeater Field, max 5) */}
        <div>
          <label className="block font-medium mb-1">Social Links (up to 5)</label>
          {profile.social_links.map((link, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                className="flex-grow p-2 border rounded"
                placeholder="e.g., https://twitter.com/username"
              />
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          {profile.social_links.length < 5 && (
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            >
              Add Social Link
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
