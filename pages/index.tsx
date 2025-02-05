// pages/index.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import FilterDrawer from '../components/FilterDrawer';

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

const Home: React.FC = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Utility: shuffle an array randomly
  const shuffleArray = (array: Project[]) => {
    return array
      .map((p) => ({ sort: Math.random(), value: p }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        // Send query parameters if search or filter is active
        const params: any = {};
        if (searchQuery.trim() !== '') params.query = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.funding_platform) params.funding_platform = filters.funding_platform;
        if (filters.governance_model) params.governance_model = filters.governance_model;
        if (filters.status) params.status = filters.status;

        const { data } = await axios.get('/api/search-projects', { params });
        setAllProjects(data);

        // If no search/filter is active, randomize and choose 9 projects.
        if (!searchQuery && Object.keys(filters).length === 0) {
          const shuffled = shuffleArray(data);
          setDisplayProjects(shuffled.slice(0, 9));
        } else {
          // Otherwise, show all matching projects (or a subset if you wish)
          setDisplayProjects(data);
        }
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
    <div>
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <h1 className="text-5xl font-extrabold mb-4">Discover Web3 Public Goods</h1>
        <p className="mb-6 text-xl max-w-2xl mx-auto">
          Explore, understand, and support impactful projects with AI-powered insights.
        </p>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-8">
          <FilterDrawer filters={filters} onChange={handleFilterChange} />
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="py-8 px-4">
        {loading && <p className="text-center">Loading projects...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && displayProjects.length === 0 && (
          <p className="text-center">Sorry, no projects found.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
