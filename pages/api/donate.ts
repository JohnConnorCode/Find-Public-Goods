// pages/api/donate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { project_id, amount, payment_method } = req.body;
  if (!project_id || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Optionally, try to get the user session (donations can be anonymous too)
  const { data: { session } } = await supabase.auth.getSession();
  const user_id = session?.user?.id || null;

  const { data, error } = await supabase
    .from('donations')
    .insert([{ project_id, user_id, amount, payment_method }])
    .select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
}
