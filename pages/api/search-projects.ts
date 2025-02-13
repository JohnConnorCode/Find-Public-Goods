// pages/api/search-projects.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rename the search query parameter so it doesn't conflict with reserved words.
  const { query: searchQuery, category, funding_platform, governance_model, status } = req.query;
  try {
    let queryBuilder = supabase
      .from('projects')
      .select('*');

    // Use a case-insensitive filter on both name and description.
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
      queryBuilder = queryBuilder.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (category && typeof category === 'string') {
      queryBuilder = queryBuilder.eq('category', category);
    }
    if (funding_platform && typeof funding_platform === 'string') {
      queryBuilder = queryBuilder.eq('funding_platform', funding_platform);
    }
    if (governance_model && typeof governance_model === 'string') {
      queryBuilder = queryBuilder.eq('governance_model', governance_model);
    }
    if (status && typeof status === 'string') {
      queryBuilder = queryBuilder.eq('status', status);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
