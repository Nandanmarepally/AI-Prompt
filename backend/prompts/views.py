import json
import datetime

import jwt
import redis
from django.conf import settings
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Prompt, Tag

# ── Redis client ─────────────────────────────────────────────────────────────
r = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True,
)


# ── JWT helpers ───────────────────────────────────────────────────────────────
JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24


def _make_token(user):
    payload = {
        'user_id': user.pk,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str):
    """Returns decoded payload or raises jwt.PyJWTError."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def _get_token_from_request(request):
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return None


def jwt_required(view_fn):
    """Decorator — returns 401 if a valid Bearer JWT is not present."""
    def wrapper(request, *args, **kwargs):
        token = _get_token_from_request(request)
        if not token:
            return JsonResponse({'error': 'Authentication required.'}, status=401)
        try:
            payload = _decode_token(token)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired.'}, status=401)
        except jwt.PyJWTError:
            return JsonResponse({'error': 'Invalid token.'}, status=401)
        request.jwt_payload = payload
        return view_fn(request, *args, **kwargs)
    wrapper.__name__ = view_fn.__name__
    return wrapper


# ── Validation ────────────────────────────────────────────────────────────────
def validate_prompt_data(data):
    """
    Validate prompt fields.
    Returns (errors_dict, None) or (None, cleaned_data).
    """
    errors = {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    complexity_raw = data.get('complexity')
    tags_raw = data.get('tags', [])

    if not title:
        errors['title'] = 'Title is required.'
    elif len(title) < 3:
        errors['title'] = 'Title must be at least 3 characters.'
    elif len(title) > 255:
        errors['title'] = 'Title must be 255 characters or fewer.'

    if not content:
        errors['content'] = 'Content is required.'
    elif len(content) < 20:
        errors['content'] = 'Content must be at least 20 characters.'

    try:
        complexity = int(complexity_raw)
        if complexity < 1 or complexity > 10:
            errors['complexity'] = 'Complexity must be between 1 and 10.'
    except (TypeError, ValueError):
        errors['complexity'] = 'Complexity must be a number between 1 and 10.'
        complexity = None

    # tags must be a list of non-empty strings
    if not isinstance(tags_raw, list):
        errors['tags'] = 'Tags must be an array of strings.'
        tags_raw = []
    else:
        tags_raw = [t.strip().lower() for t in tags_raw if isinstance(t, str) and t.strip()]

    if errors:
        return errors, None

    return None, {
        'title': title,
        'content': content,
        'complexity': complexity,
        'tags': tags_raw,
    }


def _prompt_to_dict(prompt: Prompt, view_count: int = 0) -> dict:
    return {
        'id': prompt.id,
        'title': prompt.title,
        'content': prompt.content,
        'complexity': prompt.complexity,
        'tags': list(prompt.tags.values_list('name', flat=True)),
        'created_at': prompt.created_at.isoformat(),
        'view_count': view_count,
    }


# ── Auth endpoints ─────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    Returns: { "token": "<jwt>" }
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    username = body.get('username', '').strip()
    password = body.get('password', '')

    if not username or not password:
        return JsonResponse({'error': 'username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'error': 'Invalid credentials.'}, status=401)

    token = _make_token(user)
    return JsonResponse({'token': token, 'username': user.username}, status=200)


@require_http_methods(['POST'])
def logout_view(request):
    """POST /api/auth/logout/ — stateless JWT, just signal client to discard token."""
    return JsonResponse({'message': 'Logged out.'}, status=200)


# ── Prompt endpoints ──────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def prompt_list(request):
    """
    GET  /api/prompts/?tag=<name>  — list all prompts (optional tag filter)
    POST /api/prompts/             — create a new prompt (JWT required)
    """
    if request.method == 'GET':
        qs = Prompt.objects.prefetch_related('tags').all()

        tag_filter = request.GET.get('tag', '').strip().lower()
        if tag_filter:
            qs = qs.filter(tags__name=tag_filter)

        data = []
        for p in qs:
            key = f'prompt:{p.id}:views'
            views = r.get(key)
            data.append(_prompt_to_dict(p, int(views) if views else 0))

        return JsonResponse(data, safe=False, status=200)

    # POST — protected by JWT
    token = _get_token_from_request(request)
    if not token:
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    try:
        _decode_token(token)
    except jwt.PyJWTError:
        return JsonResponse({'error': 'Invalid or expired token.'}, status=401)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    errors, cleaned = validate_prompt_data(body)
    if errors:
        return JsonResponse({'errors': errors}, status=422)

    tag_names = cleaned.pop('tags', [])
    prompt = Prompt.objects.create(**cleaned)

    # Resolve / create tags and attach
    for name in tag_names:
        tag, _ = Tag.objects.get_or_create(name=name)
        prompt.tags.add(tag)

    return JsonResponse(_prompt_to_dict(prompt, 0), status=201)


@require_http_methods(['GET'])
def prompt_detail(request, pk):
    """
    GET /api/prompts/<pk>/  — retrieve one prompt and increment Redis view counter
    """
    try:
        prompt = Prompt.objects.prefetch_related('tags').get(pk=pk)
    except Prompt.DoesNotExist:
        return JsonResponse({'error': 'Prompt not found.'}, status=404)

    key = f'prompt:{prompt.id}:views'
    view_count = r.incr(key)

    return JsonResponse(_prompt_to_dict(prompt, view_count), status=200)


@require_http_methods(['GET'])
def tag_list(request):
    """
    GET /api/tags/  — list all tags (for filter UI)
    """
    tags = list(Tag.objects.values_list('name', flat=True))
    return JsonResponse(tags, safe=False, status=200)
