import axiosInstance from "../helpers/axiosInstance";
import { Redirect } from "react-router-dom";
import React, { useEffect } from 'react'

const LoginGithub = ({setUsername}) => {
    useEffect(() => {
        // After requesting Github access, Github redirects back to your app with a code parameter
        const url = window.location.href;
        const hasCode = url.includes("?code=");

        // If Github API returns the code parameter
        if (hasCode) {
            const newUrl = url.split("?code=");
            window.history.pushState({}, null, newUrl[0]);

            const requestData = {
                code: newUrl[1]
            };

            axiosInstance()
                .post("/users/login-github", JSON.stringify(requestData))
                .then((res) => {
                    localStorage.access_token = res.data.access_token;
                    localStorage.username = res.data.user.username;
                    setUsername(res.data.user.username);
                    window.location = "/";
                })
                .catch((err) => {
                    console.log("error bos");
                    return false;
                });
        }
    }, []);
    return false;
}

export default LoginGithub