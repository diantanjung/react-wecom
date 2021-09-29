import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import './App.css';
import Nav from "./components/Nav"
import Login from "./pages/Login"
import Register from './pages/Register';
import Home from './pages/Home';
import Run from './pages/Run';
import axiosInstance from "./helpers/axiosInstance";
import EditCode from "./pages/EditCode";

export default function App() {

  const [username, setUsername] = useState('');

  useEffect(() => {
    (
      async () => {
        axiosInstance()
          .get("/user")
          .then((res) => {
            setUsername(res.data.username);
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    )();
  }, []);

  // axiosInstance()
  // .get("/user")
  // .then((res) => {
  //   console.log(res);
  // })
  // .catch((err) => {
  //   console.log(err.message);
  // });

  return (
    <div className="App">
      <Router>
        <Nav username={username} />
        <div className="container">
          <Switch>
            <Route path="/" exact><Home username={username} /> </Route>
            <Route path="/login" component={Login}></Route>
            <Route path="/register"><Register username={username} /></Route>
            <Route path="/run/:dir/:cmd" component={Run}></Route>
            <Route path="/editcode/:dir/:cmd" component={EditCode}></Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}