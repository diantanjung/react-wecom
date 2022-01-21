import React from 'react';
import Home from './pages/Home';
import Open from "./pages/Open";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

function App() {

  return (
    <div>
      <Router>
        <div>
          <Switch>
            <Route path="/" exact><Home/> </Route>
            <Route path="/@:username" component={Open}></Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
