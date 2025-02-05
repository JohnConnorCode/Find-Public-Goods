// pages/projects/add.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const MAX_FILE_SIZE = 1048576; // 1MB in bytes

const AddProject: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impactAreas, setImpactAreas] = useState<string[]>([]);
  const [fundingPlatform, setFundingPlatform] = useState('');
  const [governanceModel, setGovernanceModel] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  // Instead of text URLs, we upload images and store their public URLs.
  const [projectProfileImageUrl, setProjectProfileImageUrl] = useState('');
  const [projectBannerImageUrl, setProjectBannerImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Repeater field functions for impact areas.
  const addImpactArea = () => setImpactAreas((prev) => [...prev, '']);
  const updateImpactArea = (index: number, value: string) => {
    const newImpactAreas = [...impactAreas];
    newImpactAreas[index] = value;
    setImpactAreas(newImpactAreas);
  };
  const removeImpactArea = (index: number) => {
    setImpactAreas(impactAreas.filter((_, i) => i !== index));
  };

  // File upload helper: uploads a file to Supabase Storage and returns its public URL.
  const uploadImage = async (file: File, type: 'profile' | 'banner'): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      return null;
    }
    // Create a unique filename
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
    // getPublicUrl returns an object with a "publicUrl" property.
    const { data: publicData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    if (!publicData.publicUrl) {
      setError('Error getting public URL.');
      return null;
    }
    return publicData.publicUrl;
  };

  // Handlers for file inputs
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadImage(file, 'profile');
      if (url) setProjectProfileImageUrl(url);
    }
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadImage(file, 'banner');
      if (url) setProjectBannerImageUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Retrieve session for submitted_by field
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

      const { data, error: apiError } = await axios.post('/api/projects/add', payload);
      if (apiError) {
        setError(apiError.message);
      } else {
        router.push(`/projects/${data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Add a New Project</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Fields */}
        <div>
          <label className="block font-medium mb-1">Project Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={5}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg"
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
            <label className="block font-medium mb-1">Funding Platform</label>
            <select
              required
              value={fundingPlatform}
              onChange={(e) => setFundingPlatform(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select...</option>
              <option value="Gitcoin">Gitcoin</option>
              <option value="Optimism RPGF">Optimism RPGF</option>
              <option value="Ethereum Foundation">Ethereum Foundation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Governance Model</label>
            <select
              required
              value={governanceModel}
              onChange={(e) => setGovernanceModel(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select...</option>
              <option value="DAO">DAO</option>
              <option value="Quadratic Funding">Quadratic Funding</option>
              <option value="Hybrid">Hybrid</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
        {/* Impact Areas as a Repeater Field */}
        <div>
          <label className="block font-medium mb-1">Impact Areas</label>
          {impactAreas.map((area, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={area}
                onChange={(e) => updateImpactArea(index, e.target.value)}
                className="flex-grow p-2 border rounded-lg"
                placeholder="e.g., Renewable Energy"
                required
              />
              <button
                type="button"
                onClick={() => removeImpactArea(index)}
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
        <div>
          <label className="block font-medium mb-1">Website URL</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        {/* File Uploads for Images */}
        <div>
          <label className="block font-medium mb-1">Upload Project Profile Image (max 1MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="w-full"
          />
          {projectProfileImageUrl && (
            <div className="mt-2">
              <img
                src={projectProfileImageUrl}
                alt="Project Profile Preview"
                className="w-24 h-24 object-cover rounded"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Project Banner Image (max 1MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImageChange}
            className="w-full"
          />
          {projectBannerImageUrl && (
            <div className="mt-2">
              <img
                src={projectBannerImageUrl}
                alt="Project Banner Preview"
                className="w-full h-40 object-cover rounded"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>
    </div>
  );
};

export default AddProject;
