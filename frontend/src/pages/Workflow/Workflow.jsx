import { useEffect, useState } from "react";
import { FiPlus,  FiTrash2 } from "react-icons/fi";

import Button from "../../components/Buttons/Button";
import Badge from "../../components/Badge/Badge";
import Modal from "../../components/Modal/Modal";

import {
  getProjects,
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from "../../services/api";


const COLUMNS = ["To Do", "In Progress", "Testing", "Completed"];

const STATUS_MAP = {
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  Testing: "TESTING",
  Completed: "COMPLETED",
};



const COLUMN_MAP = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  TESTING: "Testing",
  COMPLETED: "Completed",
};

const columnColors = {
  "To Do": "border-t-gray-400",
  "In Progress": "border-t-blue-500",
  Testing: "border-t-purple-500",
  Completed: "border-t-green-500",
};

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const emptyCard = (projectId = "") => ({
  title: "",
  description: "",
  assignee: "",
  priority: "MEDIUM",
  column: "To Do",
  project: projectId,
  tags: ["New"],
});


const Workflow = () => {

  const [columns, setColumns] = useState({
    "To Do": [],
    "In Progress": [],
    Testing: [],
    Completed: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [draggedCard, setDraggedCard] = useState(null);
  const [sourceColumn, setSourceColumn] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  const [newCard, setNewCard] = useState(emptyCard());


  // =========================================================
  // LOAD WORKFLOWS
  // =========================================================

  const loadWorkflows = async () => {

    try {

      setLoading(true);
      setError("");

      const [workflowData, projectData] = await Promise.all([
        getWorkflows(),
        getProjects(),
      ]);

      const workflows = normalizeList(workflowData);
      const projectList = normalizeList(projectData);

      setProjects(projectList);

      setNewCard((previous) => {
        if (previous.project) {
          return previous;
        }

        return emptyCard(projectList[0]?.id || "");
      });

      const grouped = {
        "To Do": [],
        "In Progress": [],
        Testing: [],
        Completed: [],
      };

      workflows.forEach((workflow) => {

        const column =
          COLUMN_MAP[workflow.status] || "To Do";

        grouped[column].push({
          ...workflow,

          assignee: {
            name:
              workflow.assignee_name ||
              "Unassigned",

            avatar:
              (
                workflow.assignee_name ||
                "U"
              )
                .charAt(0)
                .toUpperCase(),

            color: "bg-slate-400",
          },

          priority: workflow.priority || "MEDIUM",

          tags:
            Array.isArray(workflow.tags)
              ? workflow.tags
              : [],
        });

      });

      setColumns(grouped);

    } catch (err) {

      console.error("Failed to load workflows:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to load workflows."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadWorkflows();
  }, []);


  // =========================================================
  // MOVE CARD
  // =========================================================

  const moveCard = async (
    cardId,
    fromCol,
    toCol
  ) => {

    if (fromCol === toCol) return;

    const newStatus = STATUS_MAP[toCol];

    try {

      setSaving(true);

      await updateWorkflow(cardId, {
        status: newStatus,
      });

      setColumns((prev) => {

        const card = prev[fromCol].find(
          (c) => c.id === cardId
        );

        if (!card) return prev;

        return {
          ...prev,

          [fromCol]: prev[fromCol].filter(
            (c) => c.id !== cardId
          ),

          [toCol]: [
            ...prev[toCol],
            {
              ...card,
              status: newStatus,
            },
          ],
        };

      });

    } catch (err) {

      console.error(
        "Failed to move workflow:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to update workflow status."
      );

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // DRAG START
  // =========================================================

  const handleDragStart = (
    card,
    column
  ) => {

    setDraggedCard(card);
    setSourceColumn(column);

  };


  // =========================================================
  // DROP
  // =========================================================

  const handleDrop = (
    targetColumn
  ) => {

    if (
      draggedCard &&
      sourceColumn
    ) {

      moveCard(
        draggedCard.id,
        sourceColumn,
        targetColumn
      );

    }

    setDraggedCard(null);
    setSourceColumn(null);

  };


  // =========================================================
  // ADD CARD
  // =========================================================

  const handleAddCard = async () => {

    if (!newCard.title.trim() || !newCard.project) {
      setError("Select a project before adding a card.");
      return;
    }

    try {

      setSaving(true);
      setError("");

      const payload = {
        project: Number(newCard.project),

        title: newCard.title.trim(),

        description:
          newCard.description.trim(),

        status:
          STATUS_MAP[newCard.column],

        priority:
          newCard.priority,

        tags:
          newCard.tags,
      };


      // Add assignee only when selected
      if (newCard.assignee) {

        payload.assignee =
          Number(newCard.assignee);

      }


      const created =
        await createWorkflow(payload);


      const card = {

        ...created,

        assignee: {
          name:
            created.assignee_name ||
            "Unassigned",

          avatar:
            (
              created.assignee_name ||
              "U"
            )
              .charAt(0)
              .toUpperCase(),

          color: "bg-slate-400",
        },

        priority:
          created.priority ||
          "MEDIUM",

        tags:
          Array.isArray(created.tags)
            ? created.tags
            : [],

      };


      const column =
        COLUMN_MAP[created.status] ||
        newCard.column;


      setColumns((prev) => ({
        ...prev,

        [column]: [
          ...prev[column],
          card,
        ],
      }));


      setNewCard(emptyCard(newCard.project));

      setIsAddOpen(false);

    } catch (err) {

      console.error(
        "Failed to create workflow:",
        err
      );

      setError(
        err.response?.data?.detail ||
        JSON.stringify(
          err.response?.data || {}
        ) ||
        "Failed to create workflow."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // DELETE CARD
  // =========================================================

  const handleDelete = async (
    card,
    column
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${card.title}"?`
      );

    if (!confirmed) return;


    try {

      setSaving(true);

      await deleteWorkflow(card.id);

      setColumns((prev) => ({
        ...prev,

        [column]: prev[column].filter(
          (c) => c.id !== card.id
        ),
      }));

    } catch (err) {

      console.error(
        "Failed to delete workflow:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to delete workflow."
      );

    } finally {

      setSaving(false);

    }

  };


  const totalCards =
    COLUMNS.reduce(
      (sum, col) =>
        sum + columns[col].length,
      0
    );


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="space-y-6 p-4 sm:p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Workflow Board
          </h1>

          <p className="text-sm text-gray-500">
            {totalCards} cards across {COLUMNS.length} columns
          </p>

        </div>


        <Button
          onClick={() => {
            setNewCard((previous) =>
              emptyCard(
                previous.project || projects[0]?.id || ""
              )
            );
            setIsAddOpen(true);
          }}
          disabled={saving}
        >

          <FiPlus className="h-4 w-4" />

          Add Card

        </Button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">

          {error}

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-3 font-semibold"
          >
            ×
          </button>

        </div>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-10 text-center text-sm text-slate-400">

          Loading workflows...

        </div>

      ) : (

        /* BOARD */

        <div className="flex gap-4 overflow-x-auto pb-4">

          {COLUMNS.map((column) => (

            <div
              key={column}
              className="min-w-[280px] flex-1"
              onDragOver={(e) =>
                e.preventDefault()
              }
              onDrop={() =>
                handleDrop(column)
              }
            >

              {/* COLUMN HEADER */}

              <div
                className={`mb-3 rounded-t-lg border-t-4 ${columnColors[column]} bg-slate-900 px-3 py-2 shadow-sm`}
              >

                <div className="flex items-center justify-between">

                  <h3 className="text-sm font-semibold text-slate-100">
                    {column}
                  </h3>

                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-200">

                    {columns[column].length}

                  </span>

                </div>

              </div>


              {/* CARDS */}

              <div className="min-h-[200px] space-y-3 rounded-b-lg border border-slate-700 bg-slate-900 p-2">

                {columns[column].map((card) => (

                  <div
                    key={card.id}
                    draggable
                    onDragStart={() =>
                      handleDragStart(
                        card,
                        column
                      )
                    }
                    className="cursor-grab rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-sm transition-shadow hover:border-blue-500/40 hover:shadow-md active:cursor-grabbing"
                  >

                    {/* TITLE */}

                    <div className="mb-2 flex items-start justify-between">

                      <p className="text-sm font-medium text-slate-100">
                        {card.title}
                      </p>


                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            card,
                            column
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                        title="Delete"
                      >

                        <FiTrash2 className="h-4 w-4" />

                      </button>

                    </div>


                    {/* TAGS */}

                    <div className="mb-2 flex flex-wrap gap-1">

                      {card.tags?.map(
                        (tag) => (

                          <span
                            key={tag}
                            className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-200">
                          >
                            {tag}
                          </span>

                        )
                      )}

                    </div>


                    {/* FOOTER */}

                    <div className="flex items-center justify-between">

                      <Badge
                        variant={
                          card.priority ===
                          "CRITICAL"
                            ? "danger"
                            : card.priority ===
                              "HIGH"
                            ? "warning"
                            : card.priority ===
                              "MEDIUM"
                            ? "primary"
                            : "default"
                        }
                      >

                        {card.priority}

                      </Badge>


                      <div className="flex items-center gap-2">

                        {/* MOVE BUTTONS */}

                        <div className="flex gap-1">

                          {COLUMNS
                            .filter(
                              (c) =>
                                c !== column
                            )
                            .map((c) => (

                              <button
                                key={c}
                                type="button"
                                onClick={() =>
                                  moveCard(
                                    card.id,
                                    column,
                                    c
                                  )
                                }
                                className="rounded px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                title={`Move to ${c}`}
                              >

                                →

                              </button>

                            ))}

                        </div>


                        {/* ASSIGNEE */}

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white ${card.assignee?.color || "bg-slate-400"}`}
                          title={
                            card.assignee?.name ||
                            "Unassigned"
                          }
                        >

                          {card.assignee?.avatar ||
                            "U"}

                        </div>

                      </div>

                    </div>

                  </div>

                ))}


                {columns[column].length === 0 && (

                  <div className="py-10 text-center text-xs text-slate-400">

                    No cards

                  </div>

                )}

              </div>

            </div>

          ))}

        </div>

      )}


      {/* ADD MODAL */}

      <Modal
        title="Add New Card"
        isOpen={isAddOpen}
        onClose={() =>
          setIsAddOpen(false)
        }
      >

        <div className="space-y-4">

          {/* PROJECT */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Project
            </label>

            <select
              value={newCard.project}
              onChange={(e) =>
                setNewCard({
                  ...newCard,
                  project: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Select project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              type="text"
              value={newCard.title}
              onChange={(e) =>
                setNewCard({
                  ...newCard,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Card title"
            />

          </div>


          {/* DESCRIPTION */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={newCard.description}
              onChange={(e) =>
                setNewCard({
                  ...newCard,
                  description:
                    e.target.value,
                })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Optional description"
            />

          </div>


          {/* PRIORITY */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              value={newCard.priority}
              onChange={(e) =>
                setNewCard({
                  ...newCard,
                  priority:
                    e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >

              {[
                ["LOW", "Low"],
                ["MEDIUM", "Medium"],
                ["HIGH", "High"],
                ["CRITICAL", "Critical"],
              ].map(
                ([value, label]) => (

                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>

                )
              )}

            </select>

          </div>


          {/* COLUMN */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Column
            </label>

            <select
              value={newCard.column}
              onChange={(e) =>
                setNewCard({
                  ...newCard,
                  column:
                    e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >

              {COLUMNS.map(
                (column) => (

                  <option
                    key={column}
                    value={column}
                  >
                    {column}
                  </option>

                )
              )}

            </select>

          </div>


          {/* BUTTONS */}

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() =>
                setIsAddOpen(false)
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddCard}
              disabled={
                !newCard.title.trim() ||
                !newCard.project ||
                saving
              }
            >

              {saving
                ? "Saving..."
                : "Add Card"}

            </Button>

          </div>

        </div>

      </Modal>

    </div>

  );
};


export default Workflow;