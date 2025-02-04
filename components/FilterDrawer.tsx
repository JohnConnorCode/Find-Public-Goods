import React from 'react';

interface FilterDrawerProps {
  filters: {
    category?: string;
    funding_platform?: string;
    governance_model?: string;
    status?: string;
  };
  onChange: (newFilters: Partial<FilterDrawerProps['filters']>) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ filters, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col">
        <label className="font-medium mb-1">Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => onChange({ category: e.target.value || undefined })}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="Climate">Climate</option>
          <option value="Education">Education</option>
          <option value="DeFi">DeFi</option>
          <option value="Social Impact">Social Impact</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="font-medium mb-1">Funding Platform</label>
        <select
          value={filters.funding_platform || ''}
          onChange={(e) => onChange({ funding_platform: e.target.value || undefined })}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="Gitcoin">Gitcoin</option>
          <option value="Optimism RPGF">Optimism RPGF</option>
          <option value="Ethereum Foundation">Ethereum Foundation</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="font-medium mb-1">Governance Model</label>
        <select
          value={filters.governance_model || ''}
          onChange={(e) => onChange({ governance_model: e.target.value || undefined })}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="DAO">DAO</option>
          <option value="Quadratic Funding">Quadratic Funding</option>
          <option value="Hybrid">Hybrid</option>
          <option value="None">None</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="font-medium mb-1">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ status: e.target.value || undefined })}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Needs Support">Needs Support</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </div>
  );
};

export default FilterDrawer;
