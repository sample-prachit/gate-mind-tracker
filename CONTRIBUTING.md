# Contributing to GATE Mind Tracker

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with Supabase credentials
4. Run the dev server: `npm run dev`

## Code Structure

### Key Directories

- `/src/components` - React components
  - `/ui` - Reusable shadcn/ui components
  - Other files - Feature-specific components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and API clients
- `/src/types` - TypeScript type definitions
- `/src/pages` - Page components

### File Naming Conventions

- Components: PascalCase (e.g., `TestTracker.tsx`)
- Utilities: camelCase (e.g., `calculations.ts`)
- Types: camelCase (e.g., `index.ts`)
- Constants: UPPER_SNAKE_CASE inside files

## Coding Standards

### TypeScript

- Always use TypeScript for new files
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Export types that are used across files

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing

### Styling

- Use Tailwind CSS classes
- Follow existing spacing/sizing patterns
- Keep responsive design in mind (mobile-first)
- Use shadcn/ui components when possible

### State Management

- Use React hooks (`useState`, `useEffect`)
- Keep state as local as possible
- Lift state only when necessary
- Use custom hooks for complex state logic

## Database

### Adding New Data Types

1. Update types in `/src/types/index.ts`
2. Add save/fetch functions in `/src/lib/progressApi.ts`
3. Add state management in `/src/pages/Index.tsx`
4. Update database schema documentation in README

### Database Best Practices

- Always use Row Level Security (RLS)
- Validate data before saving
- Handle errors gracefully
- Use transactions for related updates

## Adding New Features

### Checklist

- [ ] Create/update TypeScript types
- [ ] Add component(s)
- [ ] Add database functions if needed
- [ ] Update state management
- [ ] Add error handling
- [ ] Test functionality
- [ ] Update README if needed
- [ ] Add JSDoc comments

### Component Guidelines

```tsx
/**
 * Brief description of component
 */
interface MyComponentProps {
  // Props with JSDoc comments
  /** Description of prop */
  data: MyType[];
  onAction: (id: string) => void;
}

export const MyComponent = ({ data, onAction }: MyComponentProps) => {
  // Component logic
  
  return (
    // JSX
  );
};
```

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

### Manual Testing Checklist

- [ ] Test all CRUD operations
- [ ] Verify data persistence
- [ ] Check responsive design
- [ ] Test error scenarios
- [ ] Verify authentication flow
- [ ] Check console for errors

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push to your fork: `git push origin feature/my-feature`
6. Create a Pull Request

### Commit Message Format

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Style:` - Code style changes

## Code Review

Pull requests will be reviewed for:

- Code quality and readability
- Adherence to project structure
- Proper TypeScript usage
- Error handling
- Performance considerations
- Responsive design
- Documentation updates

## Questions?

Feel free to open an issue for questions or discussions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
