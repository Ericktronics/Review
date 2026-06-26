import type { Flashcard } from '../types';

export const angularCards: Flashcard[] = [

  // ─── Angular (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'ng-e1',
    category: 'Angular',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Angular and how is it different from React?',
    answer:
      '**Angular is a full opinionated framework** by Google. React is a UI library — you assemble your own stack. Angular ships everything: routing, HTTP client, forms, DI, animations, testing utilities.\n\n**Key Angular concepts**:\n- **Components** — the building blocks. Each has a TypeScript class, an HTML template, and an optional CSS file\n- **Modules (NgModule)** — group related components, directives, and services. Every app has at least one root `AppModule`. Standalone components (Angular 14+) skip NgModules.\n- **Dependency Injection (DI)** — built into the framework. Services are injected into constructors automatically by the Angular injector.\n- **TypeScript-first** — Angular requires TypeScript. Everything is strictly typed by design.\n- **Two-way data binding** — `[(ngModel)]` syncs the template and component class in both directions.\n\n**When Angular wins**: large enterprise apps where team consistency and a prescribed architecture matter more than flexibility. Comes with the full toolchain (Angular CLI, devtools, testing).',
    code: {
      language: 'typescript',
      snippet: `// Minimal Angular standalone component (Angular 14+)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-greeting',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <h1>Hello, {{ name }}!</h1>
    <button (click)="changeName()">Change</button>
  \`,
})
export class GreetingComponent {
  name = 'Henrick';

  changeName() {
    this.name = 'World';
  }
}`,
    },
  },

  {
    id: 'ng-e2',
    category: 'Angular',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are Angular directives? Explain structural vs attribute directives.',
    answer:
      "**Directives** extend HTML with custom behavior. There are three types:\n\n**1. Components** — directives with a template. The most common type.\n\n**2. Structural directives** — change the DOM structure by adding or removing elements. Prefixed with `*`:\n- `*ngIf` — conditionally renders an element\n- `*ngFor` — loops over a collection\n- `*ngSwitch` — switch/case rendering\n- Angular 17+: new `@if`, `@for`, `@switch` block syntax replaces these\n\n**3. Attribute directives** — change the appearance or behavior of an existing element without adding/removing DOM nodes:\n- `[ngClass]` — dynamically add/remove CSS classes\n- `[ngStyle]` — dynamically set inline styles\n- Custom directives (e.g. `appHighlight`, `appTooltip`)\n\n**The `*` asterisk** is syntactic sugar: `*ngIf=\"condition\"` desugars to `[ngIf]=\"condition\"` wrapped in a `<ng-template>`.",
    code: {
      language: 'html',
      snippet: `<!-- Structural directives -->
<div *ngIf="isLoggedIn; else loginBlock">Welcome back!</div>
<ng-template #loginBlock><p>Please log in.</p></ng-template>

<li *ngFor="let item of items; let i = index">
  {{ i + 1 }}. {{ item.name }}
</li>

<!-- Angular 17+ control flow (preferred) -->
@if (isLoggedIn) {
  <p>Welcome back!</p>
} @else {
  <p>Please log in.</p>
}

@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}

<!-- Attribute directives -->
<div [ngClass]="{ 'active': isActive, 'disabled': isDisabled }">
  Status badge
</div>

<p [ngStyle]="{ color: textColor, fontSize: fontSize + 'px' }">
  Styled text
</p>`,
    },
  },

  {
    id: 'ng-e3',
    category: 'Angular',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are Angular lifecycle hooks? Which ones do you use most?',
    answer:
      "Angular calls lifecycle hook methods at specific points in a component's life. Implement the corresponding interface to use them.\n\n**Most used**:\n- **`ngOnInit()`** — runs once after the first `ngOnChanges`. Use for initialization logic, API calls, setting up subscriptions. Equivalent to React's `useEffect(fn, [])`.\n- **`ngOnDestroy()`** — runs just before Angular destroys the component. Use to unsubscribe from Observables, clear timers, and remove event listeners to prevent memory leaks.\n- **`ngOnChanges(changes)`** — runs when an `@Input()` property changes. Receives a `SimpleChanges` object with current and previous values.\n- **`ngAfterViewInit()`** — runs after the component's view (and child views) are initialized. Use to access `@ViewChild` elements.\n\n**Order**: constructor → ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ngOnDestroy",
    code: {
      language: 'typescript',
      snippet: `import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({ selector: 'app-user', template: '...' })
export class UserComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: string;

  private destroy$ = new Subject<void>(); // for unsubscribing

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.loadUser(changes['userId'].currentValue);
    }
  }

  ngOnInit() {
    this.loadUser(this.userId);

    // Subscribe with automatic cleanup using takeUntil
    this.userService.updates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => this.applyUpdate(update));
  }

  ngOnDestroy() {
    this.destroy$.next();  // signal all takeUntil operators
    this.destroy$.complete();
  }
}`,
    },
  },

  {
    id: 'ng-e4',
    category: 'Angular',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is two-way data binding in Angular? How does `[(ngModel)]` work?',
    answer:
      "**Two-way data binding** keeps a template input and a component property in sync automatically — changes in the template update the class, and changes in the class update the template.\n\n**`[(ngModel)]`** — the \"banana in a box\" syntax — is shorthand for combining property binding `[ngModel]` (class → template) and event binding `(ngModelChange)` (template → class):\n```\n[(ngModel)] === [ngModel]=\"value\" (ngModelChange)=\"value = $event\"\n```\n\n**Requires `FormsModule`** to be imported in your NgModule or standalone component.\n\n**When to use**: simple template-driven forms. For complex forms with validation, reactive patterns, or dynamic fields, use **Reactive Forms** (`FormGroup`, `FormControl`, `ReactiveFormsModule`) — they are more testable and predictable.",
    code: {
      language: 'typescript',
      snippet: `// Template-driven form with ngModel
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: \`
    <input [(ngModel)]="username" placeholder="Enter name" />
    <p>Hello, {{ username }}!</p>

    <!-- Equivalent explicit form: -->
    <input
      [ngModel]="username"
      (ngModelChange)="username = $event"
    />
  \`,
})
export class LoginComponent {
  username = '';
}

// ── Reactive Forms (preferred for complex forms) ──────────────
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="email" />
      <span *ngIf="form.get('email')?.invalid">Invalid email</span>
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  \`,
})
export class SignupComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submit() { console.log(this.form.value); }
}`,
    },
  },

  // ─── Angular (Medium) ────────────────────────────────────────────────────────

  {
    id: 'ng-m1',
    category: 'Angular',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does Angular\'s Dependency Injection (DI) system work?',
    answer:
      "Angular has a hierarchical DI system. You declare **providers** and Angular's **injector** creates and delivers instances to constructors that ask for them.\n\n**How to create a service**:\n1. Decorate a class with `@Injectable()`\n2. Set `providedIn: 'root'` for a singleton across the entire app, or provide it at component level for a scoped instance\n\n**Injector hierarchy** — each component has its own injector that forms a tree mirroring the component tree. If a dependency isn't found at the component level, Angular walks up to the module injector, then the root injector.\n\n**`providedIn: 'root'` vs module providers**:\n- `providedIn: 'root'` — one singleton for the whole app, tree-shakeable\n- Provided in a `NgModule` — scoped to that module's components\n- Provided in a component's `providers: []` — a new instance per component\n\n**`@Inject()` token** — for injecting non-class values (strings, config objects), use `InjectionToken`.",
    code: {
      language: 'typescript',
      snippet: `import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Service — singleton across the whole app
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient); // modern inject() function (Angular 14+)

  getUser(id: string) {
    return this.http.get<User>(\`/api/users/\${id}\`);
  }
}

// Injection token for non-class values (e.g. API base URL from config)
export const API_URL = new InjectionToken<string>('API_URL');

// In app.config.ts (standalone) or AppModule:
// providers: [{ provide: API_URL, useValue: 'https://api.example.com' }]

// Consuming the token
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = inject(API_URL);
}

// Component-scoped service — fresh instance per component
@Component({
  providers: [UserService], // creates a NEW instance just for this component tree
})
export class UserCard {
  private userService = inject(UserService);
}`,
    },
  },

  {
    id: 'ng-m2',
    category: 'Angular',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is RxJS and how do Observables compare to Promises?',
    answer:
      "**RxJS** (Reactive Extensions for JavaScript) is Angular's core async primitive. It provides **Observables** — streams of values over time.\n\n**Observable vs Promise**:\n- Promise emits **one value** then completes. Observable can emit **zero, one, or many values** over time.\n- Promises are **eager** — they execute immediately on creation. Observables are **lazy** — they only run when subscribed to.\n- Observables are **cancellable** — call `unsubscribe()`. Promises cannot be cancelled.\n- Observables are **composable** — pipe operators (`map`, `filter`, `switchMap`, `debounceTime`) transform streams declaratively.\n\n**Angular uses Observables everywhere**: `HttpClient`, `Router.events`, `FormControl.valueChanges`, `ActivatedRoute.params`.\n\n**Memory leak trap**: always unsubscribe from Observables that don't complete on their own (infinite streams). Use `takeUntil(destroy$)`, `async` pipe, or `takeUntilDestroyed()` (Angular 16+).",
    code: {
      language: 'typescript',
      snippet: `import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';

@Component({
  template: \`
    <input [value]="query" (input)="query$.next($event.target.value)" />
    <ul>
      <li *ngFor="let r of results">{{ r.name }}</li>
    </ul>
  \`,
})
export class SearchComponent implements OnInit, OnDestroy {
  results: any[] = [];
  query$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.query$.pipe(
      debounceTime(300),               // wait 300ms after last keystroke
      switchMap(q =>                   // cancel previous request if new one comes in
        this.http.get<any[]>(\`/api/search?q=\${q}\`)
      ),
      takeUntil(this.destroy$),        // auto-unsubscribe on destroy
    ).subscribe(results => this.results = results);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}`,
    },
  },

  {
    id: 'ng-m3',
    category: 'Angular',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Angular\'s change detection? Compare Default vs OnPush strategy.',
    answer:
      "**Change detection** is how Angular keeps the DOM in sync with component state. By default, Angular checks every component in the tree on every async event (click, HTTP response, setTimeout, etc.).\n\n**Default strategy** — Angular checks the component and all its children on any change anywhere in the app. Simple to reason about, but can be slow in large component trees.\n\n**OnPush strategy** — Angular only checks the component when:\n1. An `@Input()` reference changes (shallow equality)\n2. An event originates from inside the component or its children\n3. The `async` pipe receives a new value\n4. `ChangeDetectorRef.markForCheck()` is called manually\n\n**When to use OnPush**: for performance — especially in components that receive data via Observables and the `async` pipe. In large enterprise Angular apps, `OnPush` + `async` pipe is the standard pattern.\n\n**`async` pipe** — subscribes to an Observable in the template and automatically unsubscribes on destroy. Works beautifully with `OnPush`.",
    code: {
      language: 'typescript',
      snippet: `import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe, NgFor } from '@angular/common';

// OnPush: only re-checks when inputs change or async pipe emits
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [AsyncPipe, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <!-- async pipe: subscribes, unwraps, and auto-unsubscribes -->
    <li *ngFor="let user of users$ | async">{{ user.name }}</li>
  \`,
})
export class UserListComponent {
  @Input() users$!: Observable<User[]>;
  // No manual subscribe/unsubscribe needed — async pipe handles it
}

// Forcing check when using OnPush with manual state mutations
import { ChangeDetectorRef, inject } from '@angular/core';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class ManualComponent {
  private cdr = inject(ChangeDetectorRef);
  data = 'initial';

  updateFromOutside(newData: string) {
    this.data = newData;
    this.cdr.markForCheck(); // tell Angular to check this subtree
  }
}`,
    },
  },

  {
    id: 'ng-m4',
    category: 'Angular',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Angular pipes? What is the difference between pure and impure pipes?',
    answer:
      "**Pipes** transform values in templates without changing the underlying data. They are called with the `|` operator.\n\n**Built-in pipes**: `date`, `currency`, `uppercase`, `lowercase`, `json`, `async`, `slice`, `percent`, `number`, `keyvalue`.\n\n**Pure pipe** (default) — Angular only re-executes it when the input reference changes (a new object/array reference, or a primitive value change). Most pipes should be pure — they are efficient because Angular can skip recalculation.\n\n**Impure pipe** — Angular re-executes it on **every change detection cycle**, regardless of whether the input changed. Use only when necessary (e.g. a pipe that transforms a mutable array in place). They are expensive — avoid unless needed.\n\n**Custom pipe**: implement `PipeTransform`, decorate with `@Pipe({ name: ... })`.",
    code: {
      language: 'typescript',
      snippet: `import { Pipe, PipeTransform } from '@angular/core';

// Pure custom pipe — only re-runs on new input reference
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength = 50): string {
    if (!value || value.length <= maxLength) return value;
    return value.slice(0, maxLength) + '...';
  }
}

// Usage in template:
// {{ longText | truncate:100 }}
// {{ price | currency:'PHP':'symbol':'1.2-2' }}
// {{ createdAt | date:'MMM d, y' }}
// {{ user$ | async }}  ← unwraps Observable/Promise

// Impure pipe (use sparingly — runs every CD cycle)
@Pipe({ name: 'filterActive', pure: false })
export class FilterActivePipe implements PipeTransform {
  transform(items: any[], active: boolean): any[] {
    return items.filter(i => i.active === active); // mutated array won't trigger pure pipe
  }
}`,
    },
  },

  // ─── Angular (Hard) ──────────────────────────────────────────────────────────

  {
    id: 'ng-1',
    category: 'Angular',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the key RxJS operators you use daily? Explain switchMap, mergeMap, concatMap, and exhaustMap.',
    answer:
      "All four are **higher-order mapping operators** — they map each source emission to an inner Observable. The difference is in how they handle overlapping inner Observables.\n\n**`switchMap`** — cancels the previous inner Observable when a new emission arrives. Use for: search-as-you-type, route param changes where only the latest matters.\n\n**`mergeMap`** (also called `flatMap`) — runs all inner Observables concurrently. Use for: parallel requests where order doesn't matter.\n\n**`concatMap`** — queues inner Observables and runs them one at a time, in order. Use for: sequential operations where order matters (e.g. save → then fetch).\n\n**`exhaustMap`** — ignores new emissions while an inner Observable is still running. Use for: login button clicks — ignore subsequent clicks until the first request completes.\n\n**Memory aid**: Switch = latest wins. Merge = all run concurrently. Concat = wait in line. Exhaust = busy, come back later.",
    code: {
      language: 'typescript',
      snippet: `import { fromEvent, interval } from 'rxjs';
import { switchMap, mergeMap, concatMap, exhaustMap, take } from 'rxjs/operators';

const clicks$ = fromEvent(button, 'click');
const request = () => this.http.post('/api/save', data);

// switchMap: cancel previous, use latest (search, route changes)
searchInput.valueChanges.pipe(
  debounceTime(300),
  switchMap(term => this.http.get(\`/api/search?q=\${term}\`))
).subscribe(results => this.results = results);

// mergeMap: all requests run concurrently (parallel uploads)
fileList$.pipe(
  mergeMap(file => this.uploadService.upload(file))
).subscribe(response => this.onUploaded(response));

// concatMap: queue requests, run one at a time (ordered saves)
saveQueue$.pipe(
  concatMap(item => this.http.post('/api/items', item))
).subscribe(saved => this.onSaved(saved));

// exhaustMap: ignore clicks while request is in-flight (login button)
clicks$.pipe(
  exhaustMap(() => this.authService.login(credentials))
).subscribe(user => this.onLoginSuccess(user));`,
    },
  },

  {
    id: 'ng-2',
    category: 'Angular',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does Angular route guards work? What is the difference between CanActivate, CanDeactivate, and Resolve?',
    answer:
      "Route guards are functions (Angular 14+ uses functional guards) or classes that control navigation.\n\n**`CanActivate`** — runs before entering a route. Returns `true` to allow, `false` or a `UrlTree` to redirect. Use for: auth checks, role/permission checks (RBAC).\n\n**`CanDeactivate`** — runs when leaving a route. Ask the component if it's safe to leave. Use for: unsaved changes warning — \"Are you sure you want to leave? You have unsaved changes.\"\n\n**`Resolve`** — pre-fetches data before the route activates. The component receives data via `ActivatedRoute.snapshot.data` without needing to handle the loading state. Use for: pre-loading critical data the page needs to render.\n\n**`CanMatch`** (Angular 15+) — determines whether a route definition should even be matched. Use for: feature flag-gated routes, role-based routing.",
    code: {
      language: 'typescript',
      snippet: `import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ResolveFn } from '@angular/router';
import { map } from 'rxjs';

// Functional CanActivate guard (Angular 14+ preferred style)
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map(isLoggedIn => isLoggedIn
      ? true
      : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    )
  );
};

// RBAC guard — check role
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.hasRole('admin') ? true : router.createUrlTree(['/forbidden']);
};

// Resolve guard — pre-fetch data
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.paramMap.get('id')!);
};

// Route config
const routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'users/:id',
        resolve: { user: userResolver },
        component: UserDetailComponent,
        // Access in component: this.route.snapshot.data['user']
      }
    ]
  }
];`,
    },
  },
];
