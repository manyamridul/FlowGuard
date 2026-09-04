import requests

from django.db.models import Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from projects.models import Project
from tasks.models import Task
from bugs.models import Bug
from workflow.models import Workflow


class AISprintAssistantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get("message", "").strip()

        if not user_message:
            return Response(
                {"error": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        today = timezone.localdate()

        # =====================================================
        # 1. GET PROJECTS ACCESSIBLE TO CURRENT USER
        # =====================================================

        projects = (
            Project.objects
            .filter(
                Q(members__user=user) |
                Q(created_by=user)
            )
            .distinct()
            .order_by("-created_at")
        )

        project_ids = list(
            projects.values_list("id", flat=True)
        )

        # =====================================================
        # 2. GET TASKS
        # =====================================================

        tasks = (
            Task.objects
            .filter(project_id__in=project_ids)
            .select_related(
                "project",
                "assigned_to",
                "created_by",
            )
            .order_by("-created_at")
        )

        # =====================================================
        # 3. GET BUGS
        # =====================================================

        bugs = (
            Bug.objects
            .filter(project_id__in=project_ids)
            .select_related(
                "project",
                "assigned_to",
                "reported_by",
            )
            .order_by("-created_at")
        )

        # =====================================================
        # 4. GET WORKFLOWS
        # =====================================================

        workflows = (
            Workflow.objects
            .filter(project_id__in=project_ids)
            .select_related(
                "project",
                "assignee",
            )
            .order_by("-created_at")
        )

        # =====================================================
        # 5. BUILD PROJECT CONTEXT
        # =====================================================

        project_context = []

        for project in projects:
            project_context.append(
                f"""
PROJECT
- ID: {project.id}
- Name: {project.name}
- Status: {project.get_status_display()}
- Priority: {project.get_priority_display()}
- Start Date: {project.start_date or "Not set"}
- Due Date: {project.due_date or "Not set"}
- Created By: {project.created_by.username}
"""
            )

        # =====================================================
        # 6. BUILD TASK CONTEXT
        # =====================================================

        task_context = []

        for task in tasks:
            assigned_user = (
                task.assigned_to.username
                if task.assigned_to
                else "Unassigned"
            )

            due_status = "No due date"

            if task.due_date:
                if task.due_date < today:
                    due_status = "OVERDUE"
                elif task.due_date == today:
                    due_status = "DUE TODAY"
                else:
                    due_status = "Upcoming"

            task_context.append(
                f"""
TASK
- ID: {task.id}
- Title: {task.title}
- Project: {task.project.name}
- Status: {task.get_status_display()}
- Priority: {task.get_priority_display()}
- Assigned To: {assigned_user}
- Due Date: {task.due_date or "Not set"}
- Deadline Status: {due_status}
"""
            )

        # =====================================================
        # 7. BUILD BUG CONTEXT
        # =====================================================

        bug_context = []

        for bug in bugs:
            assigned_user = (
                bug.assigned_to.username
                if bug.assigned_to
                else "Unassigned"
            )

            bug_context.append(
                f"""
BUG
- ID: {bug.id}
- Title: {bug.title}
- Project: {bug.project.name}
- Status: {bug.get_status_display()}
- Severity: {bug.get_severity_display()}
- Priority: {bug.get_priority_display()}
- Assigned To: {assigned_user}
"""
            )

        # =====================================================
        # 8. BUILD WORKFLOW CONTEXT
        # =====================================================

        workflow_context = []

        for workflow in workflows:
            assigned_user = (
                workflow.assignee.username
                if workflow.assignee
                else "Unassigned"
            )

            workflow_context.append(
                f"""
WORKFLOW
- ID: {workflow.id}
- Title: {workflow.title}
- Project: {workflow.project.name}
- Status: {workflow.get_status_display()}
- Priority: {workflow.get_priority_display()}
- Assignee: {assigned_user}
- Tags: {workflow.tags}
"""
            )

        # =====================================================
        # 9. COMPLETE FLOWGUARD CONTEXT
        # =====================================================

        context = f"""
=====================================================
FLOWGUARD WORKSPACE DATA
=====================================================

CURRENT DATE:
{today}

-----------------------------------------------------
PROJECTS
-----------------------------------------------------

{
    chr(10).join(project_context)
    if project_context
    else "No projects found."
}

-----------------------------------------------------
TASKS
-----------------------------------------------------

{
    chr(10).join(task_context)
    if task_context
    else "No tasks found."
}

-----------------------------------------------------
BUGS
-----------------------------------------------------

{
    chr(10).join(bug_context)
    if bug_context
    else "No bugs found."
}

-----------------------------------------------------
WORKFLOWS
-----------------------------------------------------

{
    chr(10).join(workflow_context)
    if workflow_context
    else "No workflows found."
}

=====================================================
END FLOWGUARD DATA
=====================================================
"""

        # =====================================================
        # 10. AI PROMPT
        # =====================================================

        prompt = f"""
You are the AI Sprint Assistant for FlowGuard.

FlowGuard is a project management and team workflow
management platform.

You are assisting the authenticated FlowGuard user.

Your job is to help with:

- Sprint planning
- Task prioritization
- Bug analysis
- Project management
- Workflow improvement
- Deadline tracking
- Identifying overdue work
- Identifying critical risks
- Team workload analysis

IMPORTANT RULES:

1. Use ONLY the FlowGuard workspace data provided below
   when answering questions about the user's workspace.

2. NEVER invent:
   - Projects
   - Tasks
   - Bugs
   - Workflows
   - Users
   - Dates
   - Priorities
   - Statuses

3. If the requested information does not exist in the
   provided data, clearly say:
   "I don't have that information in the available
   FlowGuard data."

4. When prioritizing work, consider:
   - CRITICAL priority
   - HIGH priority
   - Critical/high severity bugs
   - IN_PROGRESS work
   - BLOCKED work
   - Overdue deadlines
   - Deadlines due today

5. If multiple items have the same priority, use deadline
   and status as additional factors.

6. Give concise and practical answers.

7. Use bullet points when appropriate.

8. When recommending tasks, include the task title and
   relevant reason.

9. When discussing bugs, include severity and priority.

10. When discussing deadlines, use the current date provided
    in the workspace data.

11. Do not expose internal implementation details such as
    database queries, API calls, Python code, or Ollama.

12. Do not claim that you performed an action unless the
    system actually performed that action.

13. You are an assistant, not an automatic task executor.
    Recommendations should not modify FlowGuard data.

=====================================================
FLOWGUARD DATA
=====================================================

{context}

=====================================================
USER QUESTION
=====================================================

{user_message}

=====================================================
ANSWER
=====================================================

Give the best practical answer based on the FlowGuard
workspace data.
"""

        # =====================================================
        # 11. CALL OLLAMA
        # =====================================================

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:3b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                    },
                },
                timeout=120,
            )

            response.raise_for_status()

            data = response.json()

            ai_response = data.get(
                "response",
                "I could not generate a response.",
            )

            return Response(
                {
                    "response": ai_response.strip(),
                },
                status=status.HTTP_200_OK,
            )

        # =====================================================
        # OLLAMA NOT RUNNING
        # =====================================================

        except requests.exceptions.ConnectionError:
            return Response(
                {
                    "error": (
                        "Ollama is not running. "
                        "Please start Ollama and try again."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # =====================================================
        # OLLAMA TIMEOUT
        # =====================================================

        except requests.exceptions.Timeout:
            return Response(
                {
                    "error": (
                        "AI request timed out. "
                        "Please try again."
                    )
                },
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )

        # =====================================================
        # OTHER OLLAMA ERROR
        # =====================================================

        except requests.exceptions.RequestException as error:
            return Response(
                {
                    "error": f"AI service error: {str(error)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )