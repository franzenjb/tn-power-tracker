import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'current_outages.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load outage data' })
  }
}
