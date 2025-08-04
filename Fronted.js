// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default instance;

// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;

// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;

// src/pages/Login.js
import React, { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;

// src/pages/Register.js
import React, { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", { username, email, password });
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;

// src/pages/Feed.js
import React, { useEffect, useState } from "react";
import axios from "../axios";

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("/posts").then(res => setPosts(res.data));
  }, []);

  return (
    <div>
      <h2>Feed</h2>
      {posts.map(post => (
        <div key={post._id}>
          <h4>{post.author.username}</h4>
          <p>{post.content}</p>
          {post.mediaUrl && <img src={post.mediaUrl} alt="post" style={{ maxWidth: 300 }} />}
        </div>
      ))}
    </div>
  );
}

export default Feed;

// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../axios";

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios.get(`/users/${id}`).then(res => setProfile(res.data));
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>{profile.username}</h2>
      <p>{profile.bio}</p>
    </div>
  );
}

export default Profile;

// src/pages/Chat.js
import React, { useEffect, useState } from "react";
import socket from "../socket";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.connect();
    socket.on("message", msg => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <div>
      <h2>Real-time Chat</h2>
      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;

// src/pages/Analytics.js
import React, { useEffect, useState } from "react";
import axios from "../axios";

function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("/analytics").then(res => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Analytics</h2>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Posts Shared: {stats.totalPosts}</p>
    </div>
  );
}

export default Analytics;

// src/pages/Notifications.js
import React, { useEffect, useState } from "react";
import axios from "../axios";

function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    axios.get("/notifications").then(res => setNotifs(res.data));
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifs.map((n, idx) => (
        <div key={idx}>{n.text}</div>
      ))}
    </div>
  );
}

export default Notifications;
