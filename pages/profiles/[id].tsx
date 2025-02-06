import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import FadeInCard from '../../components/FadeInCard';

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

export interface UserProfile {
  user_id: string;
  username: string;
  bio: string;
  interests: string[];
  social_links: string[];
  profile_photo: string;
  profile_banner_image: string;
}

interface ProfileReviewProps {
  profile: UserProfile | null;
  error?: string;
}

const ProfileReview: React.FC<ProfileReviewProps> = ({ profile, error }) => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerBroken, setBannerBroken] = useState(false);
  const [profileBroken, setProfileBroken] = useState(false);

  // Trigger fade-in of the banner on mount.
  useEffect(() => {
    setBannerVisible(true);
  }, []);

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">Error loading profile.</p>
      </div>
    );
  }

  const hasImage = (url?: string) => Boolean(url && url.trim() !== "");

  const bannerContent = (hasImage(profile.profile_banner_image) && !bannerBroken) ? (
    <img
      src={profile.profile_banner_image}
      alt="Profile Banner"
      className="w-full h-80 object-cover rounded-lg shadow-md"
      onError={() => setBannerBroken(true)}
    />
  ) : (
    <div className={`w-full h-80 rounded-lg shadow-md ${getGradientClass(profile.user_id)}`} />
  );

  const profileContent = (hasImage(profile.profile_photo) && !profileBroken) ? (
    <img
      src={profile.profile_photo}
      alt="Profile Photo"
      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
      onError={() => setProfileBroken(true)}
    />
  ) : (
    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow ${getGradientClass(profile.user_id)}`}>
      <span className="text-white text-3xl font-bold">
        {profile.username ? profile.username.charAt(0) : 'U'}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Banner Section */}
      <div className="transition-opacity duration-300 ease-out opacity-100">
        {bannerContent}
      </div>
      {/* Content Card */}
      {/* On mobile: use margin-top (mt-4) so card sits below banner; on desktop (md:), use negative margin (md:-mt-20) so it overlaps */}
      <FadeInCard className="relative z-10 mx-auto mt-4 md:-mt-20">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            {profileContent}
            <div className="ml-6">
              <h1 className="text-3xl font-bold">{profile.username || 'User'}</h1>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Bio</h2>
            <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio provided.'}</p>
          </div>
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.social_links && profile.social_links.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Social Links</h2>
              <ul className="space-y-2">
                {profile.social_links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-center">
            <Link href="/profile/edit" legacyBehavior>
              <a className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition">
                Edit Profile
              </a>
            </Link>
          </div>
        </div>
      </FadeInCard>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  if (error) {
    return { props: { profile: null, error: error.message } };
  }
  return { props: { profile } };
};

export default ProfileReview;
