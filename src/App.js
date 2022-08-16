import React, {useState} from 'react';
import Home from './pages/Home';
import Login from "./pages/Login"
import LoginGithub from "./pages/LoginGithub"
import RunFunc from "./pages/RunFunc";
import Psaux from "./pages/Psaux";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

function App() {
  const [username, setUsername] = useState(localStorage.username || 'guest');

  return (
    <div>
      <Router>
        <div>
          <Switch>
            <Route path="/" exact><Home username={username} setUsername={setUsername}/> </Route>
            <Route path="/@:username" component={RunFunc}></Route>
            <Route path="/login-old" component={Login}></Route>
            <Route path="/login" ><LoginGithub setUsername={setUsername}/></Route>
            <Route path="/ps-aux" ><Psaux /></Route>

          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
