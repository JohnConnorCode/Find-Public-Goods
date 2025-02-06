import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const MAX_FILE_SIZE = 1048576; // 1MB

const AddProject: React.FC = () => {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  
  // Form field states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impactAreas, setImpactAreas] = useState<string[]>([]);
  const [fundingPlatform, setFundingPlatform] = useState('');
  const [governanceModel, setGovernanceModel] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [projectProfileImageUrl, setProjectProfileImageUrl] = useState('');
  const [projectBannerImageUrl, setProjectBannerImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Trigger fade-in effect on mount
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Repeater field functions for Impact Areas
  const addImpactArea = () => setImpactAreas((prev) => [...prev, '']);
  const updateImpactArea = (index: number, value: string) => {
    const newImpactAreas = [...impactAreas];
    newImpactAreas[index] = value;
    setImpactAreas(newImpactAreas);
  };
  const removeImpactArea = (index: number) => {
    setImpactAreas(impactAreas.filter((_, i) => i !== index));
  };

  // File upload helper for images (using Supabase Storage)
  const uploadImage = async (file: File, type: 'profile' | 'banner'): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      return null;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return null;
    }
    const { data: publicData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);
    if (!publicData.publicUrl) {
      setError('Error getting public URL.');
      return null;
    }
    return publicData.publicUrl;
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0], 'profile');
      if (url) setProjectProfileImageUrl(url);
    }
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0], 'banner');
      if (url) setProjectBannerImageUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        name,
        description,
        category,
        impact_areas: impactAreas,
        funding_platform: fundingPlatform,
        governance_model: governanceModel,
        website_url: websiteUrl,
        contact_email: contactEmail,
        project_profile_image: projectProfileImageUrl,
        project_banner_image: projectBannerImageUrl,
        submitted_by: session?.user?.id || null,
      };

      const response = await axios.post('/api/projects/add', payload);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        router.push(`/projects/${response.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className={`max-w-3xl mx-auto my-16 p-8 bg-white rounded-lg shadow-lg transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-bold text-center mb-8">Add New Project</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
          </div>
          {/* Category, Funding Platform, Governance Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1" htmlFor="category">Category</label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="Climate">Climate</option>
                <option value="Education">Education</option>
                <option value="DeFi">DeFi</option>
                <option value="Social Impact">Social Impact</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1" htmlFor="fundingPlatform">Funding Platform</label>
              <select
                id="fundingPlatform"
                required
                value={fundingPlatform}
                onChange={(e) => setFundingPlatform(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="Gitcoin">Gitcoin</option>
                <option value="Ethereum Foundation">Ethereum Foundation</option>
                <option value="Optimism RPGF">Optimism RPGF</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1" htmlFor="governanceModel">Governance Model</label>
              <select
                id="governanceModel"
                required
                value={governanceModel}
                onChange={(e) => setGovernanceModel(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="DAO">DAO</option>
                <option value="Quadratic Funding">Quadratic Funding</option>
                <option value="Hybrid">Hybrid</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
          {/* Impact Areas Repeater */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Impact Areas</label>
            {impactAreas.map((area, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  value={area}
                  onChange={(e) => updateImpactArea(idx, e.target.value)}
                  className="flex-grow p-2 border rounded-lg focus:outline-none"
                  placeholder="e.g., Renewable Energy"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeImpactArea(idx)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImpactArea}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            >
              Add Impact Area
            </button>
          </div>
          {/* Website URL */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="websiteUrl">Website URL</label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Contact Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="contactEmail">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* File Uploads for Images */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Project Profile Image (max 1MB)</label>
            <input type="file" accept="image/*" onChange={handleProfileImageChange} className="w-full" />
            {projectProfileImageUrl && (
              <div className="mt-2">
                <img src={projectProfileImageUrl} alt="Project Profile Preview" className="w-24 h-24 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Project Banner Image (max 1MB)</label>
            <input type="file" accept="image/*" onChange={handleBannerImageChange} className="w-full" />
            {projectBannerImageUrl && (
              <div className="mt-2">
                <img src={projectBannerImageUrl} alt="Project Banner Preview" className="w-full h-40 object-cover rounded" />
              </div>
            )}
          </div>
          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            {loading ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
