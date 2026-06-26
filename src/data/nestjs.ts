import type { Flashcard } from '../types';

export const nestjsCards: Flashcard[] = [

  // ─── NestJS (Easy) ───────────────────────────────────────────────────────────

  {
    id: 'nest-e1',
    category: 'NestJS',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is NestJS and what problems does it solve over plain Express?',
    answer:
      '**NestJS** is an opinionated Node.js framework built on top of Express (or Fastify) that brings Angular-style structure to backend development using TypeScript, decorators, and dependency injection.\n\n**Problems it solves**:\n- **No enforced structure** — Express gives you freedom; NestJS gives you conventions. Modules, controllers, services, and providers have clear, consistent roles.\n- **Manual dependency wiring** — in Express you manually import and instantiate services. NestJS has a built-in IoC container that injects dependencies automatically.\n- **Boilerplate** — validation, serialization, guards, interceptors, and exception handling are first-class features, not something you build from scratch.\n- **Testability** — the DI system makes unit testing trivial — swap real services for mocks without touching the code under test.\n\n**When to use NestJS**: team projects, large APIs, microservices, or any project where consistency and long-term maintainability matter more than a minimal footprint.',
    code: {
      language: 'typescript',
      snippet: `// Plain Express — no enforced structure, manual wiring
const userService = new UserService(new UserRepository(db));
app.get('/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.json(user);
});

// NestJS — declarative, injected automatically
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}`,
    },
  },

  {
    id: 'nest-e2',
    category: 'NestJS',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are decorators in NestJS? What are the most commonly used ones?',
    answer:
      '**Decorators** are TypeScript\'s `@SomeName()` syntax — they are functions that attach metadata to a class, method, property, or parameter. NestJS uses this metadata at runtime to wire up routing, dependency injection, validation, and more.\n\n**Core decorators by category**:\n\n**Class-level** (define what a class is):\n- `@Module()` — declares a NestJS module\n- `@Controller(\'path\')` — declares a route controller\n- `@Injectable()` — marks a class as a provider that can be injected\n\n**Method-level** (HTTP handlers):\n- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` — HTTP method + path\n- `@UseGuards()`, `@UseInterceptors()`, `@UsePipes()` — apply behaviour to a route\n\n**Parameter-level** (extract values from the request):\n- `@Param(\'id\')` — URL parameter\n- `@Body()` — request body\n- `@Query(\'page\')` — query string\n- `@Headers(\'authorization\')` — specific header\n- `@Req()` / `@Res()` — raw Express req/res (avoid if possible)',
    code: {
      language: 'typescript',
      snippet: `@Controller('products')          // base path: /products
@UseGuards(JwtAuthGuard)         // applied to ALL routes in this controller
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()                         // GET /products
  findAll(@Query('page') page: string) {
    return this.productsService.findAll(+page);
  }

  @Get(':id')                    // GET /products/:id
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()                        // POST /products
  @HttpCode(201)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Delete(':id')                 // DELETE /products/:id
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}`,
    },
  },

  {
    id: 'nest-e3',
    category: 'NestJS',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a Module in NestJS? What goes in the `imports`, `controllers`, `providers`, and `exports` arrays?',
    answer:
      '**A Module** is the fundamental building block of a NestJS application. Every app has at least one root module (`AppModule`). Modules group related functionality and control what is visible to the rest of the application.\n\n**`@Module()` properties**:\n\n| Property | What goes here |\n|---|---|\n| `imports` | Other modules whose exported providers this module needs |\n| `controllers` | Controllers declared in this module (handle HTTP routes) |\n| `providers` | Services, repositories, guards, pipes — injectable classes |\n| `exports` | Subset of `providers` that other modules can inject |\n\n**Key rule**: if Module A needs to use `UserService` from Module B, Module B must list `UserService` in its `exports`, and Module A must list Module B in its `imports`.\n\n**Why modules matter**: they enforce explicit dependency boundaries. You cannot accidentally use a service from another module — you must explicitly import it.',
    code: {
      language: 'typescript',
      snippet: `@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // register User entity
    MailModule,                         // gives access to MailService
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
  ],
  exports: [UsersService],  // other modules can now inject UsersService
})
export class UsersModule {}

// AppModule ties everything together
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}`,
    },
  },

  {
    id: 'nest-e4',
    category: 'NestJS',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Dependency Injection in NestJS? How does it work?',
    answer:
      '**Dependency Injection (DI)** is a pattern where a class declares what it needs (its dependencies) and a container creates and provides those dependencies automatically — the class never instantiates them itself.\n\n**How NestJS DI works**:\n1. A class marked with `@Injectable()` is registered as a **provider** in a module\n2. NestJS reads the TypeScript constructor types (via emitted metadata — requires `emitDecoratorMetadata: true` in tsconfig)\n3. When something requests that provider, NestJS resolves the full dependency tree and injects everything\n\n**Scope**: by default, providers are **singletons** — one shared instance per module. You can also use `REQUEST` scope (one instance per HTTP request) or `TRANSIENT` scope (new instance every injection).\n\n**Why it matters**: DI makes code modular and testable. In tests, you swap a real `UsersRepository` for a mock without touching `UsersService` at all.',
    code: {
      language: 'typescript',
      snippet: `// Mark as injectable — NestJS will manage this class
@Injectable()
export class UsersService {
  // NestJS injects UsersRepository automatically
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string) {
    return this.usersRepository.findOne(id);
  }
}

// In a unit test — swap the real repo for a mock
const module = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useValue: { findOne: jest.fn().mockResolvedValue({ id: '1' }) },
    },
  ],
}).compile();

const service = module.get(UsersService);`,
    },
  },

  // ─── NestJS (Medium) ─────────────────────────────────────────────────────────

  {
    id: 'nest-m1',
    category: 'NestJS',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Pipes in NestJS? How do you use `ValidationPipe` with class-validator?',
    answer:
      '**Pipes** are classes that transform or validate incoming data before it reaches your route handler. They run after decorators like `@Body()` extract the data but before the handler executes.\n\n**Two uses**:\n1. **Transformation** — convert a string param to a number (`ParseIntPipe`, `ParseUUIDPipe`)\n2. **Validation** — reject the request if the data doesn\'t meet the schema\n\n**`ValidationPipe` + `class-validator`** is the standard NestJS validation pattern:\n1. Define a DTO class with validation decorators from `class-validator`\n2. Enable `ValidationPipe` globally (or per-route)\n3. NestJS automatically validates incoming `@Body()` against the DTO and throws a `400 Bad Request` with detailed error messages if validation fails\n\n**`whitelist: true`** strips any properties not declared in the DTO — prevents mass-assignment attacks where a client sends extra fields like `{ role: "admin" }`.',
    code: {
      language: 'typescript',
      snippet: `// 1. DTO with class-validator decorators
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

// 2. Enable globally in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,       // strip unknown properties
  forbidNonWhitelisted: true, // throw if unknown props are sent
  transform: true,       // auto-convert @Param() strings to numbers, etc.
}));

// 3. Route handler — validation happens automatically
@Post()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
  // If dto is invalid → 400 Bad Request with field-level error messages
}

// 4. ParseIntPipe for route params
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  // id is already a number, not a string
}`,
    },
  },

  {
    id: 'nest-m2',
    category: 'NestJS',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Guards in NestJS? How do you implement JWT authentication with a Guard?',
    answer:
      '**Guards** implement the `CanActivate` interface and decide whether a request should be handled or rejected (returning `403 Forbidden`). They run after middleware but before pipes and interceptors.\n\n**Common uses**: authentication (is the user logged in?), authorization (does this user have the right role?), feature flags.\n\n**JWT auth flow with a Guard**:\n1. Extract the token from the `Authorization: Bearer <token>` header\n2. Verify the token with `JwtService`\n3. Attach the decoded user to `request.user` so route handlers can access it\n4. Return `true` to allow, `false` to deny\n\n**`@Public()` decorator pattern**: if you apply `JwtAuthGuard` globally, you need a way to opt-out for public routes (login, register). A custom `@Public()` decorator sets metadata that the guard checks to skip verification.',
    code: {
      language: 'typescript',
      snippet: `// Guard implementation
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    try {
      request.user = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(req: Request): string | null {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

// Custom decorator to mark routes as public
export const Public = () => SetMetadata('isPublic', true);

// Apply globally but skip routes marked @Public()
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get('isPublic', context.getHandler());
    if (isPublic) return true;
    // ... rest of JWT verification
  }
}

// Usage
@Post('login')
@Public()                  // skip JWT check for login
login(@Body() dto: LoginDto) { ... }

@Get('profile')            // protected — JWT required
getProfile(@Req() req) { return req.user; }`,
    },
  },

  {
    id: 'nest-m3',
    category: 'NestJS',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Interceptors in NestJS? What are they used for?',
    answer:
      '**Interceptors** wrap a route handler\'s execution — they can run code before AND after the handler, transform the response, handle errors, or add extra logic like caching and logging. They implement the `NestInterceptor` interface and use RxJS `Observable`.\n\n**The request/response cycle with an interceptor**:\n`request → interceptor (before) → handler → interceptor (after) → response`\n\n**Common use cases**:\n- **Response transformation** — wrap all responses in a standard `{ data, statusCode }` envelope\n- **Logging** — measure and log request duration\n- **Caching** — return a cached response instead of calling the handler\n- **Error mapping** — convert thrown errors to a standard format\n- **Timeout** — cancel a handler if it takes too long\n\n**Interceptor vs Middleware vs Guard**:\n- Middleware: runs before the route is matched (no access to handler result)\n- Guard: decides yes/no before the handler runs\n- Interceptor: wraps the handler — can see both request and response',
    code: {
      language: 'typescript',
      snippet: `import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// 1. Response envelope — wraps every response in { data: ... }
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({ data, statusCode: context.switchToHttp().getResponse().statusCode })),
    );
  }
}

// 2. Logging interceptor — measures request duration
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => console.log(\`\${req.method} \${req.url} — \${Date.now() - start}ms\`)),
    );
  }
}

// Apply globally
app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());`,
    },
  },

  {
    id: 'nest-m4',
    category: 'NestJS',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Exception Filters in NestJS? How do you build a global error handler?',
    answer:
      '**Exception Filters** catch errors thrown anywhere in the application and send a structured HTTP response. NestJS has a built-in global exception filter that handles `HttpException` subclasses automatically — anything else becomes a `500 Internal Server Error`.\n\n**Built-in exceptions**: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`, `UnprocessableEntityException`, etc.\n\n**Custom exception filter**: when you need to handle non-HTTP errors (e.g. Prisma database errors, Zod validation errors, custom domain errors) and map them to the right HTTP status codes.\n\n**Why it matters**: a global exception filter is your single point of control over error serialization — ensures all errors return the same JSON shape, adds logging, and prevents stack traces leaking to clients.',
    code: {
      language: 'typescript',
      snippet: `// Throw built-in NestJS exceptions anywhere in your code
throw new NotFoundException('User not found');         // 404
throw new BadRequestException('Invalid email format'); // 400
throw new ConflictException('Email already in use');   // 409
throw new UnauthorizedException();                      // 401

// Custom domain exception
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// Global exception filter — catches everything
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = (exception.getResponse() as any).message ?? exception.message;
    } else if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
    } else {
      console.error('Unhandled error:', exception); // log unknown errors
    }

    res.status(status).json({ statusCode: status, message });
  }
}

// Register globally in main.ts
app.useGlobalFilters(new GlobalExceptionFilter());`,
    },
  },

  // ─── NestJS (Hard) ───────────────────────────────────────────────────────────

  {
    id: 'nest-h1',
    category: 'NestJS',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you structure a large, scalable NestJS application? What module patterns do you use?',
    answer:
      '**The core principle**: organise by domain (users, orders, payments), not by layer (controllers, services, repositories). Each domain owns its full vertical slice.\n\n**Recommended structure**:\n```\nsrc/\n  common/           # shared guards, pipes, decorators, interceptors\n  config/           # ConfigModule setup, env validation\n  database/         # TypeORM/Prisma setup module\n  modules/\n    users/\n      dto/          # CreateUserDto, UpdateUserDto\n      entities/     # User entity\n      users.controller.ts\n      users.service.ts\n      users.repository.ts\n      users.module.ts\n    auth/\n    products/\n  app.module.ts\n  main.ts\n```\n\n**Key patterns**:\n\n**Global modules** (`@Global()`) — `ConfigModule`, `DatabaseModule`. Register once in `AppModule`, available everywhere without importing in each module. Use sparingly.\n\n**Barrel exports** — each module exports a clean public API. Internal implementation details stay private (not listed in `exports`).\n\n**Repository pattern** — keep all database queries in a repository class. Services contain business logic, repositories contain SQL/ORM queries. Swap Prisma for TypeORM without touching services.\n\n**DTO validation at every boundary** — always use DTOs with `ValidationPipe`. Never trust raw `req.body` in services.',
    code: {
      language: 'typescript',
      snippet: `// Domain-based module — users owns everything users-related
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),  // break circular dependency with forwardRef
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],         // only expose what other modules need
})
export class UsersModule {}

// Config module with env validation (using Joi or zod)
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppModule {}

// main.ts — wire up global middleware
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}`,
    },
  },

  {
    id: 'nest-h2',
    category: 'NestJS',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does NestJS support microservices? What transport layers does it offer and how do they differ?',
    answer:
      '**NestJS microservices** use a message-passing model instead of HTTP. Services communicate by sending messages (request-response) or events (fire-and-forget) over a transport layer.\n\n**Available transport layers**:\n\n| Transport | Best for |\n|---|---|\n| **TCP** | Internal services on the same network; lightweight, low latency |\n| **Redis** | Pub/sub fanout; all subscribers receive the message |\n| **RabbitMQ** | Work queues; one consumer processes each message; supports acking |\n| **Kafka** | High-throughput event streaming; durable, replayable, ordered |\n| **NATS** | Lightweight, fast; good for service meshes |\n| **gRPC** | Typed, binary, bidirectional streaming; great for inter-service RPCs |\n\n**Two messaging patterns**:\n- **Message pattern** (`@MessagePattern`) — request/response, caller awaits a reply\n- **Event pattern** (`@EventPattern`) — fire-and-forget, no reply expected\n\n**Hybrid app**: a single NestJS app can serve both HTTP (for clients) and a microservice transport (for inter-service communication) simultaneously using `app.connectMicroservice()`.',
    code: {
      language: 'typescript',
      snippet: `// microservice/main.ts — a pure microservice (no HTTP)
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.RABBITMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: 'orders_queue',
    queueOptions: { durable: true },
  },
});
await app.listen();

// orders.controller.ts — handle messages from the queue
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Request-response: caller awaits a reply
  @MessagePattern({ cmd: 'get_order' })
  getOrder(@Payload() data: { id: string }) {
    return this.ordersService.findById(data.id);
  }

  // Event: fire-and-forget, no reply
  @EventPattern('order_shipped')
  handleOrderShipped(@Payload() event: OrderShippedEvent) {
    return this.ordersService.markShipped(event.orderId);
  }
}

// api-gateway/orders.service.ts — send messages from the HTTP API
@Injectable()
export class OrdersClientService {
  constructor(@Inject('ORDERS_SERVICE') private client: ClientProxy) {}

  getOrder(id: string) {
    return this.client.send({ cmd: 'get_order' }, { id }).toPromise();
  }

  notifyShipped(orderId: string) {
    this.client.emit('order_shipped', { orderId }); // fire-and-forget
  }
}`,
    },
  },

  {
    id: 'nest-h3',
    category: 'NestJS',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you handle database transactions in NestJS with TypeORM or Prisma? What patterns do you use?',
    answer:
      '**Why transactions matter**: if you perform multiple DB writes and one fails, you need all of them to roll back atomically. Without a transaction, a crash between writes leaves your data in an inconsistent state.\n\n**TypeORM approach — QueryRunner**:\nTypeORM\'s `QueryRunner` gives you explicit control over transaction lifecycle. You must manually commit or roll back, and you must remember to release the runner to avoid connection pool exhaustion.\n\n**Prisma approach — `prisma.$transaction()`**:\nPrisma provides two transaction APIs:\n1. **Sequential transactions** (`prisma.$transaction([...])`) — pass an array of Prisma operations; all run in a single transaction\n2. **Interactive transactions** (`prisma.$transaction(async (tx) => {...})`) — use the `tx` client instead of `prisma` inside the callback; Prisma auto-commits on success and auto-rolls back on throw\n\n**Unit of Work pattern** — for complex flows, collect all operations in a service method and execute them together in a single transaction rather than scattering individual DB calls.',
    code: {
      language: 'typescript',
      snippet: `// ── TypeORM: QueryRunner transaction ──────────────────────────────
@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async createOrder(dto: CreateOrderDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const order = await qr.manager.save(Order, { userId: dto.userId });
      await qr.manager.decrement(Inventory, { id: dto.itemId }, 'stock', 1);
      await qr.commitTransaction();
      return order;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release(); // always release — avoids connection pool exhaustion
    }
  }
}

// ── Prisma: interactive transaction ───────────────────────────────
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // use 'tx' instead of 'this.prisma' — both ops are in the same transaction
      const order = await tx.order.create({ data: { userId: dto.userId } });
      await tx.inventory.update({
        where: { id: dto.itemId },
        data: { stock: { decrement: 1 } },
      });
      return order;
      // auto-commits on return, auto-rolls back if this function throws
    });
  }
}`,
    },
  },

  {
    id: 'nest-m5',
    category: 'NestJS',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between Middleware and Interceptors in NestJS? When do you use each?',
    answer:
      '**Middleware** runs before the route handler. It has access to `req` and `res` but never sees the handler\'s return value — it only modifies the incoming request.\n\n**Interceptors** wrap the entire execution using RxJS. They run logic both **before and after** the handler, can transform the response, measure execution time, and even short-circuit with a cached result.\n\n**NestJS request lifecycle order**:\nMiddleware → Guards → Interceptors (before) → Pipes → Handler → Interceptors (after) → Exception Filters\n\n| | Middleware | Interceptor |\n|---|---|---|\n| Runs | Before handler | Before + after handler |\n| Sees response | No | Yes |\n| Transforms response | No | Yes |\n| Access to handler metadata | No | Yes (`ExecutionContext`) |\n| Based on | Express middleware | RxJS Observable |\n| Use for | Auth, CORS, rate limiting, body parsing | Response mapping, logging with timing, caching, timeout |\n\n**Use middleware for**: global concerns that don\'t need to know what handler ran — auth token extraction, request logging, CORS headers.\n\n**Use interceptors for**: anything that needs the response — logging with response time, wrapping all responses in `{ data: ... }`, adding cache headers, implementing a global timeout.',
    code: {
      language: 'typescript',
      snippet: `import { Injectable, NestMiddleware, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap, timeout, TimeoutError } from 'rxjs';

// ── Middleware — runs BEFORE the handler, no response access ──
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(\`[\${req.method}] \${req.url}\`);
    next(); // must call next() or the request hangs
  }
}

// Apply in AppModule:
// configure(consumer: MiddlewareConsumer) {
//   consumer.apply(LoggerMiddleware).forRoutes('*');
// }

// ── Interceptor — wraps the handler, can see the response ──
@Injectable()
export class ResponseWrapInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      tap(data => {
        // runs AFTER the handler — has access to the response data
        console.log(\`Handler took \${Date.now() - start}ms, returned:\`, data);
      }),
      // Transform every response into { data: ..., timestamp: ... }
      // map(data => ({ data, timestamp: new Date().toISOString() })),
    );
  }
}

// Global timeout interceptor — abort if handler takes > 5s
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(timeout(5000));
  }
}

// Apply globally in main.ts:
// app.useGlobalInterceptors(new ResponseWrapInterceptor());`,
    },
  },
];
