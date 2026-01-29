# Tennessee Power Outage Tracker

**A Red Cross Community Service Project**

Real-time power outage tracking for all 95 Tennessee counties with data from every electric utility in the state.

## Why We Built This

PowerOutage.us aggregates data but often misses utilities and provides incomplete coverage. For emergency response, we need:
- ✅ Complete coverage of ALL utilities
- ✅ Accurate customer counts by county
- ✅ Historical trend tracking
- ✅ Improvement metrics for restoration efforts
- ✅ Red Cross response integration

## Features

- **Complete Coverage**: Scrapes all 23 electric cooperatives + major utilities
- **Real-Time Updates**: Refreshes every 15 minutes
- **Interactive Map**: Leaflet-based visualization with custom popups
- **Improvement Tracking**: Shows restoration progress over time
- **Mobile Responsive**: Works on phones, tablets, and desktops
- **Open Source**: Community-driven and transparent

## Data Sources

### Major Utilities
- Nashville Electric Service (NES)
- Memphis Light, Gas and Water (MLGW)
- EPB Chattanooga
- Knoxville Utilities Board (KUB)

### Electric Cooperatives (23)
All Tennessee Electric Cooperative Association members including:
- Middle Tennessee Electric
- Volunteer Energy Cooperative
- Meriwether Lewis Electric
- Cumberland Electric
- Duck River Electric
- Caney Fork Electric
- [See full list in docs/utilities.md]

## Technology Stack

**Frontend:**
- Next.js 14
- React 18
- Leaflet.js for maps
- Tailwind CSS (Red Cross brand colors)

**Backend:**
- Python scrapers (Beautiful Soup, Selenium)
- Node.js aggregation API
- Vercel serverless functions
- PostgreSQL for historical data

**Deployment:**
- Vercel (frontend + API)
- GitHub Actions (scraper automation)
- Vercel Cron Jobs (15-min updates)

## Project Structure

```
tn-power-tracker/
├── frontend/          # Next.js app
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   └── public/        # Static assets
├── scrapers/          # Python utility scrapers
│   ├── nes.py
│   ├── mlgw.py
│   ├── epb.py
│   └── cooperatives/
├── api/               # Vercel serverless functions
├── data/              # Output data (JSON/GeoJSON)
└── docs/              # Documentation
```

## Quick Start

```bash
# Clone repository
git clone https://github.com/american-red-cross/tn-power-tracker.git
cd tn-power-tracker

# Install dependencies
npm install
pip install -r requirements.txt

# Run scrapers
python scrapers/run_all.py

# Start development server
npm run dev
```

## Deployment

Automatically deploys to Vercel on push to `main`:
- Production: https://tn-power.redcross.org (custom domain)
- Preview: https://tn-power-tracker.vercel.app

## Contributing

This is a Red Cross community service project. Contributions welcome!

1. Fork the repository
2. Create your feature branch
3. Add your utility scraper or feature
4. Submit a pull request

## License

MIT License - see LICENSE file

## Credits

**Developed by:**
American Red Cross - Data & GIS Team

**Powered by:**
- Tennessee Electric Cooperative Association
- Individual utility companies
- Open source community

## Contact

For questions or partnership inquiries:
- Email: gis@redcross.org
- GitHub Issues: https://github.com/american-red-cross/tn-power-tracker/issues

---

*This is an independent community service project and is not affiliated with PowerOutage.us*
