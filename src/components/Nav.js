import React from 'react';
import {Link} from "react-router-dom"

export default function Nav(props) {
    const logout = () => {
        localStorage.removeItem("access_token");
        window.location = "/login";
    }

    let menu;
    if (props.username === ''){
        menu = (
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
                <li className="nav-item">
                    <Link to="/login" className="nav-link p-2 text-dark">Login</Link>
                </li>
            </ul>
        );
    }else{
        menu = (
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
                <li className="nav-item">
                    <Link to="/" className="nav-link active p-2 text-dark" aria-current="page">Home</Link>
                </li>
                <li className="nav-item">
                    <Link to="/register" className="nav-link p-2 text-dark">Add User</Link>
                </li>
                <li className="nav-item">
                    <a className="nav-link p-2 text-dark link-cursor" onClick={logout}>Logout</a>
                </li>
            </ul>
        );
    }
    return (
        <nav className="navbar navbar-expand-md bg-white border-bottom box-shadow mb-2">
            <div className="container-fluid">
            <Link to="/" className="navbar-brand p-2 text-dark">
                <h5 className="my-0 mr-md-auto font-weight-normal">Web Command</h5>
            </Link>
            <div>
                {menu}
            </div>
            </div>
        </nav>
    );
}