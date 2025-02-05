import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const MAX_FILE_SIZE = 1048576; // 1MB

const ProfileEdit: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [profileBannerUrl, setProfileBannerUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the current user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (error) {
        // If no profile exists, we initialize empty fields
        setUsername('');
        setBio('');
        setInterests([]);
        setSocialLinks([]);
      } else if (data) {
        setUsername(data.username || '');
        setBio(data.bio || '');
        setProfilePhotoUrl(data.profile_photo || '');
        setProfileBannerUrl(data.profile_banner_image || '');
        setInterests(data.interests || []);
        setSocialLinks(data.social_links || []);
      }
    };
    fetchProfile();
  }, [router]);

  // Helper: upload image file to Supabase Storage (in "profile-images" bucket)
  const uploadImage = async (file: File, type: 'profile' | 'banner'): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      return null;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return null;
    }
    const { data: publicData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    if (!publicData.publicUrl) {
      setError('Error getting public URL.');
      return null;
    }
    return publicData.publicUrl;
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0], 'profile');
      if (url) setProfilePhotoUrl(url);
    }
  };

  const handleProfileBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0], 'banner');
      if (url) setProfileBannerUrl(url);
    }
  };

  // Repeater functions for interests
  const addInterest = () => setInterests(prev => [...prev, '']);
  const updateInterest = (index: number, value: string) => {
    const newInterests = [...interests];
    newInterests[index] = value;
    setInterests(newInterests);
  };
  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  // Repeater functions for social links
  const addSocialLink = () => setSocialLinks(prev => [...prev, '']);
  const updateSocialLink = (index: number, value: string) => {
    const newSocialLinks = [...socialLinks];
    newSocialLinks[index] = value;
    setSocialLinks(newSocialLinks);
  };
  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }
    const payload = {
      user_id: session.user.id,
      username,
      bio,
      profile_photo: profilePhotoUrl,
      profile_banner_image: profileBannerUrl,
      interests,
      social_links: socialLinks,
    };
    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) {
      setError(error.message);
    } else {
      router.push(`/profiles/${session.user.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Your Profile</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Display Name</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={4}
          />
        </div>
        {/* File Uploads */}
        <div>
          <label className="block font-medium mb-1">Upload Profile Banner Image (max 1MB)</label>
          <input type="file" accept="image/*" onChange={handleProfileBannerChange} className="w-full" />
          {profileBannerUrl && (
            <div className="mt-2">
              <img src={profileBannerUrl} alt="Banner Preview" className="w-full h-40 object-cover rounded" />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Profile Photo (max 1MB)</label>
          <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="w-full" />
          {profilePhotoUrl && (
            <div className="mt-2">
              <img src={profilePhotoUrl} alt="Profile Photo Preview" className="w-24 h-24 object-cover rounded" />
            </div>
          )}
        </div>
        {/* Interests Repeater */}
        <div>
          <label className="block font-medium mb-1">Interests</label>
          {interests.map((interest, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={interest}
                onChange={(e) => updateInterest(idx, e.target.value)}
                className="flex-grow p-2 border rounded-lg"
                placeholder="e.g., Renewable Energy"
                required
              />
              <button type="button" onClick={() => removeInterest(idx)} className="ml-2 text-red-600 hover:text-red-800">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addInterest} className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
            Add Interest
          </button>
        </div>
        {/* Social Links Repeater */}
        <div>
          <label className="block font-medium mb-1">Social Links (max 5)</label>
          {socialLinks.map((link, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateSocialLink(idx, e.target.value)}
                className="flex-grow p-2 border rounded-lg"
                placeholder="e.g., https://twitter.com/username"
                required
              />
              <button type="button" onClick={() => removeSocialLink(idx)} className="ml-2 text-red-600 hover:text-red-800">
                Remove
              </button>
            </div>
          ))}
          {socialLinks.length < 5 && (
            <button type="button" onClick={addSocialLink} className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
              Add Social Link
            </button>
          )}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
