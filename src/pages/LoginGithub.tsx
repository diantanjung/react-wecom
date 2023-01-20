import axiosInstance from "../helpers/axiosInstance";
import React, { useEffect } from 'react'

type LoginGithubProps = {
    setUsername :(username: string | null) => void;
}

const LoginGithub = ({setUsername}: LoginGithubProps) => {
    useEffect(() => {
        // After requesting Github access, Github redirects back to your app with a code parameter
        const url = window.location.href;
        const hasCode = url.includes("?code=");

        // If Github API returns the code parameter
        if (hasCode) {
            const newUrl = url.split("?code=");
            window.history.pushState({}, "", newUrl[0]);

            const requestData = {
                code: newUrl[1]
            };

            axiosInstance()
                .post("/users/login-github", JSON.stringify(requestData))
                .then((res) => {
                    localStorage.access_token = res.data.access_token;
                    localStorage.username = res.data.user.username;
                    setUsername(res.data.user.username);
                    window.location.href = "/";
                })
                .catch((err) => {
                    console.log("error bos");
                    return false;
                });
        }
    }, []);
    return <></>;
}

export default LoginGithub