// components/ProjectCard.tsx
import React from 'react';
import Link from 'next/link';

export interface Project {
  id: string;
  name: string;
  category: string;
  ai_summary: string | null;
  status: string;
  impact_areas: string[];
  project_profile_image?: string;
  project_banner_image?: string;
}

interface ProjectCardProps {
  project: Project;
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

// Helper to choose a gradient class based on the project ID.
const getGradientClass = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradientClasses.length;
  return gradientClasses[index];
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Use uploaded banner if available; otherwise, use a random gradient.
  const bannerContent = project.project_banner_image ? (
    <img
      src={project.project_banner_image}
      alt="Project Banner"
      className="w-full h-32 object-cover"
    />
  ) : (
    <div className={`w-full h-32 ${getGradientClass(project.id)}`}></div>
  );

  // Use uploaded profile image if available; otherwise, render a circular gradient with the project’s initial.
  const profileContent = project.project_profile_image ? (
    <img
      src={project.project_profile_image}
      alt="Project Profile"
      className="w-16 h-16 rounded-full object-cover border-2 border-white"
    />
  ) : (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-white ${getGradientClass(project.id)}`}
    >
      <span className="text-white text-xl font-bold">{project.name.charAt(0)}</span>
    </div>
  );

  // Fallback for ai_summary.
  const summary = project.ai_summary ? project.ai_summary : '';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden transform hover:-translate-y-1 transition duration-300">
      <Link href={`/projects/${project.id}`}>
        <div>
          {/* Banner Section */}
          {bannerContent}
          {/* Content Section */}
          <div className="p-4 relative">
            {/* Overlapping Profile Image */}
            <div className="absolute -top-8 left-4">
              {profileContent}
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{project.category}</p>
              <p className="text-gray-700 text-sm mb-4">
                {summary.length > 100 ? summary.substring(0, 100) + '...' : summary}
              </p>
              {/* Impact Areas as Tags */}
              <div className="flex flex-wrap">
                {project.impact_areas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                  >
                    {area}
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

export default ProjectCard;
