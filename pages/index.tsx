// pages/index.tsx
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
  const [displayCount, setDisplayCount] = useState<number>(9);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Header fade-in effect using Intersection Observer.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeaderVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
    };
  }, []);

  // Utility: Shuffle array randomly.
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
        // Build query parameters.
        const params: any = {};
        if (searchQuery.trim() !== '') params.query = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.funding_platform) params.funding_platform = filters.funding_platform;
        if (filters.governance_model) params.governance_model = filters.governance_model;
        if (filters.status) params.status = filters.status;

        const { data } = await axios.get('/api/search-projects', { params });
        let projects = data;
        if (!searchQuery && Object.keys(filters).length === 0) {
          projects = shuffleArray(data);
        }
        setAllProjects(projects);
        setDisplayCount(9); // Reset count on filter change.
      } catch (err: any) {
        console.error(err);
        setError('Failed to load projects.');
      }
      setLoading(false);
    };

    fetchProjects();
  }, [searchQuery, filters]);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        ref={headerRef}
        className={`hero-bg relative h-[600px] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Animated Background Layers */}
        <div className="absolute inset-0 web3-layer1"></div>
        <div className="absolute inset-0 web3-layer2"></div>
        {/* Semi-transparent overlay for text contrast */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Content Overlay */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Empowering the Future of Web3 <br></br>Public Goods
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Explore groundbreaking projects transforming decentralized funding, transparent governance, and community impact.
            Join us on the journey to reshape tomorrow.
          </p>
          <Link legacyBehavior href="/projects">
            <a className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition">
              Explore Projects
            </a>
          </Link>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
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
      </section>

      {/* Projects Grid Section */}
      <section className="py-8 px-4">
        {loading && <p className="text-center">Loading projects...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && allProjects.length === 0 && (
          <p className="text-center">Sorry, no projects found.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.slice(0, displayCount).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {allProjects.length > displayCount && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
