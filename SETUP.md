# Line-by-Line Setup Guide

This guide will help you set up Line-by-Line for development or personal use.

## Quick Start (Recommended)

### 1. Clone and Install
```bash
git clone https://github.com/your-username/line-by-line.git
cd line-by-line
yarn install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database (Automated!)
```bash
yarn setup
```

This will:
- Install Supabase CLI if needed
- Initialize the database schema
- Set up all tables, functions, and security policies

### 4. Start Development
```bash
yarn dev
```

Visit `http://localhost:3000` and start journaling! 🎉

## Manual Setup (Alternative)

If the automated setup doesn't work, you can set up the database manually:

### 1. Install Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh

# Windows
# Download from https://supabase.com/docs/guides/cli/getting-started
```

### 2. Initialize Project
```bash
supabase init
```

### 3. Run Migration
```bash
# Copy the migration file
cp supabase/migrations/001_initial_schema.sql supabase/migrations/20240101000000_initial_schema.sql

# Apply the migration
supabase db reset
supabase db push
```

## Available Scripts

- `yarn setup` - Complete automated setup
- `yarn db:setup` - Set up database only
- `yarn db:setup:dry-run` - Preview what would be set up
- `yarn db:verify` - Check if database is properly configured
- `yarn db:reset` - Reset database (destructive!)
- `yarn db:push` - Push schema changes to database

## Troubleshooting

### "Supabase CLI not found"
The setup script will automatically install the CLI for you. If it fails:

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

### "Database connection failed"
1. Check your `.env.local` file has the correct Supabase credentials
2. Make sure your Supabase project is active (not paused)
3. Verify the database was set up: `yarn db:verify`

### "Tables not found"
Run the database setup again:
```bash
yarn db:setup
```

### "Permission denied"
Make sure you're using the correct Supabase credentials:
- Use the **anon key** (not service role key) in your `.env.local`
- The setup script will use the service role key automatically

## Development

### Project Structure
```
line-by-line/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities and Supabase client
│   ├── pages/         # Next.js pages
│   └── types/         # TypeScript types
├── supabase/
│   └── migrations/    # Database migrations
├── scripts/           # Setup and utility scripts
└── public/            # Static assets
```

### Key Files
- `src/lib/supabase-client.ts` - Supabase client configuration
- `src/types/database.ts` - Database type definitions
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `scripts/setup-supabase.ts` - Automated setup script

### Database Schema
- `entries` - Journal entries with content and dates
- `user_settings` - User preferences and streak days
- `question_templates` - Customizable question sets (LLM-ready)
- `streak_analytics` - Pre-calculated streak data

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Set up your development environment: `yarn setup`
4. Make your changes
5. Test your changes: `yarn dev`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add your Supabase environment variables
3. Deploy!

### Other Platforms
1. Set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Build and deploy: `yarn build && yarn start`

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/line-by-line/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/line-by-line/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/line-by-line/wiki)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 