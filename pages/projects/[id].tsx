import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';
import DonateModal from '../../components/DonateModal';
import Link from 'next/link';

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

interface ProjectDetailProps {
  project: Project | null;
  error?: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, error }) => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [donateOpen, setDonateOpen] = useState<boolean>(false);

  // Fade in banner and then card (faster: 300ms duration, 300ms delay)
  useEffect(() => {
    setBannerVisible(true);
    const timer = setTimeout(() => setCardVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('donate') === 'true') {
      setDonateOpen(true);
    }
  }, []);

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">Error loading project details.</p>
      </div>
    );
  }

  // Helper: check if a URL exists and is non-empty.
  const hasImage = (url?: string) => Boolean(url && url.trim() !== "");

  const bannerContent = hasImage(project.project_banner_image) ? (
    <img
      src={project.project_banner_image!}
      alt="Project Banner"
      className="w-full h-80 object-cover rounded-lg shadow-md"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <div className={`w-full h-80 rounded-lg shadow-md ${getGradientClass(project.id)}`} />
  );

  const profileContent = hasImage(project.project_profile_image) ? (
    <img
      src={project.project_profile_image!}
      alt="Project Profile"
      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow ${getGradientClass(project.id)}`}
    >
      <span className="text-white text-2xl font-bold">{project.name.charAt(0)}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Banner Section */}
      <div className={`transition-opacity duration-300 ${bannerVisible ? 'opacity-100' : 'opacity-0'}`}>
        {bannerContent}
      </div>
      {/* Overlapping Content Card */}
      <div className={`relative z-10 mx-auto -mt-20 transition-opacity duration-300 ${cardVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            {profileContent}
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-500">Status: {project.status}</p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Project Description</h2>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>
          {project.impact_areas && project.impact_areas.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Impact Areas</h2>
              <div className="flex flex-wrap gap-2">
                {project.impact_areas.map((area, index) => (
                  <span key={index} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.ai_summary && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">AI Summary</h2>
              <p className="text-gray-700 leading-relaxed">{project.ai_summary}</p>
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Details</h2>
            <ul className="space-y-2">
              <li className="text-gray-700">
                <span className="font-bold">Category:</span> {project.category}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Funding Platform:</span> {project.funding_platform}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Governance Model:</span> {project.governance_model}
              </li>
              {project.website_url && (
                <li className="text-gray-700">
                  <span className="font-bold">Website:</span>{" "}
                  <a
                    href={project.website_url}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.website_url}
                  </a>
                </li>
              )}
              {project.contact_email && (
                <li className="text-gray-700">
                  <span className="font-bold">Contact:</span> {project.contact_email}
                </li>
              )}
            </ul>
          </div>
          <button
            onClick={() => setDonateOpen(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-full shadow-lg hover:bg-blue-700 transition mb-4"
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
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { props: { project: null, error: error.message } };
  }
  return { props: { project } };
};

export default ProjectDetail;
