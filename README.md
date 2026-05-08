# Voice Agent App - Frontend

A modern React-based frontend application for managing and interacting with AI voice agents powered by ElevenLabs.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd voice_agent_app/frontend

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## 📦 Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run build:widget` - Build the embeddable widget
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm start` - Serve production build (requires `dist` folder)
- `npm run blog:generate` - Optional: regenerate `src/generated/blogPosts.json` from Markdown under `content/blog/` (useful for one-off imports or legacy tooling)
- `npm run sitemap:generate` - Regenerate `public/sitemap.xml` (runs automatically before `dev` / `build` via `predev` / `prebuild`)

## 🛠️ Technology Stack

### Core Technologies
- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing

### UI & Styling
- **shadcn-ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Additional Libraries
- **@elevenlabs/client** - ElevenLabs API client
- **@stripe/react-stripe-js** - Stripe payment integration
- **react-player** - Media player component
- **date-fns** - Date utility library
- **recharts** - Chart library for analytics
- **sonner** - Toast notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── assistants/    # Agent/assistant related components
│   │   ├── ui/            # shadcn-ui components
│   │   └── ...
│   ├── pages/             # Page components (routes)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and API client
│   ├── types/             # TypeScript type definitions
│   ├── contexts/          # React context providers
│   └── App.tsx            # Main application component
├── public/                # Static assets
├── dist/                  # Production build output
├── vite.config.ts         # Vite configuration
├── vite.widget.config.ts  # Widget-specific build config
└── tailwind.config.ts     # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/voiceable-api
# Use the hyphenated path `voiceable-api` (not `voiceable_api` — that is only the Ruby folder name).
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# Canonical marketing URL for SEO (meta tags, JSON-LD, sitemap). Defaults to https://www.voiceable.dev
# VITE_SITE_URL=https://www.voiceable.dev
#
# Optional: base URL for fetching published posts when generating the sitemap (defaults to VITE_API_BASE_URL).
# Set in CI/build if the API is reachable during `npm run build`.
# SITEMAP_BLOG_API_URL=https://api.example.com/voiceable-api
```

### Blog (CMS)

Public `/blog` pages load published posts from the Rails API (`GET /voiceable-api/blog_posts` and `GET /voiceable-api/blog_posts/:slug`) using **`VITE_API_BASE_URL`** (or same-origin `/voiceable-api` in production). No auth header is sent for those requests.

Admins manage posts in the dashboard under **Blog posts** (`/admin/blog-posts`).

**Sitemap:** `npm run sitemap:generate` lists static routes plus `/blog/:slug` for each published post when **`SITEMAP_BLOG_API_URL`** or **`VITE_API_BASE_URL`** is set and the blog index responds successfully. If neither is set or the API is unreachable, individual post URLs are omitted from the sitemap (the `/blog` route is still included); you can fall back to Markdown output by running **`npm run blog:generate`** first so `src/generated/blogPosts.json` exists, which the sitemap script will use when the API returns no posts.

### API Configuration

The frontend communicates with the Rails backend API. Ensure the backend is running and the `VITE_API_BASE_URL` is correctly set.

## 🎨 Development

### Code Style

- ESLint is configured for code quality
- TypeScript strict mode is enabled
- Follow React best practices and hooks rules

### User Interface Features

- **Tabbed Interface**: Agent detail page uses tabs for different configuration areas:
  - **Configuration**: Basic agent settings, voice selection
  - **Prompt Logic**: Agent behaviour sections (scenarios, phases, voice tone) - behaviour template is immutable after creation
  - **Tools**: System tools, webhook tools, client tools, and integrations
  - **Outcomes**: Outcome criteria and escalation rules
  - **Advanced**: Advanced agent settings
  - **Widget**: Widget configuration and embedding
  - **Conversations**: View agent conversations
  - **Phone Numbers**: Manage phone number assignments

### Component Development

- Use functional components with hooks
- Leverage shadcn-ui components for consistent UI
- Follow the existing component structure and patterns

### Agent Creation Workflow

- **Agent Wizard**: Multi-step wizard for creating new agents
  - Step 1: Name and basic information
  - Step 2: Model selection and configuration
  - Step 3: Agent Behaviour (scenarios, phases, voice tone) with behaviour template selection
  - Step 4: Voice selection
  - Step 5: Transcriber settings
  - Step 6: Phone number assignment
- **Behaviour Template**: Selected during creation in the wizard and cannot be changed afterward
- **Agent Configuration**: Once created, agents can be configured through the detail page with various tabs (Configuration, Prompt Logic, Tools, Outcomes, etc.)

### API Integration

API calls are centralized in `src/lib/api.ts`. The application uses:
- TanStack Query for data fetching and caching
- JWT tokens for authentication (stored in localStorage)
- Automatic token refresh and error handling

## 🏗️ Building for Production

```bash
# Build the main application
npm run build

# Build the widget
npm run build:widget

# Preview the production build
npm run preview
```

The production build will be output to the `dist/` directory.

## 📱 Widget Integration

The application includes an embeddable widget that can be integrated into external websites. Build the widget with:

```bash
npm run build:widget
```

The widget can be embedded using the generated JavaScript file.

## 🧪 Testing

Run linting to check code quality:

```bash
npm run lint
```

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [API Reference](../docs/api-reference/introduction.mdx)
- [ElevenLabs Client Documentation](../elevenlabs_client/README.md)

## 🚢 Deployment

### Using Lovable

If using Lovable platform:
1. Open your [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)
2. Click on **Share → Publish**

### Custom Domain

To connect a custom domain:
1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain#custom-domain)

### Manual Deployment

1. Build the application: `npm run build`
2. Deploy the `dist/` directory to your hosting provider
3. Configure your server to serve `index.html` for all routes (SPA routing)

### Performance Optimization & Cache Configuration

The application includes several performance optimizations:

- **Google Fonts**: Loaded with `display=swap` and deferred loading to prevent render-blocking
- **Resource Hints**: Preconnect and DNS-prefetch for third-party domains
- **LCP Optimization**: Logo image preloaded with `fetchPriority="high"`
- **Deferred Third-Party Scripts**: Microsoft Clarity loads after initial render to reduce forced reflows

**Important: Cache Headers Configuration**

To achieve optimal performance, configure your server/CDN to set appropriate cache headers:

```nginx
# Example Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML files should not be cached
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

**Recommended Cache TTL:**
- Static assets (JS, CSS, images): 1 year with `immutable` flag
- HTML files: No cache or very short TTL (5 minutes)
- Font files: 1 year

This configuration can save up to **845 KiB** on repeat visits and significantly improve performance scores.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes locally
5. Submit a pull request

## 📝 License

See the main project LICENSE file for details.
