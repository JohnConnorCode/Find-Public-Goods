import React from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  category: string;
  ai_summary: string;
  status: string;
  impact_areas: string[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow hover:shadow-xl transition relative">
      <Link href={`/projects/${project.id}`} className="block">
        <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Category: {project.category}</p>
        <div className="mt-4">
          <p className="text-gray-700 line-clamp-3">{project.ai_summary}</p>
        </div>
        <div className="mt-4">
          <span className={`px-3 py-1 text-xs font-medium rounded ${project.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
            {project.status}
          </span>
        </div>
      </Link>
      {/* Donation button placeholder */}
      <button
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-not-allowed"
        disabled
        title="Donation coming soon!"
      >
        Donate
      </button>
    </div>
  );
};

export default ProjectCard;
