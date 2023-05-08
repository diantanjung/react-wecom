import React, {useState} from 'react';
import Home from './pages/Home';
import Login from "./pages/Login"
import LoginGithub from "./pages/LoginGithub"
import RunFunc from "./pages/RunFunc";
import Psaux from "./pages/Psaux";
import "./App.css";
import {Route, Routes } from "react-router-dom"
import Openai from './pages/Openai';

function App() {
  const [username, setUsername] = useState(localStorage.username || 'guest');

  return (
    <div>
        <div>
          <Routes>
            <Route path="/" element={<Home username={username} setUsername={setUsername}/>} > </Route>
            <Route path="/@:username" element={<RunFunc />}></Route>
            <Route path="/login-old" element={<Login />}></Route>
            <Route path="/login" element={<LoginGithub setUsername={setUsername}/>} ></Route>
            <Route path="/ps-aux" element={<Psaux />}></Route>
            <Route path="/open-ai" element={<Openai />}></Route>
          </Routes>
        </div>
    </div>
  );
}

export default App;
