# My Portfolio (with CRUD and Auth)

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)

A modern, secure, server-first portfolio website with full authentication and admin capabilities. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Full Authentication System** - Secure email/password authentication via Supabase
- **Protected Admin Routes** - Server-side authentication checks on all admin pages
- **Row Level Security** - Database-level security policies for data protection
- **Server-First Architecture** - Built with Next.js 15 App Router and Server Components
- **Complete CRUD Operations** - Create, Read, Update, and Delete projects via Server Actions
- **Session Management** - Secure cookie-based sessions with automatic refresh
- **Modern UI** - Clean, responsive design with Tailwind CSS 4
- **Dark Mode Support** - Automatic dark mode based on system preferences
- **SEO Friendly** - Server-side rendering for better search engine optimization
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **Type-Safe** - Built with TypeScript for enhanced developer experience
- **Tag System** - Organize projects with custom tags
- **Visibility Control** - Hide/show projects from public view
- **Image Support** - Add cover images to projects

## Table of Contents

- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Authentication Setup](#authentication-setup)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [User Management](#user-management)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Demo

**Public Portfolio View**: Browse all published projects (no authentication required)  
**Admin Interface**: Secure login required to manage projects with full CRUD capabilities  
**Authentication**: Email/password authentication with Supabase

## Tech Stack

**Frontend:**

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework

**Backend & Authentication:**

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Server-side mutations
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Authentication and user management
- [Supabase Database](https://supabase.com/) - PostgreSQL database with Row Level Security
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) - Server-side rendering support

**Development:**

- [ESLint](https://eslint.org/) - Code linting
- [PostCSS](https://postcss.org/) - CSS processing

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- A Supabase account (free tier available)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/docentDavid/my-portfolio-auth.git
cd my-portfolio-auth
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up Supabase Database**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. In the SQL Editor, run the following schema:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  tags TEXT[],
  cover_url TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can view non-hidden projects
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT
  USING (is_hidden = false);

-- Authenticated users can see all projects
CREATE POLICY "Authenticated can view all projects" ON projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can create projects
CREATE POLICY "Authenticated can create projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update projects
CREATE POLICY "Authenticated can update projects" ON projects
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete projects
CREATE POLICY "Authenticated can delete projects" ON projects
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **Settings → API**.

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Setup

### Creating Your Admin Account

1. **Enable Email Authentication in Supabase**

   - Go to your Supabase project
   - Navigate to **Authentication → Providers**
   - Ensure "Email" is enabled
   - Optional: Disable "Confirm email" for faster testing (enable in production)

2. **Create Your First Admin Account**

   - Navigate to `http://localhost:3000/signup`
   - Enter your email and password (minimum 6 characters)
   - Check your email for confirmation link (if email confirmation is enabled)
   - Confirm your email
   - Go to `http://localhost:3000/login` and sign in

3. **Access Admin Panel**
   - Once logged in, you'll be redirected to `/admin`
   - You can now create, edit, delete, and manage projects
   - Click "Logout" in the top-right corner to sign out

### How Authentication Works

**Protected Routes:**

- All `/admin` routes require authentication
- Unauthenticated users are automatically redirected to `/login`
- After login, users are redirected to `/admin`

**Server-Side Security:**

- Authentication checks happen on the server
- All CRUD operations validate user session
- Row Level Security policies enforce database-level protection

**Session Management:**

- Sessions are stored in secure HTTP-only cookies
- Automatic token refresh on page navigation
- Logout clears all session data

## Project Structure

```
my-portfolio-auth/
├── app/
│   ├── actions/
│   │   ├── auth.ts              # Authentication Server Actions
│   │   └── projects.ts          # CRUD Server Actions (auth-protected)
│   ├── admin/
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx # Edit project page
│   │   │   └── new/
│   │   │       └── page.tsx     # Create project page
│   │   ├── DeleteButton.tsx     # Client component for delete confirmation
│   │   ├── layout.tsx           # Protected admin layout with logout
│   │   └── page.tsx             # Admin dashboard
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Signup page
│   ├── project/
│   │   └── [slug]/
│   │       └── page.tsx         # Individual project page
│   ├── test/
│   │   └── page.tsx             # Database connection test page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Public homepage
├── lib/
│   ├── supabase/
│   │   ├── auth.ts              # Auth helper functions
│   │   ├── client.ts            # Supabase client for browser
│   │   └── server.ts            # Supabase client for server
│   └── types.ts                 # TypeScript type definitions
├── public/                      # Static assets
├── .env.local                   # Environment variables (not committed)
├── .gitignore
├── eslint.config.mjs
├── LICENSE
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## Database Schema

### Projects Table

| Column     | Type        | Description                      | RLS Policy         |
| ---------- | ----------- | -------------------------------- | ------------------ |
| id         | UUID        | Primary key                      | -                  |
| slug       | TEXT        | URL-friendly identifier (unique) | -                  |
| title      | TEXT        | Project title                    | -                  |
| summary    | TEXT        | Short description                | -                  |
| content    | TEXT        | Full project description         | -                  |
| tags       | TEXT[]      | Array of tags                    | -                  |
| cover_url  | TEXT        | URL to cover image               | -                  |
| is_hidden  | BOOLEAN     | Visibility flag                  | Public: false only |
| created_at | TIMESTAMPTZ | Creation timestamp               | -                  |
| updated_at | TIMESTAMPTZ | Last update timestamp            | -                  |

### Auth Users Table

Managed automatically by Supabase Auth (`auth.users`):

- Email addresses
- Encrypted passwords
- User metadata
- Session tokens

## Security

### Row Level Security (RLS)

All database tables have Row Level Security enabled with the following policies:

**Public Access:**

- Can view projects where `is_hidden = false`
- Cannot create, update, or delete any data

**Authenticated Users:**

- Can view all projects (including hidden ones)
- Can create new projects
- Can update existing projects
- Can delete projects

### Server-Side Protection

**All mutation operations include authentication checks:**

```typescript
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
if (error || !user) {
  throw new Error("Unauthorized");
}
```

**Protected routes use the `requireAuth()` helper:**

```typescript
export default async function AdminLayout({ children }) {
  await requireAuth(); // Redirects to /login if not authenticated
  // ...
}
```

### Best Practices Implemented

- No client-side authentication checks for security-critical operations
- HTTP-only cookies for session storage
- Automatic CSRF protection via Supabase
- Server Components for sensitive data fetching
- Environment variables never exposed to client
- Type-safe database queries with TypeScript

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important Notes:**

- Never commit `.env.local` to version control
- `NEXT_PUBLIC_*` variables are exposed to the browser
- The anon key is safe to expose (RLS protects your data)
- Service role key should NEVER be exposed to the client

## Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Build
npm run build        # Build for production with Turbopack

# Production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Deployment

### Deploying to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**

   In Vercel Project Settings → Environment Variables, add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**

   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

5. **Configure Supabase Auth URLs**

   In your Supabase project:

   - Go to **Authentication → URL Configuration**
   - Add your Vercel URL to "Site URL"
   - Add your Vercel URL to "Redirect URLs"

### Other Platforms

This application can be deployed to any platform supporting Next.js 15:

- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [DigitalOcean](https://www.digitalocean.com/)
- Self-hosted with Docker

## User Management

### Managing Users in Supabase

1. **View All Users**

   - Go to your Supabase project
   - Navigate to **Authentication → Users**
   - See all registered users with email addresses and registration dates

2. **Manual Operations**

   - Delete users
   - Reset passwords via email
   - Manually confirm emails
   - Block/unblock users

3. **Email Templates**
   - Navigate to **Authentication → Email Templates**
   - Customize confirmation emails
   - Customize password reset emails
   - Customize invitation emails

### Removing Signup After Initial Setup

For a personal portfolio, you may want only one admin account:

1. Create your admin account via `/signup`
2. Delete the `/app/signup` folder entirely
3. All future access goes through `/login` only

Alternatively, keep the signup page but restrict access via environment checks or by removing the link from the login page.

## Troubleshooting

### Common Issues

**"Unauthorized" errors when trying to create/edit projects:**

- Ensure you're logged in at `/login`
- Check that your session hasn't expired (sessions last 1 hour by default)
- Try logging out and back in
- Check browser console for specific error messages

**Email confirmation not working:**

- Check Supabase email settings under **Authentication → Providers**
- For development, consider disabling email confirmation temporarily
- Check spam folder for confirmation emails
- Verify your email provider isn't blocking Supabase emails

**Can't access admin routes:**

- Verify you're logged in at `/login`
- Check browser console for JavaScript errors
- Ensure environment variables are set correctly in `.env.local`
- Try clearing browser cookies and logging in again

**Database connection issues:**

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check your Supabase project is active (not paused)
- Visit `/test` page to debug database connection

**Projects not displaying:**

- Check if projects are marked as `is_hidden = true`
- Verify RLS policies are set up correctly
- Check browser console for errors
- Visit `/test` page to see raw database data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 David Schol

## Author

**David Schol (docentDavid)**

- GitHub: [@docentDavid](https://github.com/docentDavid)

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel](https://vercel.com) for hosting

## Support

If you have any questions or run into issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing [Issues](https://github.com/docentDavid/my-portfolio-auth/issues)
3. Create a new issue with detailed information
4. Check documentation for [Next.js](https://nextjs.org/docs), [Supabase](https://supabase.com/docs), and [Tailwind CSS](https://tailwindcss.com/docs)

---

Made with ❤️ by David Schol
