# Attune - Body-Neutral Wellness Tracker

A supportive, body-neutral wellness tracking web app that helps users loosely track food, water, cravings, movement, sleep, and stress with AI-powered supportive insights.

## Features

### Core Tracking
- **Food Logging**: Natural language food descriptions with AI-estimated calories and macros
- **Water Tracking**: Quick-log buttons for common amounts
- **Craving Management**: Log cravings and get supportive alternatives (with option to honor the craving)
- **Movement Logging**: Track any movement with AI-estimated duration and calorie burn
- **Sleep Quality**: Track sleep quality (1-5 scale) with optional hours and notes
- **Stress Levels**: Track stress levels (1-5 scale) with optional context

### Insights & Analytics
- **Daily Snapshot**: AI-generated supportive summary of your day
- **Trend Analysis**: View 7, 30, or 90-day trends with interactive charts
- **Pattern Recognition**: AI identifies correlations between sleep, stress, cravings, and eating patterns
- **Supportive Suggestions**: Body-neutral, non-judgmental recommendations

### Design Principles
- ✅ **Supportive, body-neutral tone**: No moral language ("good/bad", "clean/junk", "cheat")
- ✅ **Non-judgmental**: Always validates effort and progress
- ✅ **Privacy-first**: Local storage, data stays on your device
- ✅ **Fast logging**: Under 5 seconds to log any entry
- ✅ **Mobile-first**: Responsive design for phone and desktop

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **State Management**: React Context
- **Backend**: Supabase (Authentication, Database, Row Level Security)
- **Storage**: PostgreSQL via Supabase (all log types)
- **AI**: Mock AI service (ready for OpenAI/Anthropic integration)

## Authentication

This app uses **Supabase Auth** with multiple sign-in options:
- **Email + Password**: Traditional authentication
- **Magic Link**: Passwordless authentication via email
- **Session Management**: Automatic session persistence across page reloads

All routes except the login screen require authentication.

## Database Structure

The app uses Supabase PostgreSQL with Row Level Security (RLS):
- **water_logs**: Stores water intake with user_id, ounces, and timestamp
- **food_logs**: Stores food logs with nutritional estimates
- **movement_logs**: Stores physical activity logs
- **sleep_logs**: Stores sleep quality tracking
- **stress_logs**: Stores stress level tracking
- **craving_logs**: Stores craving logs with supportive suggestions
- **kv_store_3253d8ee**: Internal key-value store for app data

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for table schemas and setup instructions.

## Demo Features

This is a **fully functional web application** that uses:
- Supabase authentication with email/password and magic links
- PostgreSQL database for ALL log types with RLS policies
- Mock AI responses for food/movement estimation and insights
- Real-time data synchronization across all screens

## Getting Started

1. **Set up the database**: Run the SQL commands in [DATABASE_SETUP.md](./DATABASE_SETUP.md) in your Supabase SQL Editor
2. **Sign up** with any email and password (creates a real Supabase user)
3. **Or sign in with magic link** for passwordless authentication
4. **Start logging** your first entry using the quick action buttons
5. **View insights** on the home screen after logging entries
6. **Explore trends** after a few days of tracking
7. **Adjust settings** to customize your experience

## Tone Examples

The app uses supportive, body-neutral language throughout:
- ✅ "Thanks for logging. Data, not drama."
- ✅ "You're building awareness—that's what matters."
- ✅ "It looks like sleep was challenging. That can affect everything."
- ✅ "If you'd like, try a 5-minute breathing exercise."

❌ Never uses: "good job", "bad choice", "cheat meal", "clean eating"

## Future Integration (Production)

For production, this app is designed to integrate with:
- **Supabase**: For authentication, database, and Row Level Security
- **Supabase Edge Functions**: For secure AI API calls
- **OpenAI or Anthropic**: For real food estimation and insight generation

## Key Screens

1. **Today (Home)**: Quick actions, today's summary, and AI-generated daily snapshot
2. **Log Screens**: Fast, friendly forms for each tracking type
3. **History**: View and manage all past logs, organized by type and date
4. **Trends**: Interactive charts showing patterns over time with AI insights
5. **Settings**: Preferences for dietary needs, tone, and units

## Data Privacy

- All logs stored securely in Supabase PostgreSQL with Row Level Security
- User authentication managed by Supabase Auth with JWT tokens
- Each user can only access their own data (enforced by RLS policies)
- No external API calls for AI features (using mock responses)
- Settings stored in local browser storage
- Sign out to clear your session

---

Built with ❤️ for supportive wellness tracking