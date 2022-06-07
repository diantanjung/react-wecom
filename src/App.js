import React from 'react';
import Home from './pages/Home';
import Login from "./pages/Login"
import RunFunc from "./pages/RunFunc";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

function App() {

  return (
    <div>
      <Router>
        <div>
          <Switch>
            <Route path="/" exact><Home/> </Route>
            <Route path="/@:username" component={RunFunc}></Route>
            <Route path="/login" component={Login}></Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
