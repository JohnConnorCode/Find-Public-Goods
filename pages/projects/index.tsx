// pages/projects/index.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from '../../components/ProjectCard';
import FilterDrawer from '../../components/FilterDrawer';

export interface Project {
  id: string;
  name: string;
  category: string;
  ai_summary: string;
  status: string;
  impact_areas: string[];
}

interface Filters {
  category?: string;
  funding_platform?: string;
  governance_model?: string;
  status?: string;
}

const ProjectsIndex: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const params: any = {};
        if (searchQuery.trim() !== '') params.query = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.funding_platform) params.funding_platform = filters.funding_platform;
        if (filters.governance_model) params.governance_model = filters.governance_model;
        if (filters.status) params.status = filters.status;
        const { data } = await axios.get('/api/search-projects', { params });
        setProjects(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load projects.');
      }
      setLoading(false);
    };

    fetchProjects();
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Projects</h1>

      {/* Search & Filter Section */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-lg shadow p-3">
          <svg className="h-6 w-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m2.1-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
          </svg>
          <input 
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border-none focus:outline-none"
          />
        </div>
        {/* Filter Drawer */}
        <div className="bg-white rounded-lg shadow p-4">
          <FilterDrawer filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Projects Grid Section */}
      {loading && <p className="text-center">Loading projects...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-center text-gray-600">No projects found.</p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsIndex;
