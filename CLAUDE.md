# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered video generation application built as a hybrid web and desktop app using:
- **Frontend**: React 18 with TypeScript, Vite, TanStack Query, React Hook Form
- **Desktop**: Tauri v2 (Rust backend with React frontend)
- **UI**: Tailwind CSS with shadcn/ui component library (New York style)
- **Package Manager**: Bun (not npm or yarn)

## Key Commands

```bash
# Development
bun dev              # Start Vite dev server on port 3030
bun tauri-dev        # Run Tauri desktop app in development mode

# Build
bun build            # TypeScript check + Vite production build
bun tauri-build      # Build Tauri desktop app for macOS ARM64

# Code Quality
bun lint             # Run ESLint

# Preview
bun preview          # Preview production build
```

## Architecture

### Core Application Structure
```
src/
├── api.ts              # Axios API client configuration
├── components/         
│   ├── ui/             # shadcn/ui base components
│   ├── video-generator/ # Main video generation feature
│   └── theme/          # Theme provider and switcher
├── screens/            # Route-based page components
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── queries/            # TanStack Query hooks
└── apis/               # API endpoint implementations
```

### Desktop App (Tauri)
- Located in `src-tauri/` directory
- Uses sidecar processes for background operations
- Provides native file system access and dialog APIs
- Target platform: `aarch64-apple-darwin` (macOS ARM64)

### Key Technologies & Patterns

1. **State Management**: TanStack Query for server state, React Hook Form for forms
2. **Validation**: Zod schemas with React Hook Form resolver
3. **Routing**: React Router v7 with lazy-loaded routes
4. **API Communication**: Axios with centralized configuration in `src/api.ts`
5. **Environment Variables**: API_BASE_URL configured in `src/api.ts`

### Video Generation Feature

The main feature (`src/components/video-generator/`) includes:
- Multiple TTS model support (Edge, OpenAI, Google, VixTTS)
- Image generation via Google/OpenAI APIs
- Voice selection with Vietnamese and English options
- Background music integration
- Caption styling and positioning
- Generation history tracking
- Real-time progress updates

### Component Development

When creating new components:
1. Use existing shadcn/ui components from `src/components/ui/`
2. Follow the existing pattern of TypeScript interfaces for props
3. Use Tailwind CSS classes for styling (no CSS modules)
4. Place feature components in appropriate subdirectories

### API Integration

- Base URL configuration in `src/api.ts`
- Use the existing `api` axios instance for consistency
- API endpoints are organized in `src/apis/` directory
- Authentication handled via better-auth library

### Form Handling

- Use React Hook Form with Zod validation
- Form schemas defined alongside components
- Follow existing patterns in `src/components/video-generator/`

## Important Notes

- **Package Manager**: Always use `bun` instead of npm/yarn
- **Port**: Development server runs on port 3030 (not default 5173)
- **Desktop Builds**: Use `bun tauri-build` for macOS ARM64 builds
- **Component Library**: shadcn/ui components are in `src/components/ui/`
- **No Test Framework**: Project currently has no testing setup