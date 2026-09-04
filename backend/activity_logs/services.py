from .models import ActivityLog


def create_activity_log(
    *,
    user,
    project,
    action,
    description,
    entity_type,
    entity_id=None,
):
    return ActivityLog.objects.create(
        user=user,
        project=project,
        action=action,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
    )