// pages/projects/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import DonateModal from '../../components/DonateModal';

export interface Project {
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
  project_profile_image?: string;
  project_banner_image?: string;
  status: string;
  created_at: string;
}

// Predefined Tailwind CSS gradient classes
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

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id, donate } = router.query;
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

  useEffect(() => {
    if (donate === 'true') {
      setDonateOpen(true);
    }
  }, [donate]);

  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;
  if (!project) return <p className="text-center mt-6">Loading project details...</p>;

  // For banner: use the uploaded image if available; otherwise, a div with a random gradient.
  const bannerContent = project.project_banner_image ? (
    <img
      src={project.project_banner_image}
      alt="Project Banner"
      className="w-full h-64 object-cover rounded-lg shadow"
    />
  ) : (
    <div
      className={`w-full h-64 rounded-lg shadow ${getGradientClass(project.id)}`}
    ></div>
  );

  // For profile image: if exists, display it; otherwise, render a circular div with a gradient and the project's initial.
  const profileContent = project.project_profile_image ? (
    <img
      src={project.project_profile_image}
      alt="Project Profile"
      className="w-20 h-20 rounded-full object-cover mr-4 shadow"
    />
  ) : (
    <div
      className={`w-20 h-20 rounded-full mr-4 shadow flex items-center justify-center ${getGradientClass(project.id)}`}
    >
      <span className="text-white text-xl font-bold">
        {project.name.charAt(0)}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Banner Section */}
      <div className="mb-10">{bannerContent}</div>
      {/* Content Container */}
      <div className="bg-white rounded-lg shadow p-10">
        <div className="flex items-center mb-10">
          {profileContent}
          <div>
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <p className="text-sm text-gray-500">Status: {project.status}</p>
          </div>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Project Description</h2>
          <p className="text-gray-700 leading-relaxed">{project.description}</p>
        </div>
        {project.ai_summary && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">AI Summary</h2>
            <p className="text-gray-700 leading-relaxed">{project.ai_summary}</p>
          </div>
        )}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-bold">Category:</span> {project.category}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Impact Areas:</span>{" "}
              {project.impact_areas.join(', ')}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Funding Platform:</span> {project.funding_platform}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Governance Model:</span> {project.governance_model}
            </p>
            {project.website_url && (
              <p className="text-gray-700">
                <span className="font-bold">Website:</span>{" "}
                <a
                  href={project.website_url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.website_url}
                </a>
              </p>
            )}
            {project.contact_email && (
              <p className="text-gray-700">
                <span className="font-bold">Contact:</span> {project.contact_email}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setDonateOpen(true)}
          className="w-full bg-blue-600 text-white py-4 rounded-full shadow-lg hover:bg-blue-700 transition mb-10"
        >
          Donate
        </button>
        <DonateModal
          isOpen={donateOpen}
          onClose={() => setDonateOpen(false)}
          projectId={project.id}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;
