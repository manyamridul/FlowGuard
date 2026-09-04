import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiUser } from "react-icons/fi";
import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { askAISprintAssistant } from "../../services/api";

const suggestedPrompts = [
  "Help me plan the next sprint",
  "Summarize open bugs by priority",
  "Suggest task breakdown for auth feature",
  "What are the upcoming deadlines?",
  "Generate standup update template",
  "Review team workload balance",
];

const AISprintAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI Sprint Assistant. I can help you plan sprints, prioritize tasks, analyze bugs, and optimize your team's workflow. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await askAISprintAssistant(trimmed);

      const aiResponse =
        data?.response || "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      const errorMessage =
        error?.response?.data?.error ||
        "Unable to connect to the AI assistant. Please make sure Ollama is running.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <FiCpu className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Sprint Assistant
            </h1>

            <p className="text-sm text-gray-500">
              Powered by Ollama AI
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CHAT CARD */}
      <Card
        noPadding
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* ================= CHAT AREA ================= */}
        <div
          ref={chatContainerRef}
          className="
            min-h-0
            flex-1
            overflow-y-scroll
            overscroll-contain
            scroll-smooth
            touch-pan-y
            p-4
            sm:p-6
          "
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full gap-3 ${
                  msg.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                {/* AVATAR */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <FiUser className="h-4 w-4" />
                  ) : (
                    <FiCpu className="h-4 w-4" />
                  )}
                </div>

                {/* MESSAGE */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <FiCpu className="h-4 w-4" />
                </div>

                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0ms" }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "150ms" }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SCROLL TARGET */}
            <div
              ref={messagesEndRef}
              className="h-px w-full shrink-0"
            />
          </div>
        </div>

        {/* ================= SUGGESTED PROMPTS ================= */}
        {messages.length <= 1 && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-3 sm:px-6">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Suggested prompts
            </p>

            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isTyping}
                  className="
                    rounded-full
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-1.5
                    text-xs
                    text-gray-600
                    transition-colors
                    hover:border-blue-300
                    hover:bg-blue-50
                    hover:text-blue-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= INPUT ================= */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6"
        >
          <div className="mx-auto flex w-full max-w-3xl gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your sprint..."
              disabled={isTyping}
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-500
                disabled:bg-gray-100
              "
            />

            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0 px-4"
            >
              <FiSend className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AISprintAssistant;