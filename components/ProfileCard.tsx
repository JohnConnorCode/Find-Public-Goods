// components/ProfileCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface Profile {
  user_id: string;
  username: string;
  bio: string;
  profile_photo?: string;
  profile_banner_image?: string;
  interests: string[];
  social_links: string[];
}

// Predefined gradient classes.
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

// Helper to select a gradient based on the user_id.
const getGradientClass = (user_id: string) => {
  let hash = 0;
  for (let i = 0; i < user_id.length; i++) {
    hash = user_id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradientClasses.length;
  return gradientClasses[index];
};

const ProfileCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [bannerBroken, setBannerBroken] = useState(false);
  const [profileBroken, setProfileBroken] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for fade-in effect.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Banner: use image if available and not broken; otherwise, use a gradient fallback.
  const bannerContent = (profile.profile_banner_image && !bannerBroken) ? (
    <img
      src={profile.profile_banner_image}
      alt="Profile Banner"
      className="w-full h-24 object-cover"
      onError={() => setBannerBroken(true)}
    />
  ) : (
    <div className={`w-full h-24 ${getGradientClass(profile.user_id)}`}></div>
  );

  // Profile photo: use image if available and not broken; otherwise, show gradient fallback with initial.
  const profileContent = (profile.profile_photo && !profileBroken) ? (
    <img
      src={profile.profile_photo}
      alt="Profile Photo"
      className="w-16 h-16 rounded-full object-cover border-2 border-white"
      onError={() => setProfileBroken(true)}
    />
  ) : (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-white ${getGradientClass(profile.user_id)}`}>
      <span className="text-white text-xl font-bold">{profile.username.charAt(0)}</span>
    </div>
  );

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-lg shadow overflow-hidden transform transition duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Link href={`/profiles/${profile.user_id}`}>
        <div className="cursor-pointer">
          {bannerContent}
          <div className="p-4 relative">
            <div className="absolute -top-8 left-4">{profileContent}</div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-800">{profile.username}</h2>
              <p className="text-gray-700 text-sm mb-2 line-clamp-2">{profile.bio}</p>
              <div className="flex flex-wrap">
                {profile.interests.slice(0, 3).map((interest, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProfileCard;
