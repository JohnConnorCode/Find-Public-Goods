import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import FilterDrawer from '../components/FilterDrawer';
import FadeInCard from '../components/FadeInCard';

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
  const [displayCount, setDisplayCount] = useState<number>(6);
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

  // Utility: Shuffle an array randomly.
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
        setDisplayCount(6); // Reset count on filter change.
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

  // FAQ Data
  const faqData = [
    {
      question: 'How does the platform work?',
      answer:
        'We aggregate decentralized public goods projects from multiple sources, generate clear AI-powered summaries, and enable both crypto and fiat donations. Funding goals and milestones are tracked in real time.',
    },
    {
      question: 'How can I donate to a project?',
      answer:
        'Navigate to a project page, select your donation amount, and choose either crypto or fiat. Your donation helps the project reach its funding target and achieve milestones.',
    },
    {
      question: 'Can I submit a project manually?',
      answer:
        'Yes, you can add a project using our "Add Project" page. We also automatically pull projects from trusted sources.',
    },
    {
      question: 'How are project summaries generated?',
      answer:
        'Our AI analyzes detailed project descriptions and generates concise, accessible summaries for each project.',
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div>
      {/* Hero Section */}
      <FadeInCard className="relative h-[600px] flex items-center justify-center overflow-hidden rounded-lg shadow-lg hero-bg">
        {/* Animated Background Layers with geometric overlay */}
        <div className="absolute inset-0 web3-layer1"></div>
        <div className="absolute inset-0 web3-layer2"></div>
        <div className="absolute inset-0 geometric-overlay pointer-events-none">
          <svg className="w-full h-full opacity-20" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="100" fill="white" />
            <rect x="100" y="100" width="80" height="80" fill="white" opacity="0.5" />
            <polygon points="500,100 550,200 450,200" fill="white" opacity="0.5"/>
          </svg>
        </div>
        {/* Semi-transparent overlay for contrast */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Content Overlay */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Fund Public Goods</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We aggregate decentralized public goods projects from multiple sources, generate concise AI-powered summaries, and enable donations through crypto or fiat. Track funding goals and milestones.
          </p>
          <Link legacyBehavior href="/projects">
            <a className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition">
              Explore Projects
            </a>
          </Link>
        </div>
      </FadeInCard>

      {/* How It Works Section */}
      <FadeInCard className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInCard className="p-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aggregate Projects</h3>
              <p className="text-gray-600">
                We gather projects automatically from trusted sources and allow manual submissions.
              </p>
            </FadeInCard>
            <FadeInCard className="p-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-green-500 to-blue-500">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Summaries</h3>
              <p className="text-gray-600">
                Our AI generates clear and concise summaries to help you quickly understand complex projects.
              </p>
            </FadeInCard>
            <FadeInCard className="p-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-red-500 to-orange-500">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Donate & Track</h3>
              <p className="text-gray-600">
                Support projects with crypto or fiat donations while tracking funding goals and milestones in real time.
              </p>
            </FadeInCard>
          </div>
        </div>
      </FadeInCard>

{/* Search & Filter Section */}
<FadeInCard className="py-8 px-4 max-w-4xl mx-auto">
  <div className="flex flex-col gap-4">
    <div className="flex items-center bg-white rounded-lg shadow p-3">
      <svg
        className="h-6 w-6 text-gray-500 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35m2.1-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border-none focus:outline-none"
      />
    </div>
    <div className="bg-white rounded-lg shadow p-4">
      <FilterDrawer filters={filters} onChange={handleFilterChange} />
    </div>
  </div>
</FadeInCard>


      {/* Featured Projects Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <FadeInCard>
          <h2 className="text-4xl font-bold text-center mb-8">Featured Projects</h2>
          </FadeInCard>
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
        </div>
      </section>

      {/* FAQ Section */}
      <FadeInCard className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          {faqData.map((faq, index) => (
            <FadeInCard key={index} className="border-b border-gray-300 py-4">
              <div
                className="flex justify-between items-center cursor-pointer font-medium"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <svg
                  className={`h-6 w-6 transform transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openFaqIndex === index && (
                <div className="mt-2 text-gray-700">
                  <p>{faq.answer}</p>
                </div>
              )}
            </FadeInCard>
          ))}
        </div>
      </FadeInCard>

      <style jsx>{`
        /* Hero section gradient animation and geometric overlay */
        .hero-bg {
          animation: gradientAnim 10s ease infinite;
        }
        @keyframes gradientAnim {
          0% { background: linear-gradient(45deg, #4F46E5, #10B981); }
          50% { background: linear-gradient(45deg, #10B981, #F59E0B); }
          100% { background: linear-gradient(45deg, #4F46E5, #10B981); }
        }
        .geometric-overlay {
          animation: shapeAnim 20s linear infinite;
        }
        @keyframes shapeAnim {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(10px, 10px) scale(1.05); opacity: 0.3; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Home;
