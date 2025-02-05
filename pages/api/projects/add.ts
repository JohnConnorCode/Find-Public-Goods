// pages/api/projects/add.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

type Data = { id?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    description,
    category,
    impact_areas,
    funding_platform,
    governance_model,
    website_url,
    contact_email,
    project_profile_image, // new field
    project_banner_image,  // new field
    submitted_by,
  } = req.body;

  if (!name || !description || !category || !impact_areas || !funding_platform || !governance_model) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          category,
          impact_areas,
          funding_platform,
          governance_model,
          website_url: website_url || null,
          contact_email: contact_email || null,
          project_profile_image: project_profile_image || null,
          project_banner_image: project_banner_image || null,
          submitted_by: submitted_by || null,
        },
      ])
      .select('id')
      .single();

    if (error) throw error;
    return res.status(200).json({ id: data.id });
  } catch (err: any) {
    console.error('Error adding project:', err);
    return res.status(500).json({ error: err.message || 'Failed to add project.' });
  }
}
