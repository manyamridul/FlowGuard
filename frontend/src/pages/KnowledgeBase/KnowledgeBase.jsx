import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBook,
  FiClock,
  FiUser,
  FiArrowRight,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";

import {
  getKnowledgeArticles,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
  getProjects,
} from "../../services/api";

const emptyArticle = {
  title: "",
  content: "",
  category: "GENERAL",
  status: "DRAFT",
  project: "",
};

const KnowledgeBase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedArticle, setSelectedArticle] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(emptyArticle);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CATEGORY COLORS
  // =========================================================

  const categoryColors = {
    GENERAL: "default",
    DEVELOPMENT: "info",
    TESTING: "warning",
    DEPLOYMENT: "orange",
    DOCUMENTATION: "primary",
    TROUBLESHOOTING: "danger",
  };

  // =========================================================
  // LOAD KNOWLEDGE ARTICLES
  // =========================================================

  const loadKnowledgeArticles = async () => {
    try {
      setLoading(true);

      const data = await getKnowledgeArticles();

      setKnowledgeArticles(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (error) {
      console.error(
        "Failed to load knowledge articles:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = async () => {
    try {
      const data = await getProjects();

      setProjects(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error.response?.data || error
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadKnowledgeArticles();
    loadProjects();
  }, []);

  useEffect(() => {
    const fromBug = location.state?.fromBug;
    if (!fromBug) return;

    setFormData({
      title: fromBug.title
        ? `Closed bug: ${fromBug.title}`
        : "",
      content:
        fromBug.description ||
        `Resolution notes for "${fromBug.title || "this bug"}".`,
      category: "TROUBLESHOOTING",
      status: "PUBLISHED",
      project: fromBug.project ? String(fromBug.project) : "",
    });
    setIsCreateOpen(true);
    navigate("/knowledge-base", { replace: true, state: {} });
  }, [location.state, navigate]);

  // =========================================================
  // FILTER ARTICLES
  // =========================================================

  const filtered = useMemo(() => {
    return knowledgeArticles.filter((article) => {
      const title = article.title || "";
      const content = article.content || "";

      const matchSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        content.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        activeCategory === "All" ||
        article.category === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [
    knowledgeArticles,
    search,
    activeCategory,
  ]);

  // =========================================================
  // CREATE ARTICLE
  // =========================================================

  const handleCreate = async () => {
    try {
      await createKnowledgeArticle({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
        ...(formData.project
          ? { project: Number(formData.project) }
          : {}),
      });

      setFormData(emptyArticle);
      setIsCreateOpen(false);

      await loadKnowledgeArticles();
    } catch (error) {
      console.error(
        "Failed to create knowledge article:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to create knowledge article."
      );
    }
  };

  // =========================================================
  // EDIT ARTICLE
  // =========================================================

  const handleEdit = async () => {
    try {
      await updateKnowledgeArticle(editingId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
        project: Number(formData.project),
      });

      setFormData(emptyArticle);
      setEditingId(null);
      setIsEditOpen(false);

      await loadKnowledgeArticles();
    } catch (error) {
      console.error(
        "Failed to update knowledge article:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to update knowledge article."
      );
    }
  };

  // =========================================================
  // DELETE ARTICLE
  // =========================================================

  const handleDelete = async () => {
    try {
      await deleteKnowledgeArticle(deletingId);

      setDeletingId(null);
      setIsDeleteOpen(false);

      if (
        selectedArticle &&
        selectedArticle.id === deletingId
      ) {
        setSelectedArticle(null);
      }

      await loadKnowledgeArticles();
    } catch (error) {
      console.error(
        "Failed to delete knowledge article:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete knowledge article."
      );
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (article) => {
    setEditingId(article.id);

    setFormData({
      title: article.title || "",
      content: article.content || "",
      category: article.category || "GENERAL",
      status: article.status || "DRAFT",
      project: article.project || "",
    });

    setIsEditOpen(true);
  };

  // =========================================================
  // OPEN DELETE
  // =========================================================

  const openDelete = (article) => {
    setDeletingId(article.id);
    setIsDeleteOpen(true);
  };

  // =========================================================
  // CLOSE FORM MODAL
  // =========================================================

  const closeFormModal = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
    setFormData(emptyArticle);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Knowledge Base
          </h1>

          <p className="text-sm text-gray-500">
            Documentation, guides, and best practices
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <FiPlus className="h-4 w-4" />
          Create Article
        </Button>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative max-w-xl">

        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

      </div>

      {/* =====================================================
          CATEGORY FILTERS
      ===================================================== */}

      <div className="flex flex-wrap gap-2">

        {[
          "All",
          "GENERAL",
          "DEVELOPMENT",
          "TESTING",
          "DEPLOYMENT",
          "DOCUMENTATION",
          "TROUBLESHOOTING",
        ].map((category) => (

          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category === "All"
              ? "All"
              : category.replace("_", " ")}
          </button>

        ))}

      </div>

      {/* =====================================================
          ARTICLE GRID
      ===================================================== */}

      {loading ? (

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

          <p className="text-sm text-slate-500">
            Loading knowledge articles...
          </p>

        </div>

      ) : filtered.length > 0 ? (

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {filtered.map((article) => (

            <Card
              key={article.id}
              className="flex flex-col"
            >

              {/* Article Header */}

              <div className="mb-3 flex items-start justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                  <FiBook className="h-5 w-5" />

                </div>

                <Badge
                  variant={
                    categoryColors[
                      article.category
                    ] || "default"
                  }
                >
                  {article.category}
                </Badge>

              </div>

              {/* Title */}

              <h3 className="mb-2 font-semibold text-gray-900">

                {article.title}

              </h3>

              {/* Content Preview */}

              <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">

                {article.content}

              </p>

              {/* Article Information */}

              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">

                <span className="flex items-center gap-1">

                  <FiUser className="h-3 w-3" />

                  {article.created_by_username ||
                    "Unknown"}

                </span>

                <span className="flex items-center gap-1">

                  <FiClock className="h-3 w-3" />

                  {formatDate(article.created_at)}

                </span>

              </div>

              {/* Read More */}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setSelectedArticle(article)
                }
              >

                Read More

                <FiArrowRight className="h-3 w-3" />

              </Button>

              {/* Edit / Delete */}

              <div className="mt-2 flex gap-2">

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    openEdit(article)
                  }
                >

                  <FiEdit2 className="h-3 w-3" />

                  Edit

                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    openDelete(article)
                  }
                >

                  <FiTrash2 className="h-3 w-3" />

                  Delete

                </Button>

              </div>

            </Card>

          ))}

        </div>

      ) : (

        <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

          <FiBook className="mx-auto h-12 w-12 text-gray-300" />

          <p className="mt-2 text-lg font-semibold text-slate-700">

            No knowledge articles available

          </p>

          <p className="mt-2 text-sm text-slate-500">

            Create your first knowledge article.

          </p>

        </div>

      )}

      {/* =====================================================
          READ ARTICLE MODAL
      ===================================================== */}

      <Modal
        title={
          selectedArticle?.title || "Article"
        }
        isOpen={!!selectedArticle}
        onClose={() =>
          setSelectedArticle(null)
        }
        size="2xl"
      >

        {selectedArticle && (

          <div>

            <div className="mb-4 flex flex-wrap items-center gap-3">

              <Badge
                variant={
                  categoryColors[
                    selectedArticle.category
                  ] || "default"
                }
              >
                {selectedArticle.category}
              </Badge>

              <Badge variant="default">
                {selectedArticle.status}
              </Badge>

              <span className="text-sm text-gray-500">

                By{" "}

                {selectedArticle.created_by_username ||
                  "Unknown"}

              </span>

              <span className="text-sm text-gray-400">

                {formatDate(
                  selectedArticle.created_at
                )}

              </span>

            </div>

            <div className="whitespace-pre-wrap leading-relaxed text-gray-700">

              {selectedArticle.content}

            </div>

          </div>

        )}

      </Modal>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Modal
        title={
          isEditOpen
            ? "Edit Article"
            : formData.title.startsWith("Closed bug:")
            ? "Add closed bug to Knowledge Base"
            : "Create Article"
        }
        isOpen={
          isCreateOpen || isEditOpen
        }
        onClose={closeFormModal}
        size="lg"
      >

        <div className="space-y-4">

          {/* Title */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">

              Article Title

            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter article title"
            />

          </div>

          {/* Project */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">

              Project

            </label>

            <select
              value={formData.project}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >

              <option value="">
                Select Project
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

          {/* Category + Status */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Category */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">

                Category

              </label>

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >

                <option value="GENERAL">
                  General
                </option>

                <option value="DEVELOPMENT">
                  Development
                </option>

                <option value="TESTING">
                  Testing
                </option>

                <option value="DEPLOYMENT">
                  Deployment
                </option>

                <option value="DOCUMENTATION">
                  Documentation
                </option>

                <option value="TROUBLESHOOTING">
                  Troubleshooting
                </option>

              </select>

            </div>

            {/* Status */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">

                Status

              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >

                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

                <option value="ARCHIVED">
                  Archived
                </option>

              </select>

            </div>

          </div>

          {/* Content */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">

              Content

            </label>

            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Write article content..."
            />

          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={closeFormModal}
            >
              Cancel
            </Button>

            <Button
              onClick={
                isEditOpen
                  ? handleEdit
                  : handleCreate
              }
              disabled={
                !formData.title.trim() ||
                !formData.content.trim() ||
                !formData.project
              }
            >

              {isEditOpen
                ? "Save Changes"
                : "Create Article"}

            </Button>

          </div>

        </div>

      </Modal>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        title="Delete Article"
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(null);
        }}
      >

        <div className="space-y-4">

          <p className="text-sm text-gray-600">

            Are you sure you want to delete this
            knowledge article?

          </p>

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingId(null);
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleDelete}>

              <FiTrash2 className="h-4 w-4" />

              Delete

            </Button>

          </div>

        </div>

      </Modal>

    </div>
  );
};

export default KnowledgeBase;