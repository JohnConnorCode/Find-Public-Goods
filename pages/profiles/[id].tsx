import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export interface Profile {
  user_id: string;
  username: string;
  bio: string;
  profile_photo?: string;
  profile_banner_image?: string;
  interests: string[];
  social_links: string[];
}

const gradientClasses = [
  "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
  "bg-gradient-to-r from-green-400 to-blue-500",
  "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
  "bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-green-500",
  "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500",
  "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
  "bg-gradient-to-r from-pink-500 to-indigo-500",
  "bg-gradient-to-r from-yellow-300 via-green-300 to-blue-500",
];

const getGradientClass = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradientClasses.length;
  return gradientClasses[index];
};

const ProfileDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [bannerBroken, setBannerBroken] = useState(false);
  const [photoBroken, setPhotoBroken] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', id)
          .single();
        if (error || !data) throw new Error(error?.message || 'Profile not found.');
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      }
    };
    fetchProfile();
  }, [id]);

  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;
  if (!profile) return <p className="text-center mt-6">Loading profile...</p>;

  const bannerContent = (profile.profile_banner_image && !bannerBroken) ? (
    <img
      src={profile.profile_banner_image}
      alt="Profile Banner"
      className="w-full h-48 object-cover rounded-lg shadow"
      onError={() => setBannerBroken(true)}
    />
  ) : (
    <div className={`w-full h-48 rounded-lg shadow ${getGradientClass(profile.user_id)}`}></div>
  );

  const photoContent = (profile.profile_photo && !photoBroken) ? (
    <img
      src={profile.profile_photo}
      alt="Profile Photo"
      className="w-20 h-20 rounded-full object-cover border-2 border-white"
      onError={() => setPhotoBroken(true)}
    />
  ) : (
    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-white ${getGradientClass(profile.user_id)}`}>
      <span className="text-white text-xl font-bold">{profile.username.charAt(0)}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Banner */}
      <div className="mb-10">{bannerContent}</div>
      <div className="bg-white rounded-lg shadow p-10">
        <div className="flex items-center mb-10">
          {photoContent}
          <div className="ml-4">
            <h1 className="text-4xl font-bold">{profile.username}</h1>
            <p className="text-gray-500 mt-1">{profile.bio}</p>
          </div>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Interests</h2>
          <div className="flex flex-wrap">
            {profile.interests.map((interest, idx) => (
              <span key={idx} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                {interest}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Social Links</h2>
          <div className="flex flex-wrap">
            {profile.social_links.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mr-4 mb-2"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
