import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import DonateModal from '../../components/DonateModal';

interface Project {
  id: string;
  name: string;
  description: string;
  ai_summary: string;
  category: string;
  impact_areas: string[];
  funding_platform: string;
  governance_model: string;
  website_url: string;
  contact_email: string;
  status: string;
  created_at: string;
}

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');
  const [donateOpen, setDonateOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProject(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load project details.');
      }
    };
    fetchProject();
  }, [id]);

  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;
  if (!project) return <p className="text-center mt-6">Loading project details...</p>;

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Status: {project.status}</p>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Project Description</h2>
        <p className="text-gray-700">{project.description}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">AI Summary</h2>
        <p className="text-gray-700">{project.ai_summary}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Details</h2>
        <p className="text-gray-700"><span className="font-bold">Category:</span> {project.category}</p>
        <p className="text-gray-700"><span className="font-bold">Impact Areas:</span> {project.impact_areas.join(', ')}</p>
        <p className="text-gray-700"><span className="font-bold">Funding Platform:</span> {project.funding_platform}</p>
        <p className="text-gray-700"><span className="font-bold">Governance Model:</span> {project.governance_model}</p>
        {project.website_url && (
          <p className="text-gray-700">
            <span className="font-bold">Website:</span> <a href={project.website_url} className="text-blue-600 hover:underline">{project.website_url}</a>
          </p>
        )}
        {project.contact_email && (
          <p className="text-gray-700"><span className="font-bold">Contact:</span> {project.contact_email}</p>
        )}
      </div>
      <button
        onClick={() => setDonateOpen(true)}
        className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Donate
      </button>
      <DonateModal isOpen={donateOpen} onClose={() => setDonateOpen(false)} />
    </div>
  );
};

export default ProjectDetail;
