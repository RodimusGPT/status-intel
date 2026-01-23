# Status Intel

Elite hotel traveler intelligence app - suite upgrade predictions, lounge quality, and recognition insights for Marriott Bonvoy elites.

## Features

- **EVS (Elite Value Score)**: Composite 1-10 score based on upgrade likelihood, lounge quality, breakfast, and service
- **Suite Upgrade Confidence**: Statistical confidence tiers (Very High/High/Likely/Possible/Unlikely) based on real elite traveler reports
- **Elite Intelligence**: Curated insights on upgrade patterns, NUA strategies, and recognition quality
- **Multi-city Coverage**: Shanghai, Hong Kong, Tokyo, Singapore, London, and more

## Tech Stack

- **Frontend**: Expo (React Native) with web support
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Deployment**: Render (static site)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for web
npx expo export --platform web
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Data Collection

Use the AI prompt in `docs/AI_DATA_COLLECTION_PROMPT_V2.md` to collect elite traveler intelligence from FlyerTalk, Reddit, and travel blogs.

## License

Private - All rights reserved
