# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.14+
- npm

### Setup

```bash
# Clone repository
git clone https://github.com/franzenjb/tn-power-tracker.git
cd tn-power-tracker

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate  # or `venv/bin/activate` on Windows
pip install -r requirements.txt

# Install Node dependencies
cd frontend
npm install --legacy-peer-deps

# Run scrapers (generates test data)
cd ..
./venv/bin/python scrapers/run_all.py

# Start development server
cd frontend
npm run dev
```

Visit http://localhost:3000

## Production Deployment (Vercel)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/franzenjb/tn-power-tracker)

### Manual Setup

1. **Connect GitHub Repository**
   ```bash
   # Push to GitHub (already done)
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import `franzenjb/tn-power-tracker`
   - Set root directory to `frontend`
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Install command: `npm install --legacy-peer-deps`

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   ```

4. **Enable Vercel Cron**
   - Vercel will automatically detect `vercel.json` cron config
   - Scraper will run every 15 minutes via `/api/scrape/scheduled`

5. **Set Custom Domain** (Optional)
   - Add domain in Vercel project settings
   - Configure DNS:
     - Type: CNAME
     - Name: tn-power (or @)
     - Value: cname.vercel-dns.com

## Scraper Automation

### Option A: Vercel Cron (Recommended)

Already configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/scrape/scheduled",
    "schedule": "*/15 * * * *"
  }]
}
```

### Option B: GitHub Actions

Create `.github/workflows/scrape.yml`:
```yaml
name: Scrape Outage Data
on:
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.14'
      - run: pip install -r requirements.txt
      - run: python scrapers/run_all.py
      - name: Commit data
        run: |
          git config user.name "Outage Bot"
          git add data/
          git commit -m "Update outage data"
          git push
```

### Option C: Render.com Background Worker

1. Create `render.yaml`:
```yaml
services:
  - type: worker
    name: tn-scraper
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python scrapers/run_all.py
```

2. Set up cron job in Render dashboard

## Monitoring

### Health Checks

Monitor these endpoints:
- https://tn-power-tracker.vercel.app/api/outages/current
- https://tn-power-tracker.vercel.app/data/current_outages.json

### Logs

**Vercel Logs:**
```bash
vercel logs --follow
```

**Scraper Logs:**
Check `data/history/` for timestamped snapshots

### Alerts

Set up alerts for:
- API endpoint failures
- Scraper errors
- Stale data (>20 minutes old)

## Scaling Considerations

**Current Architecture:**
- Frontend: Vercel Edge Network (global CDN)
- API: Vercel Serverless Functions
- Data: File-based JSON (works for MVP)

**Future Optimizations:**
- Move to Vercel Blob Storage for data
- Add PostgreSQL for historical trends
- Implement Redis caching
- Use Vercel Edge Config for real-time updates

## Troubleshooting

### Dev Server Won't Start
```bash
cd frontend
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run dev
```

### Scrapers Failing
```bash
# Check Python environment
./venv/bin/python --version

# Test individual scraper
./venv/bin/python scrapers/nes_scraper.py
```

### Build Errors on Vercel
- Ensure `vercel.json` points to correct directories
- Check build logs in Vercel dashboard
- Verify Node.js version (18+)

## Performance

**Current Metrics:**
- Page Load: ~2s (with map tiles)
- Data Fetch: <100ms
- Scraper Runtime: ~30s for 4 utilities

**Optimization Targets:**
- Page Load: <1s
- Data Fetch: <50ms
- Full Scraper (27 utilities): <2 minutes

## Security

**Data Storage:**
- All data is public (no authentication needed)
- Rate limiting handled by Vercel
- HTTPS enforced

**Scraper Safety:**
- Respects robots.txt
- Rate limited with retry logic
- User-Agent identifies as Red Cross bot

## Cost Estimate

**Free Tier (Vercel):**
- ✅ Unlimited bandwidth
- ✅ 100GB-hours compute
- ✅ Hobby projects free forever

**Estimated Monthly Cost:** $0

(Stays within free tier limits)

## Support

Issues: https://github.com/franzenjb/tn-power-tracker/issues
