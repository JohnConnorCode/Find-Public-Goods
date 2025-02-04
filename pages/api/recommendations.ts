import type { NextApiRequest, NextApiResponse } from 'next';

type Recommendation = {
  project_id: string;
  name: string;
  match_score: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Recommendation[] | { error: string }>
) {
  const { user_id } = req.query;
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' });
  }

  const recommendations: Recommendation[] = [
    { project_id: 'abc123', name: 'SolarDAO', match_score: 0.87 },
    { project_id: 'xyz789', name: 'Open Education Grants', match_score: 0.72 }
  ];

  res.status(200).json(recommendations);
}
