import json
import redis
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Prompt

# Redis client — shared module-level instance
r = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True,
)


def validate_prompt_data(data):
    """
    Validate prompt fields. Returns (errors_dict, None) or (None, cleaned_data).
    """
    errors = {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    complexity_raw = data.get('complexity')

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

    if errors:
        return errors, None

    return None, {'title': title, 'content': content, 'complexity': complexity}


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def prompt_list(request):
    """
    GET  /api/prompts/  — list all prompts
    POST /api/prompts/  — create a new prompt
    """
    if request.method == 'GET':
        prompts = Prompt.objects.all().values(
            'id', 'title', 'complexity', 'created_at'
        )
        data = []
        for p in prompts:
            # Attach Redis view count for each prompt
            key = f"prompt:{p['id']}:views"
            views = r.get(key)
            p['view_count'] = int(views) if views else 0
            p['created_at'] = p['created_at'].isoformat()
            data.append(p)
        return JsonResponse(data, safe=False, status=200)

    # POST — create prompt
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    errors, cleaned = validate_prompt_data(body)
    if errors:
        return JsonResponse({'errors': errors}, status=422)

    prompt = Prompt.objects.create(**cleaned)
    return JsonResponse(
        {
            'id': prompt.id,
            'title': prompt.title,
            'content': prompt.content,
            'complexity': prompt.complexity,
            'created_at': prompt.created_at.isoformat(),
            'view_count': 0,
        },
        status=201,
    )


@require_http_methods(['GET'])
def prompt_detail(request, pk):
    """
    GET /api/prompts/<pk>/  — retrieve one prompt and increment Redis view counter
    """
    try:
        prompt = Prompt.objects.get(pk=pk)
    except Prompt.DoesNotExist:
        return JsonResponse({'error': 'Prompt not found.'}, status=404)

    # Increment view count in Redis (atomic INCR)
    key = f"prompt:{prompt.id}:views"
    view_count = r.incr(key)

    return JsonResponse(
        {
            'id': prompt.id,
            'title': prompt.title,
            'content': prompt.content,
            'complexity': prompt.complexity,
            'created_at': prompt.created_at.isoformat(),
            'view_count': view_count,
        },
        status=200,
    )
