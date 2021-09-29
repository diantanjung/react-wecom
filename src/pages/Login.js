import React from 'react';
import { useState } from "react";
// import { Redirect } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import axiosInstance from "../helpers/axiosInstance";

export default function Login(props) {
  const [field, setField] = useState({});
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);
  // const history = useHistory();

  function setValue(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    setField({
      ...field,
      [name]: value
    })
  }

  async function doLogin(e) {
    e.preventDefault();
    setProgress(true);

    axiosInstance()
    .post("/users/login", JSON.stringify(field))
    .then((res) => {
      localStorage.access_token = res.data.access_token;
      setField({});
      e.target.reset();
      setError("");
      setRedirect(true);
      // history.push("/");
    })
    .catch((err) => {
      setError(err.message);
    });

    setProgress(false);
  }

  if(redirect){
    // return <Redirect to="/" />;
    window.location = "/";
  }

  return (
    <div className="form-signin text-center">
      <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
      {error !== "" && (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error!</h5>
          {error}
        </div>
      )}
      <form onSubmit={doLogin} >
        <div className="form-floating">
          <input type="text" className="form-control" name="username" id="username" placeholder="Username" required onChange={setValue} />
          <label htmlFor="floatingInput">Username</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" name="password" id="password" placeholder="Password" required onChange={setValue} />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <button disabled={progress} className="btn btn-primary btn-lg btn-block" type="submit">Sign In</button>
      </form>
    </div>
  );
}