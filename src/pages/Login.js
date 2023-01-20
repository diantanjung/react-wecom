import React from 'react';
import { useState } from "react";
// import { Redirect } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import axiosInstance from "../helpers/axiosInstance";
import "./Login.css";

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
        localStorage.username = res.data.user.username;
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

  if (redirect) {
    // return <Redirect to="/" />;
    window.location = "/";
  }

  const handleFailure = (result) => {
    console.log(result);
  };

  // window.handleLogin = async (googleData) => {
  //   axiosInstance()
  //     .post("/users/login-google", JSON.stringify({
  //       credential: googleData.credential,
  //     }))
  //     .then((res) => {
  //       localStorage.access_token = res.data.access_token;
  //       localStorage.username = res.data.user.username;
  //       setField({});
  //       setError("");
  //       setRedirect(true);
  //       // history.push("/");
  //     })
  //     .catch((err) => {
  //       setError(err.message);
  //     });

  // };

  const handleLogout = () => {
    localStorage.removeItem('loginData');
  };

  return (
    <div className="row no-gutter no-margin">
      <div className="col-md-6 d-none d-md-flex bg-image"></div>


      <div className="col-md-6 bg-light">
        <div className="login d-flex align-items-center py-5">

          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-xl-6 mx-auto">
                <h3 className="display-4">Login</h3>
                <p className="text-muted mb-4">Please insert your Username and Password.</p>
                {error !== "" && (
                  <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error!</h5>
                    {error}
                  </div>
                )}
                <form onSubmit={doLogin} >
                  <div className="form-group mb-3">
                    <input id="username" type="text" name='username' placeholder="Username" required=""
                      className="form-control rounded-pill border-0 shadow-sm px-4" onChange={setValue} />
                  </div>
                  <div className="form-group mb-3">
                    <input id="password" type="password" name='password' placeholder="Password" required=""
                      className="form-control rounded-pill border-0 shadow-sm px-4 text-primary" onChange={setValue} />
                  </div>
                  <button type="submit" disabled={progress}
                    className="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">Login</button>
                </form>
                <div className='col-lg-12 col-xl-12 text-center'>
                  <span> or </span>
                </div>
                <br />
                <div id="g_id_onload"
                  data-client_id={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                  // data-login_uri="http://localhost:9000/users/login-google"
                  data-callback='handleLogin'
                  data-auto_prompt="false" >
                </div>
                <div className="g_id_signin"
                  data-type="standard"
                  data-size="large"
                  data-theme="outline"
                  data-text="sign_in_with"
                  data-shape="circle"
                  data-logo_alignment="right"
                  data-width="350">
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

  );
}

