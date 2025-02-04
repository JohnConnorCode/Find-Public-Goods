import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
  summary?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { project_id, description } = req.body;
  if (!project_id || !description) {
    return res.status(400).json({ error: 'Missing project_id or description' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'gpt-4',
        prompt: `Summarize this Web3 public goods project:\n\n${description}`,
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const summary = response.data.choices[0].text.trim();
    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
