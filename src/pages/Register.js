import React from 'react';
import { useState } from "react";
import { useHistory } from "react-router-dom";
import axiosInstance from "../helpers/axiosInstance";
import isAuthenticated from "../utils/isAuthenticated";


export default function Register() {
  const history = useHistory();
  if (!isAuthenticated()) {
    history.push("/login");
  }

  const [field, setField] = useState({});
  const [progress, setProgress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function setValue(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    setField({
      ...field,
      [name]: value
    })
  }

  async function doRegister(e) {
    e.preventDefault();
    setProgress(true);

    axiosInstance()
      .post("/users", JSON.stringify(field))
      .then((res) => {
        setField({});
        e.target.reset();
        setSuccess(true);
        setError("");
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.error);
        } else {
          setError(err.message);
        }
        setSuccess(false);
      });

    setProgress(false)
  }

  return (
    <div>
      <div className="py-5 text-center">
        <h2>Register User Form</h2>
      </div>

      {success && (
        <div className="alert alert-success" role="alert">
          <h5 className="alert-heading">Success!</h5>
          Success register user.
        </div>
      )}
      {error !== "" && (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error!</h5>
          {error}
        </div>
      )}
      <div className="row">
        <div>
          <form className="needs-validation" onSubmit={doRegister} noValidate>
            <div className="mb-3">
              <label htmlFor="name">Name</label>
              <input type="text" className="form-control" name="name" id="name" placeholder="Your Name" required onChange={setValue} />
              <div className="invalid-feedback">
                Valid name is required.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="username">Username</label>
              <input type="text" className="form-control" name="username" id="username" placeholder="Username" required onChange={setValue} />
              <div className="invalid-feedback" style={{ width: '100%' }}>
                Your username is required.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email">Email <span className="text-muted">(Optional)</span></label>
              <input type="email" className="form-control" name="email" id="email" placeholder="you@example.com" onChange={setValue} />
              <div className="invalid-feedback">
                Please enter a valid email address for shipping updates.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" name="password" id="password" required onChange={setValue} />
              <div className="invalid-feedback">
                Please enter your password.
              </div>
            </div>
            <button disabled={progress} className="btn btn-primary btn-lg btn-block" type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>

  );
}