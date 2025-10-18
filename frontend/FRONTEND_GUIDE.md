# Frontend Architecture Guide

## Overview

The Angular frontend has been completely refactored into a professional, modular architecture with:

- ✅ **Services** for API communication and state management
- ✅ **Reusable components** with clean separation of concerns
- ✅ **TypeScript models** for type safety
- ✅ **Modern UI** with beautiful design and animations
- ✅ **Error handling** and loading states
- ✅ **Responsive design** for mobile and desktop

## Project Structure

```
src/app/
├── models/
│   └── task.model.ts           # TypeScript interfaces and enums
├── services/
│   ├── api.service.ts          # HTTP client wrapper
│   └── task.service.ts         # Task state management & polling
├── components/
│   ├── header/
│   │   └── header.component.ts # App header with branding
│   ├── prompt-input/
│   │   └── prompt-input.component.ts  # Prompt input with examples
│   └── task-status/
│       └── task-status.component.ts   # Task progress and results
├── app.component.ts        # Main app component (NEW)
├── app.component.ts            # Legacy component (keep for now)
└── app.config.ts               # App configuration
```

## Key Features

### 1. Service Layer

**ApiService** (`services/api.service.ts`)
- HTTP client wrapper
- Error handling
- Retry logic
- Type-safe requests/responses

**TaskService** (`services/task.service.ts`)
- Task state management using RxJS BehaviorSubject
- Automatic polling for task updates
- Lifecycle management (start/stop polling)
- Observable pattern for reactive updates

### 2. Component Architecture

**HeaderComponent**
- Branded header with gradient
- Connection status indicator
- Responsive design

**PromptInputComponent**
- Smart contract prompt input
- Quick-start examples
- Loading states
- Form validation

**TaskStatusComponent**
- Real-time progress tracking
- Log streaming with syntax highlighting
- Results display
- Error handling

### 3. Models & Types

**Task Model** (`models/task.model.ts`)
```typescript
interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  logs: string[];
  result?: TaskResult;
  error?: string;
}

enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

### 4. Design System

**Color Palette:**
- Primary: `#667eea` → `#764ba2` (gradient)
- Secondary: `#48bb78`
- Danger: `#f56565`
- Gray scale: 50-900

**Components:**
- Cards with subtle shadows
- Gradient buttons
- Status badges
- Progress bars
- Toast notifications

## Usage

### Using the New Architecture

**Option 1: Replace app.component.ts**
```bash
cd src/app
mv app.component.ts app.component.old.ts
mv app.component.ts app.component.ts
```

**Option 2: Update app.config.ts**
```typescript
// Import the new component
import { AppComponent } from './app.component.new';
```

### Development

```bash
cd frontend/algorand-ai-agent
npm install
npm start
```

Access at: http://localhost:4200

### Production Build

```bash
npm run build
# Output in dist/
```

## Component Usage Examples

### Using TaskService

```typescript
import { TaskService } from './services/task.service';

export class MyComponent {
  constructor(private taskService: TaskService) {}

  createTask() {
    this.taskService.createTask('My prompt').subscribe({
      next: (taskId) => console.log('Task created:', taskId),
      error: (error) => console.error('Error:', error)
    });
  }

  ngOnInit() {
    this.taskService.getCurrentTask().subscribe(task => {
      console.log('Current task:', task);
    });
  }
}
```

### Using ApiService Directly

```typescript
import { ApiService } from './services/api.service';

export class MyComponent {
  constructor(private api: ApiService) {}

  checkHealth() {
    this.api.getHealth().subscribe(health => {
      console.log('API Health:', health);
    });
  }
}
```

## Styling Guidelines

### Component Styles

Components use inline styles for encapsulation:

```typescript
@Component({
  selector: 'app-my-component',
  template: `...`,
  styles: [`
    .container {
      padding: 2rem;
      background: white;
      border-radius: 12px;
    }
  `]
})
```

### Global Styles

Global variables and utilities in `src/styles.css`:

```css
:root {
  --primary: #667eea;
  --secondary: #48bb78;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

## Responsive Design

All components are mobile-responsive:

```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## State Management

### Task State Flow

```
User Action
    ↓
TaskService.createTask()
    ↓
ApiService.generateContract()
    ↓
Backend creates task
    ↓
TaskService starts polling
    ↓
Updates emitted via BehaviorSubject
    ↓
Components receive updates
    ↓
UI updates automatically
```

### Observable Pattern

```typescript
// Service
private currentTask$ = new BehaviorSubject<Task | null>(null);

getCurrentTask(): Observable<Task | null> {
  return this.currentTask$.asObservable();
}

// Component
this.taskService.getCurrentTask().subscribe(task => {
  this.task = task;
});
```

## Error Handling

### HTTP Errors

ApiService handles errors automatically:

```typescript
private handleError(error: HttpErrorResponse) {
  let errorMessage = 'An error occurred';
  if (error.error?.detail) {
    errorMessage = error.error.detail;
  }
  return throwError(() => new Error(errorMessage));
}
```

### Component-Level Errors

```typescript
showError(message: string): void {
  this.errorMessage = message;
  setTimeout(() => this.clearError(), 5000);
}
```

## Testing

### Unit Tests (Future)

```typescript
describe('TaskService', () => {
  it('should create task', (done) => {
    service.createTask('prompt').subscribe(taskId => {
      expect(taskId).toBeDefined();
      done();
    });
  });
});
```

### E2E Tests (Future)

```typescript
describe('App', () => {
  it('should submit prompt', () => {
    cy.visit('/');
    cy.get('textarea').type('Create counter contract');
    cy.get('button').contains('Generate').click();
    cy.get('.status-badge').should('exist');
  });
});
```

## Performance Optimizations

### 1. OnPush Change Detection (Future)

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 2. Lazy Loading

Components are standalone and tree-shakeable.

### 3. Polling Management

- Automatic cleanup on component destroy
- Stops polling when task completes
- 1-second interval (configurable)

## Accessibility

### ARIA Labels

```html
<button aria-label="Generate smart contract">
  Generate
</button>
```

### Keyboard Navigation

All interactive elements are keyboard-accessible.

### Screen Readers

Status updates announced via live regions (future enhancement).

## Migration from Old Component

### What Changed

**Before:**
- Single 500+ line component
- Mixed concerns
- Inline API calls
- No state management

**After:**
- Modular components
- Separation of concerns
- Service layer
- Reactive state management

### Migration Steps

1. Keep old component for reference
2. Test new component thoroughly
3. Switch to new component
4. Remove old component after verification

## Environment Configuration

### Development

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000'
};
```

### Production

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: ''  // Same origin
};
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Future Enhancements

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Implement OnPush change detection
- [ ] Add service worker for offline support
- [ ] Add websocket for real-time updates
- [ ] Implement virtual scrolling for logs
- [ ] Add dark mode support
- [ ] Add internationalization (i18n)

## Troubleshooting

### Issue: API connection fails

**Solution:**
```typescript
// Check environment.ts has correct API URL
apiUrl: 'http://localhost:8000'
```

### Issue: Polling doesn't stop

**Solution:**
```typescript
ngOnDestroy() {
  this.taskService.stopPolling();
}
```

### Issue: Components not rendering

**Solution:**
```typescript
// Ensure all components are imported in app.component.ts
imports: [
  HeaderComponent,
  PromptInputComponent,
  TaskStatusComponent
]
```

## Contributing

When adding new features:

1. Create new component in `components/`
2. Add service in `services/` if needed
3. Define models in `models/`
4. Update this guide

## Summary

The refactored frontend provides:

- ✅ **Professional architecture**
- ✅ **Type safety** with TypeScript
- ✅ **Reactive patterns** with RxJS
- ✅ **Beautiful design** with modern UI
- ✅ **Modular components**
- ✅ **Service layer** for API communication
- ✅ **Error handling** and loading states
- ✅ **Responsive design**

All while maintaining the same functionality as the original! 🚀
