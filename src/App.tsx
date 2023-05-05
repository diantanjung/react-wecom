import React, {useState} from 'react';
import Home from './pages/Home';
import Login from "./pages/Login"
import LoginGithub from "./pages/LoginGithub"
import RunFunc from "./pages/RunFunc";
import Psaux from "./pages/Psaux";
import "./App.css";
import {Route, Routes } from "react-router-dom"
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  NO_GROUP
} from "kbar";

function App() {
  const [username, setUsername] = useState(localStorage.username || 'muhammad');
  const actions = [
    {
      id: "blog",
      name: "Blog",
      shortcut: ["b"],
      keywords: "writing words",
      perform: () => (window.location.pathname = "blog"),
    },
    {
      id: "contact",
      name: "Contact",
      shortcut: ["c"],
      keywords: "email",
      perform: () => (window.location.pathname = "contact"),
    },
  ]

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator>
            <KBarSearch />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      <div>
          <div>
              <Routes>
                <Route path="/" element={<Home username={username} setUsername={setUsername}/>} > </Route>
                <Route path="/@:username" element={<RunFunc />}></Route>
                <Route path="/login-old" element={<Login />}></Route>
                <Route path="/login" element={<LoginGithub setUsername={setUsername}/>} ></Route>
                <Route path="/ps-aux" element={<Psaux />}></Route>

              </Routes>
          </div>
      </div>
    </KBarProvider>
  );
}

export default App;
