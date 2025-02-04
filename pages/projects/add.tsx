import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const AddProject: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impactAreas, setImpactAreas] = useState('');
  const [fundingPlatform, setFundingPlatform] = useState('');
  const [governanceModel, setGovernanceModel] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        category,
        impact_areas: impactAreas.split(',').map((s) => s.trim()),
        funding_platform: fundingPlatform,
        governance_model: governanceModel,
        website_url: websiteUrl,
        contact_email: contactEmail,
        // If logged in, include user ID; if not, leave null.
        submitted_by: supabase.auth.session()?.user?.id || null
      };

      const { data, error } = await axios.post('/api/projects/add', payload);
      if (error) {
        setError('Failed to add project.');
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Project Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg" rows={5} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg">
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
            <select required value={fundingPlatform} onChange={(e) => setFundingPlatform(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Select...</option>
              <option value="Gitcoin">Gitcoin</option>
              <option value="Optimism RPGF">Optimism RPGF</option>
              <option value="Ethereum Foundation">Ethereum Foundation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Governance Model</label>
            <select required value={governanceModel} onChange={(e) => setGovernanceModel(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Select...</option>
              <option value="DAO">DAO</option>
              <option value="Quadratic Funding">Quadratic Funding</option>
              <option value="Hybrid">Hybrid</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Impact Areas (comma-separated)</label>
            <input type="text" required value={impactAreas} onChange={(e) => setImpactAreas(e.target.value)} className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Website URL</label>
          <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        <div>
          <label className="block font-medium mb-1">Contact Email</label>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-3 border rounded-lg" />
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
