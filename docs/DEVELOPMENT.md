# 👨‍💻 Development Guide

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended editor with extensions

### **Required VS Code Extensions**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### **Initial Setup**
```bash
# Clone the repository
git clone https://github.com/fedegualdrini/investment-portfolio-tracker-.git
cd investment-portfolio-tracker-

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

## 🏗️ Project Structure

### **Directory Organization**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (buttons, inputs, etc.)
│   ├── forms/          # Form-related components
│   └── layout/         # Layout components (header, sidebar, etc.)
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── BondAnalysisPage.tsx # Bond analysis page
│   └── ChatPage.tsx    # AI assistant page
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles and CSS
└── assets/             # Static assets (images, icons)
```

### **File Naming Conventions**
- **Components**: PascalCase (e.g., `InvestmentCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCurrency.ts`)
- **Services**: camelCase (e.g., `currencyService.ts`)
- **Types**: camelCase (e.g., `investment.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`)

## 🧩 Component Development

### **Component Template**
```typescript
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface ComponentNameProps {
  // Define props interface
  title: string;
  data: any[];
  onAction?: (id: string) => void;
}

export function ComponentName({ title, data, onAction }: ComponentNameProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // Component logic here
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      {/* Component content */}
    </div>
  );
}
```

### **Component Guidelines**
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Use destructuring with default values
- **Children**: Use `ReactNode` type for flexible content
- **Event Handlers**: Use `on` prefix for event handlers

### **Styling Guidelines**
```typescript
// Use Tailwind CSS classes
// Mobile-first responsive design
<div className="
  p-4                    // Mobile: 16px padding
  sm:p-6                 // Small screens: 24px padding
  lg:p-8                 // Large screens: 32px padding
  
  grid grid-cols-1       // Mobile: 1 column
  md:grid-cols-2        // Medium screens: 2 columns
  lg:grid-cols-3        // Large screens: 3 columns
  
  gap-4                  // 16px gap
  space-y-4              // Vertical spacing
">
```

## 🔄 Context Development

### **Creating a New Context**
```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define context type
interface MyContextType {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
}

// Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider component
export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<string>('default');
  
  const reset = () => setValue('default');
  
  return (
    <MyContext.Provider value={{ value, setValue, reset }}>
      {children}
    </MyContext.Provider>
  );
}

// Custom hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
```

### **Context Best Practices**
- **Provider Hierarchy**: Keep providers close to where they're needed
- **Value Memoization**: Use `useMemo` for complex context values
- **Error Boundaries**: Wrap context usage in error boundaries
- **Performance**: Avoid unnecessary re-renders with proper dependencies

## 🛠️ Service Development

### **Service Class Template**
```typescript
export class MyService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour
  
  async fetchData(id: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    
    try {
      // Fetch from API
      const response = await fetch(`/api/data/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.cache.set(id, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  
  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.cacheExpiry;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
```

### **Service Guidelines**
- **Error Handling**: Always handle errors gracefully
- **Caching**: Implement caching for performance
- **Type Safety**: Use TypeScript interfaces for API responses
- **Retry Logic**: Implement retry mechanisms for failed requests
- **Logging**: Add appropriate logging for debugging

## 🧪 Testing

### **Test Setup**
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Component Testing**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { ComponentName } from './ComponentName';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </LanguageProvider>
  </ThemeProvider>
);

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <ComponentName title="Test Title" data={[]} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles user interactions', () => {
    const mockOnAction = jest.fn();
    
    render(
      <TestWrapper>
        <ComponentName 
          title="Test" 
          data={[{ id: '1', name: 'Test Item' }]} 
          onAction={mockOnAction}
        />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Test Item'));
    expect(mockOnAction).toHaveBeenCalledWith('1');
  });
});
```

### **Service Testing**
```typescript
import { MyService } from './MyService';

// Mock fetch
global.fetch = jest.fn();

describe('MyService', () => {
  let service: MyService;
  
  beforeEach(() => {
    service = new MyService();
    jest.clearAllMocks();
  });
  
  it('fetches data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });
    
    const result = await service.fetchData('1');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/data/1');
  });
  
  it('handles API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    await expect(service.fetchData('1')).rejects.toThrow('HTTP error! status: 404');
  });
});
```

## 🔧 Development Tools

### **ESLint Configuration**
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/prop-types": "off"
  }
}
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### **VS Code Settings**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

## 🚀 Performance Optimization

### **React Optimizations**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Optimize callbacks
const handleClick = useCallback((id: string) => {
  onAction(id);
}, [onAction]);

// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### **Bundle Optimization**
```typescript
// Dynamic imports for code splitting
const loadFeature = async () => {
  const { default: Feature } = await import('./Feature');
  return Feature;
};

// Tree shaking friendly imports
import { useState, useEffect } from 'react'; // ✅ Good
import React from 'react'; // ❌ Bad (imports entire React)
```

## 🔍 Debugging

### **Console Logging**
```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { data, state });
}

// Structured logging
console.group('Component Update');
console.log('Props:', props);
console.log('State:', state);
console.groupEnd();
```

### **React DevTools**
- Install React Developer Tools browser extension
- Use Profiler for performance analysis
- Inspect component hierarchy and props
- Monitor context values and state changes

### **Error Boundaries**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}
```

## 📝 Code Quality

### **TypeScript Best Practices**
```typescript
// Use strict typing
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional property
}

// Generic types
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// Union types
type Status = 'loading' | 'success' | 'error';

// Discriminated unions
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: User[];
}

interface ErrorState {
  status: 'error';
  message: string;
}

type AppState = LoadingState | SuccessState | ErrorState;
```

### **Code Review Checklist**
- [ ] TypeScript types are properly defined
- [ ] Components follow single responsibility principle
- [ ] Error handling is implemented
- [ ] Performance optimizations are applied
- [ ] Tests are written and passing
- [ ] Code follows project conventions
- [ ] Accessibility considerations are met
- [ ] Responsive design is implemented

## 🔄 Git Workflow

### **Branch Naming**
```bash
# Feature branches
git checkout -b feature/currency-dropdown
git checkout -b feature/bond-analysis

# Bug fix branches
git checkout -b fix/currency-conversion
git checkout -b fix/bond-calculation

# Hotfix branches
git checkout -b hotfix/critical-bug
```

### **Commit Messages**
```bash
# Use conventional commits
git commit -m "feat: add currency dropdown component"
git commit -m "fix: resolve bond calculation error"
git commit -m "docs: update README with new features"
git commit -m "refactor: simplify currency conversion logic"
git commit -m "test: add tests for bond analysis service"
```

### **Pull Request Process**
1. **Create PR** with descriptive title and description
2. **Link Issues** that the PR addresses
3. **Add Labels** for categorization
4. **Request Review** from team members
5. **Address Feedback** and make necessary changes
6. **Merge** after approval and CI checks pass

## 🚀 Deployment

### **Environment Variables**
```bash
# .env.local (development)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Investment Portfolio Tracker (Dev)
OPENAI_API_KEY=your_openai_api_key

# .env.production
VITE_API_URL=https://api.production.com
VITE_APP_NAME=Investment Portfolio Tracker
OPENAI_API_KEY=your_production_openai_api_key
```

### **Build Commands**
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle
npm run build:analyze
```

### **Deployment Checklist**
- [ ] All tests are passing
- [ ] Build completes without errors
- [ ] Environment variables are configured
- [ ] API endpoints are accessible
- [ ] Performance metrics are acceptable
- [ ] Error monitoring is configured
- [ ] Analytics tracking is working

## 📚 Resources

### **Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### **Tools**
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### **Community**
- [React Community](https://reactjs.org/community/support.html)
- [TypeScript Community](https://www.typescriptlang.org/community/)
- [Tailwind CSS Community](https://tailwindcss.com/community)

---

**Happy Coding! 🚀**
