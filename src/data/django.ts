import type { Flashcard } from '../types';

export const djangoCards: Flashcard[] = [

  // ─── Django (Easy) ───────────────────────────────────────────────────────────

  {
    id: 'dj-e1',
    category: 'Django',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the Django MTV architecture? How does a request flow through it?',
    answer:
      '**MTV** stands for **Model – Template – View**. It is Django\'s take on MVC:\n\n- **Model** — defines the data structure (maps to DB tables via the ORM)\n- **Template** — the presentation layer (HTML files with Django template tags)\n- **View** — the business logic layer (receives a request, queries models, returns a response)\n\n**Request lifecycle:**\n1. Browser sends an HTTP request\n2. Django\'s `URLconf` (`urls.py`) matches the URL to a view function/class\n3. The **View** is called with the request object\n4. View queries **Models** via the ORM\n5. View passes context data to a **Template**\n6. Template renders HTML\n7. View returns an `HttpResponse` back to the browser\n\n**Middleware** wraps the entire cycle — it runs on every request/response and handles cross-cutting concerns (auth, sessions, CSRF, caching).',
    code: {
      language: 'python',
      snippet: `# models.py — defines data structure
from django.db import models

class Article(models.Model):
    title   = models.CharField(max_length=200)
    content = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# urls.py — maps URLs to views
from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.article_list, name='article-list'),
    path('articles/<int:pk>/', views.article_detail, name='article-detail'),
]

# views.py — business logic
from django.shortcuts import render, get_object_or_404

def article_list(request):
    articles = Article.objects.order_by('-created')
    return render(request, 'articles/list.html', {'articles': articles})

def article_detail(request, pk):
    article = get_object_or_404(Article, pk=pk)
    return render(request, 'articles/detail.html', {'article': article})`,
    },
  },

  {
    id: 'dj-e2',
    category: 'Django',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Django ORM? How do you perform common queries (filter, exclude, annotate, select_related)?',
    answer:
      '**Django ORM** lets you interact with the database using Python objects instead of raw SQL. Each model class maps to a DB table; each instance maps to a row.\n\n**QuerySets are lazy** — they aren\'t evaluated until you iterate, convert to a list, or call `len()`, `bool()`, etc.\n\n**Key methods:**\n- `.filter(**kwargs)` — WHERE clause\n- `.exclude(**kwargs)` — WHERE NOT\n- `.get(**kwargs)` — single object (raises `DoesNotExist` or `MultipleObjectsReturned`)\n- `.order_by(field)` — ORDER BY (`-field` for DESC)\n- `.values()` / `.values_list()` — return dicts/tuples instead of model instances\n- `.annotate()` — add computed fields per row (COUNT, SUM, AVG)\n- `.aggregate()` — compute a single value over the whole queryset\n- `.select_related()` — eager-loads ForeignKey / OneToOne in a SQL JOIN (avoids N+1)\n- `.prefetch_related()` — eager-loads ManyToMany / reverse FK with separate queries',
    code: {
      language: 'python',
      snippet: `from django.db.models import Count, Avg, Q

# Basic filtering
active_users = User.objects.filter(is_active=True)
recent       = Article.objects.filter(created__gte='2024-01-01').order_by('-created')

# Q objects for OR / complex conditions
results = Article.objects.filter(
    Q(title__icontains='python') | Q(content__icontains='python')
)

# select_related — single JOIN query (avoids N+1 for FK)
articles = Article.objects.select_related('author').all()
for a in articles:
    print(a.author.name)   # no extra DB hit per article

# prefetch_related — separate query for M2M
posts = Post.objects.prefetch_related('tags').all()

# annotate — per-row aggregation
authors = Author.objects.annotate(article_count=Count('article'))
for a in authors:
    print(a.name, a.article_count)

# aggregate — single value over entire queryset
from django.db.models import Avg
stats = Article.objects.aggregate(avg_views=Avg('view_count'))
print(stats)  # {'avg_views': 142.3}

# exists() is faster than count() for boolean checks
if Article.objects.filter(author=user).exists():
    print("User has articles")`,
    },
  },

  {
    id: 'dj-e3',
    category: 'Django',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are Django migrations? What is the difference between `makemigrations` and `migrate`?',
    answer:
      '**Migrations** are Django\'s way of tracking and applying changes to your database schema over time. They are auto-generated Python files that describe schema operations (create table, add column, etc.).\n\n**`makemigrations`** — scans your models for changes and generates new migration files. Does NOT touch the database. Safe to run anytime.\n\n**`migrate`** — applies pending migrations to the database. Executes the actual SQL DDL.\n\n**Common commands:**\n- `python manage.py makemigrations` — detect model changes and generate migration files\n- `python manage.py migrate` — apply all unapplied migrations\n- `python manage.py migrate app_name 0003` — migrate to a specific migration (forward or backward)\n- `python manage.py showmigrations` — list all migrations and their applied status\n- `python manage.py sqlmigrate app 0001` — show the SQL that a migration will run\n\n**Best practices:**\n- Always commit migration files alongside model changes\n- Never delete or edit applied migrations in production\n- Squash migrations periodically to reduce the migration chain',
    code: {
      language: 'python',
      snippet: `# 1. Change your model
class Article(models.Model):
    title    = models.CharField(max_length=200)
    content  = models.TextField()
    slug     = models.SlugField(unique=True, default='')  # new field

# 2. Generate the migration
# $ python manage.py makemigrations
# → myapp/migrations/0002_article_slug.py

# Generated migration file looks like:
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('myapp', '0001_initial')]

    operations = [
        migrations.AddField(
            model_name='article',
            name='slug',
            field=models.SlugField(default='', unique=True),
        ),
    ]

# 3. Apply it
# $ python manage.py migrate
# → Runs the SQL: ALTER TABLE myapp_article ADD COLUMN slug VARCHAR(50) NOT NULL DEFAULT '';

# Data migration — run custom Python code during migration
from django.db import migrations
from django.utils.text import slugify

def populate_slugs(apps, schema_editor):
    Article = apps.get_model('myapp', 'Article')
    for article in Article.objects.all():
        article.slug = slugify(article.title)
        article.save()

class Migration(migrations.Migration):
    operations = [migrations.RunPython(populate_slugs)]`,
    },
  },

  // ─── Django (Medium) ─────────────────────────────────────────────────────────

  {
    id: 'dj-m1',
    category: 'Django',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Django REST Framework (DRF)? Explain serializers, views, and ViewSets.',
    answer:
      '**Django REST Framework (DRF)** is the standard library for building REST APIs in Django. It provides serializers, class-based views, routers, authentication, and permissions.\n\n**Serializers** — convert model instances ↔ Python dicts ↔ JSON. They also handle validation.\n- `Serializer` — manually define each field\n- `ModelSerializer` — auto-generates fields from the model\n\n**Views:**\n- `APIView` — lowest-level CBV; you write `get()`, `post()`, etc. manually\n- Generic views (`ListCreateAPIView`, `RetrieveUpdateDestroyAPIView`) — pre-built CRUD logic\n- `ViewSet` + `Router` — automatically generates all CRUD URLs from a single class\n\n**Routers** — register a ViewSet and get all URLs generated automatically (`/articles/`, `/articles/{id}/`, etc.).',
    code: {
      language: 'python',
      snippet: `# serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model  = Article
        fields = ['id', 'title', 'content', 'author_name', 'created']
        read_only_fields = ['id', 'created']

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters.")
        return value

# views.py — ViewSet handles all CRUD automatically
from rest_framework import viewsets, permissions

class ArticleViewSet(viewsets.ModelViewSet):
    queryset           = Article.objects.select_related('author').order_by('-created')
    serializer_class   = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)   # inject current user

# urls.py — router generates all URLs
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register('articles', ArticleViewSet, basename='article')
urlpatterns = router.urls
# GET    /articles/          → list
# POST   /articles/          → create
# GET    /articles/{id}/     → retrieve
# PUT    /articles/{id}/     → update
# DELETE /articles/{id}/     → destroy`,
    },
  },

  {
    id: 'dj-m2',
    category: 'Django',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the N+1 query problem in Django? How do you detect and fix it?',
    answer:
      '**N+1 problem** — when code executes 1 query to fetch a list of N objects, then N additional queries to fetch related data for each object. Total: N+1 queries instead of 1 or 2.\n\n**Detection:**\n- `django-debug-toolbar` — shows all queries in the browser for dev\n- `django.db.connection.queries` — inspect raw queries in code\n- `assertNumQueries` in tests\n- Logging: set `django.db.backends` logger to DEBUG\n\n**Fixes:**\n- `select_related(\'fk_field\')` — SQL JOIN for ForeignKey/OneToOne (single query)\n- `prefetch_related(\'m2m_field\')` — separate optimized query for ManyToMany/reverse FK\n- `only(\'field1\', \'field2\')` — fetch only needed columns\n- `values()` / `values_list()` — skip model instantiation entirely',
    code: {
      language: 'python',
      snippet: `# ❌ N+1 problem — 1 query for articles, then 1 per article for author
articles = Article.objects.all()   # SELECT * FROM article
for article in articles:
    print(article.author.name)     # SELECT * FROM user WHERE id=? — runs N times

# ✅ Fix with select_related — single JOIN query
articles = Article.objects.select_related('author').all()
# SELECT article.*, user.* FROM article JOIN user ON ...
for article in articles:
    print(article.author.name)     # no extra query

# ✅ Fix with prefetch_related for M2M or reverse FK
posts = Post.objects.prefetch_related('tags').all()
# 2 queries total regardless of how many posts

# Detect in tests
from django.test import TestCase

class ArticleTests(TestCase):
    def test_list_no_n_plus_1(self):
        Article.objects.bulk_create([
            Article(title=f"Post {i}", author=self.user) for i in range(10)
        ])
        with self.assertNumQueries(2):   # 1 for articles, 1 for authors
            articles = Article.objects.select_related('author').all()
            list(articles)  # evaluate queryset

# only() — fetch subset of columns
articles = Article.objects.only('id', 'title')   # avoids loading large content field`,
    },
  },

  {
    id: 'dj-m3',
    category: 'Django',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does Django\'s authentication and permission system work?',
    answer:
      '**Authentication** — identifies who the user is. Django\'s built-in `User` model and session/cookie backend handle this. `request.user` is always populated (AnonymousUser if not logged in).\n\n**Authorization (Permissions)** — what the user is allowed to do. Django has two levels:\n\n1. **Model-level permissions** — auto-created per model: `add_article`, `change_article`, `delete_article`, `view_article`. Assigned via groups or directly.\n\n2. **Object-level permissions** — not built-in, requires third-party packages like `django-guardian`.\n\n**In DRF**, permissions are classes with `has_permission()` and `has_object_permission()` methods:\n- `IsAuthenticated` — must be logged in\n- `IsAuthenticatedOrReadOnly` — read-only for anonymous\n- `IsAdminUser` — staff only\n- Custom: subclass `BasePermission`\n\n**Authentication classes in DRF:** `SessionAuthentication`, `TokenAuthentication`, `JWTAuthentication` (via `djangorestframework-simplejwt`)',
    code: {
      language: 'python',
      snippet: `# Custom DRF permission
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    """Allow anyone to read; only the owner can write."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:   # GET, HEAD, OPTIONS
            return True
        return obj.author == request.user    # write access only for owner

# Apply to a ViewSet
class ArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

# JWT setup with simplejwt
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns = [
    path('api/token/',         TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]

# Checking permissions in views
if request.user.has_perm('myapp.change_article'):
    ...
if request.user.groups.filter(name='editors').exists():
    ...`,
    },
  },

  {
    id: 'dj-m4',
    category: 'Django',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Django\'s caching framework? What are the available backends and strategies?',
    answer:
      '**Caching** in Django is configured via `CACHES` in `settings.py`. The framework provides a unified API regardless of backend.\n\n**Built-in backends:**\n- `LocMemCache` — in-process memory (default, per-process, not shared)\n- `FileBasedCache` — stores in filesystem\n- `MemcachedCache` / `PyMemcacheCache` — Memcached\n- `RedisCache` — Redis (via `django-redis`)\n- `DatabaseCache` — stores in a DB table\n\n**Caching strategies:**\n1. **Per-site cache** — caches every page (middleware)\n2. **Per-view cache** — `@cache_page(timeout)` decorator\n3. **Template fragment cache** — `{% cache timeout key %}` tag\n4. **Low-level cache API** — `cache.get()`, `cache.set()`, `cache.delete()` for fine-grained control\n\n**Cache invalidation** is the hard part — use meaningful keys and versioning (`cache.set(key, value, version=2)`).',
    code: {
      language: 'python',
      snippet: `# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'TIMEOUT': 300,   # default 5 minutes
    }
}

# Per-view caching
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)   # cache for 15 minutes
def article_list(request):
    articles = Article.objects.all()
    return render(request, 'list.html', {'articles': articles})

# Low-level cache API
from django.core.cache import cache

def get_trending_articles():
    key = 'trending_articles'
    articles = cache.get(key)
    if articles is None:
        articles = list(Article.objects.order_by('-views')[:10])
        cache.set(key, articles, timeout=300)
    return articles

# Cache invalidation on save
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Article)
def invalidate_article_cache(sender, instance, **kwargs):
    cache.delete('trending_articles')
    cache.delete(f'article_{instance.pk}')`,
    },
  },

  // ─── Django (Hard) ───────────────────────────────────────────────────────────

  {
    id: 'dj-h1',
    category: 'Django',
    difficulty: 'hard',
    type: 'basics',
    question: 'How do you handle database transactions in Django? What is `select_for_update`?',
    answer:
      '**Transactions** ensure a group of database operations either all succeed or all fail (atomicity). Django wraps each HTTP request in a transaction by default when `ATOMIC_REQUESTS = True`, but typically you manage them manually.\n\n**`@transaction.atomic`** / `with transaction.atomic()` — marks a block as a single transaction. Any exception rolls back all changes within the block.\n\n**`select_for_update()`** — issues a `SELECT ... FOR UPDATE` SQL statement, locking the selected rows until the transaction commits. Prevents race conditions when multiple processes read and then write the same row.\n\n**Savepoints** — `atomic()` blocks can be nested. Each nested block creates a savepoint; an inner exception rolls back to the savepoint without rolling back the outer transaction.\n\n**`on_commit()` hooks** — run callbacks after the transaction successfully commits (e.g., send email, trigger async task). Don\'t fire if the transaction rolls back.',
    code: {
      language: 'python',
      snippet: `from django.db import transaction

# Atomic block — all-or-nothing
def transfer_funds(from_account_id, to_account_id, amount):
    with transaction.atomic():
        # select_for_update locks these rows until transaction ends
        from_acc = Account.objects.select_for_update().get(pk=from_account_id)
        to_acc   = Account.objects.select_for_update().get(pk=to_account_id)

        if from_acc.balance < amount:
            raise ValueError("Insufficient funds")

        from_acc.balance -= amount
        to_acc.balance   += amount
        from_acc.save()
        to_acc.save()
        # If any exception is raised, both saves are rolled back

# on_commit — send email only if transaction succeeds
def create_order(cart):
    with transaction.atomic():
        order = Order.objects.create(user=cart.user)
        OrderItem.objects.bulk_create([
            OrderItem(order=order, product=item.product, qty=item.qty)
            for item in cart.items.all()
        ])
        # This runs AFTER the transaction commits, not inside it
        transaction.on_commit(lambda: send_confirmation_email.delay(order.pk))

# Nested atomic — inner savepoint
def complex_operation():
    with transaction.atomic():        # outer transaction
        do_step_one()
        try:
            with transaction.atomic():    # inner savepoint
                do_risky_step()
        except Exception:
            pass                     # inner rolled back, outer continues
        do_step_three()`,
    },
  },

  {
    id: 'dj-h2',
    category: 'Django',
    difficulty: 'hard',
    type: 'basics',
    question: 'How do you scale a Django application? What are common performance patterns?',
    answer:
      '**Database optimizations:**\n- Add indexes on frequently filtered/ordered columns (`db_index=True`)\n- Use `select_related` / `prefetch_related` to eliminate N+1 queries\n- Use `only()` / `defer()` to limit fetched columns\n- Read replicas — route read queries to replicas using database routers\n- Connection pooling (PgBouncer for PostgreSQL)\n\n**Async task queues:**\n- Celery + Redis/RabbitMQ for background tasks (email, reports, slow APIs)\n- Never do slow work in the request/response cycle\n\n**Caching:**\n- Cache expensive querysets with Redis\n- Cache rendered template fragments\n- Use CDN for static/media files\n\n**Horizontal scaling:**\n- Stateless Django processes behind a load balancer\n- Shared session backend (Redis)\n- Shared media storage (S3)\n\n**Async Django (3.1+):**\n- `async def` views, async ORM (`await Article.objects.afilter()`)\n- Use with ASGI server (Uvicorn/Daphne) for high-concurrency I/O',
    code: {
      language: 'python',
      snippet: `# Database router — send reads to replica
class ReadReplicaRouter:
    read_db = 'replica'
    write_db = 'default'

    def db_for_read(self, model, **hints):
        return self.read_db

    def db_for_write(self, model, **hints):
        return self.write_db

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, **hints):
        return db == self.write_db

# settings.py
DATABASE_ROUTERS = ['myapp.routers.ReadReplicaRouter']

# Celery — offload slow tasks
from celery import shared_task

@shared_task
def generate_report(report_id):
    report = Report.objects.get(pk=report_id)
    data   = heavy_computation(report)
    report.result = data
    report.status = 'done'
    report.save()

# In view — kick off task, return immediately
def request_report(request):
    report = Report.objects.create(user=request.user, status='pending')
    generate_report.delay(report.pk)   # async, non-blocking
    return JsonResponse({'report_id': report.pk, 'status': 'processing'})

# Async view (Django 4+ with ASGI)
async def async_article_list(request):
    articles = [a async for a in Article.objects.order_by('-created')[:20]]
    return JsonResponse({'articles': [a.title for a in articles]})`,
    },
  },

  {
    id: 'dj-h3',
    category: 'Django',
    difficulty: 'hard',
    type: 'basics',
    question: 'What are Django signals? When should you use them and when should you avoid them?',
    answer:
      '**Signals** allow decoupled components to be notified when certain actions occur. The sender broadcasts a signal; any number of receivers (functions) can listen and react.\n\n**Built-in signals:**\n- `pre_save` / `post_save` — before/after a model\'s `.save()`\n- `pre_delete` / `post_delete` — before/after `.delete()`\n- `m2m_changed` — when a M2M relation changes\n- `request_started` / `request_finished` — at request boundaries\n- `post_migrate` — after migrations run\n\n**When to use signals:**\n- Decoupling reusable apps (e.g., `django-allauth` hooks)\n- Cross-cutting concerns (audit logs, cache invalidation)\n- When you can\'t modify the sender\'s code\n\n**When NOT to use signals:**\n- When the sender and receiver are in the same app — just call the function directly\n- For complex business logic — signals are hard to trace, test, and debug\n- When you need the return value — signals don\'t naturally return data to the sender\n\n**Always** specify `sender=` to avoid receiving signals from all models.',
    code: {
      language: 'python',
      snippet: `from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

# Auto-create a Profile when a User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Invalidate cache when an article changes
@receiver(post_save, sender=Article)
@receiver(post_delete, sender=Article)
def invalidate_article_cache(sender, instance, **kwargs):
    cache.delete(f'article_{instance.pk}')
    cache.delete('article_list')

# Register signals in AppConfig (preferred over top-level imports)
# myapp/apps.py
from django.apps import AppConfig

class MyAppConfig(AppConfig):
    name = 'myapp'

    def ready(self):
        import myapp.signals   # connects all receivers in signals.py

# Custom signal
from django.dispatch import Signal

order_completed = Signal()   # can pass providing_args=['order'] (Django 4+: just docs)

# Send it
def complete_order(order):
    order.status = 'completed'
    order.save()
    order_completed.send(sender=Order, order=order)

# Receive it (in another app — decoupled!)
@receiver(order_completed)
def notify_warehouse(sender, order, **kwargs):
    WarehouseTask.objects.create(order=order)`,
    },
  },
];
