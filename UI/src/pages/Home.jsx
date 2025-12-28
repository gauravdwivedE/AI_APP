import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function Home() {
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = { firstName: "" };

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChat = conversations.find((c) => c.chat === activeChatId);

  const [message, setMessage] = useState("");

  const [newChatTitle, setNewChatTitle] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const [aiTyping, setAiTyping] = useState(false);

  // ★ NEW: LOADING MESSAGES STATE
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ★ SCROLL REF + FUNCTION
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ★ SEND MESSAGE
  const sendMessage = () => {
    if (!activeChatId) {
      showToast("Please select a chat first.");
      return;
    }

    if (!message.trim() || !socket) return;

    const newUserMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    socket.emit("ai-message", {
      chat: activeChatId,
      content: message,
    });

    setConversations((prev) =>
      prev.map((conv) =>
        conv.chat === activeChatId
          ? { ...conv, messages: [...conv.messages, newUserMsg] }
          : conv
      )
    );

    setMessage("");
    setAiTyping(true);
  };

  // ★ CREATE CHAT
  const createChat = async () => {
    setLoadingChats(true);
    try {
      if (!newChatTitle.trim()) return;

      const res = await axios.post(
        "http://localhost:3000/api/chats",
        { title: newChatTitle },
        { withCredentials: true }
      );

      const newChat = res.data.chat;

      setChats((prev) => [{ _id: newChat._id, title: newChat.title }, ...prev]);

      setConversations((prev) => [
        { chat: newChat._id, messages: [] },
        ...prev,
      ]);

      setActiveChatId(newChat._id);
      setNewChatTitle("");
      setShowNewChatModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingChats(false);
    }
  };

  // ★ LOAD CHATS INITIALLY + SETUP SOCKET
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await axios.get("http://localhost:3000/api/chats", {
          withCredentials: true,
        });

        setChats(res.data.chats);

        setConversations(
          res.data.chats.map((c) => ({
            chat: c._id,
            messages: [],
          }))
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingChats(false);
      }
    }

    fetchChats();

    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    setSocket(tempSocket);

    return () => tempSocket.disconnect();
  }, []);

  // ★ RECEIVE AI RESPONSE
  useEffect(() => {
    if (!socket) return;

    const aiHandler = (data) => {
      const aiReply = {
        id: crypto.randomUUID(),
        role: "model",
        text: data.content,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.chat === data.chat
            ? { ...conv, messages: [...conv.messages, aiReply] }
            : conv
        )
      );

      setAiTyping(false);
    };

    socket.on("ai-response", aiHandler);
    return () => socket.off("ai-response", aiHandler);
  }, [socket]);

  // ★ FETCH MESSAGES WHEN SELECTING CHAT (WITH LOADING)
  useEffect(() => {
    if (!activeChatId) return;

    async function loadMessages() {
      try {
        setLoadingMessages(true); // <-- START LOADING

        const res = await axios.get(
          `http://localhost:3000/api/chats/${activeChatId}/messages`,
          
          { withCredentials: true }
        );

        const msgs = res.data.messages.map((m) => ({
          id: m._id,
          role: m.role,
          text: m.content,
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.chat === activeChatId ? { ...c, messages: msgs } : c
          )
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingMessages(false); // <-- STOP LOADING
      }
    }

    loadMessages();
  }, [activeChatId]);

  // ★ AUTO SCROLL WHEN MESSAGES CHANGE
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, aiTyping]);

  return (
    <>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl z-50">
          {toast}
        </div>
      )}

      <div className="min-h-screen w-full bg-black text-white flex flex-col md:flex-row relative">
        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static z-30 top-0 left-0
            h-full md:h-screen overflow-y-auto
            w-3/4 md:w-64
            bg-neutral-950/70 border-r border-white/10 backdrop-blur-xl p-4
            transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-2 right-4 p-2 "
          >
            ✕
          </button>

          <div className="flex items-center justify-between mt-10 md:mt-0 mb-6">
            <h1 className="text-xl font-semibold text-white/90">Aloha</h1>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-1 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-md transition border border-indigo-500/40"
            >
              + 
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {loadingChats ? (
              <div className="flex justify-center mt-10">
                <div className="w-6 h-6 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <p className="text-center text-white/40 mt-10">No chats yet</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setActiveChatId(chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition 
                    ${
                      activeChatId === chat._id
                        ? "bg-indigo-600/30 border-indigo-500/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                >
                  <p className="text-sm text-white/90 overflow-auto">{chat.title}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col items-center p-4">
          <div className="w-full max-w-3xl flex flex-col flex-1 mt-6">

            <div className="mb-6 text-center">
              <h2 className="text-3xl font-semibold text-white/90">
                Hello, {user.firstName} 👋
              </h2>
            </div>

            {/* ★ CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto max-h-[70vh] space-y-4 px-2">

              {/* ★ SHOW SPINNER WHEN LOADING */}
              {loadingMessages ? (
                <div className="w-full flex justify-center items-center py-10">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* {activeChat?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                          max-w-[85%] sm:max-w-[75%] p-3 text-sm rounded-2xl border backdrop-blur-xl
                          ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none"
                              : "bg-white/10 text-white/90 border-white/10 rounded-bl-none"
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))} */}

                  {activeChat?.messages.map((msg) => (
  <div
    key={msg.id}
    className={`flex w-full gap-3 ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    {/* AI Avatar */}
    {msg.role !== "user" && (
      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        🤖
      </div>
    )}

    {/* MESSAGE BUBBLE */}
    <div
      className={`
        max-w-[80%] p-4 text-sm rounded-2xl border backdrop-blur-xl
        prose prose-invert prose-pre:bg-black prose-pre:border prose-pre:border-white/30
        ${
          msg.role === "user"
            ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none"
            : "bg-white/10 text-white/90 border-white/10 rounded-bl-none"
        }
      `}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {msg.text}
      </ReactMarkdown>
    </div>

    {/* USER Avatar */}
    {msg.role === "user" && (
      <div className="w-9 h-9 rounded-full bg-indigo-600 border border-indigo-500 flex items-center justify-center">
        🧑
      </div>
    )}
  </div>
))}


                  {aiTyping && (
                    <div className="flex w-full justify-start">
                      <div className="max-w-[60%] p-3 text-sm rounded-2xl border bg-white/10 border-white/10 rounded-bl-none text-white/70 animate-pulse">
                        Thinking...
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ★ SCROLL ANCHOR */}
              <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT BOX */}
            <div className="mt-6 w-full px-1 sm:px-0">
              <div className="relative flex items-center">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 pl-6 pr-24 rounded-full bg-white/5 border border-white/10 text-white placeholder-neutral-500
                  shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Type your message..."
                />

                <button
                  onClick={sendMessage}
                  className="absolute right-3 bg-indigo-600 hover:bg-indigo-500 transition px-5 py-2 rounded-full text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* NEW CHAT MODAL */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-6 rounded-2xl w-80 border border-white/10">
              <h2 className="text-lg font-semibold mb-3 text-white">New Chat</h2>

              <input
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Enter chat name..."
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  Cancel
                </button>

            {!loadingChats ? (
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                  onClick={createChat}
                >
                  Create
                 </button>
          ):
            (
            <div className="px-4 py-2 bg-indigo-500 rounded-lg flex justify-center">
               <div className="w-6 h-6 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>                  
          )
      }
                
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
