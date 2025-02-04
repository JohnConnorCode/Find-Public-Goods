import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterDrawer from '../../components/FilterDrawer';
import ProjectCard from '../../components/ProjectCard';
import Link from 'next/link';

interface Project {
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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/search-projects', {
        params: { query: searchQuery, ...filters }
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load projects.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Projects</h1>
        <Link href="/projects/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add Project
        </Link>
      </div>
      <div className="mb-6 max-w-xl">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <FilterDrawer filters={filters} onChange={handleFilterChange} />
      </div>
      {loading && <p className="text-center">Loading projects...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {projects.length === 0 && !loading ? (
        <p className="text-center">No projects found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
