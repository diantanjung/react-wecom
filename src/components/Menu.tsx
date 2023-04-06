import React, { useState } from 'react';
import isAuthenticated from "../utils/isAuthenticated";
import styles from "./Menu.module.css";
import { RiCloseLine } from "react-icons/ri";
import GithubIcon from "mdi-react/GithubIcon";
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../helpers/axiosInstance';

type MenuProps = {
    activeMenu: string
    setActiveMenu: (activeMenu:string) => void
    setUsername: (username:string) => void
}

const Menu = ({ activeMenu, setActiveMenu, setUsername }: MenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        window.location.href = "/";
    }

    return (
        <>
            <nav id="sidebar" className="active">
                {/* <h1><a href="#" className="logo"><img src="favicon-32x32.png" alt="bilang.io" /></a></h1> */}
                <ul className="list-unstyled components mb-5" style={{marginTop:"20px"}}>
                    {
                        isAuthenticated() ?
                            <li>
                                <a onClick={() => logout()}><span className="fa fa-sign-out"></span> Logout</a>
                            </li>
                            :
                            <li>
                                <a onClick={() => setIsOpen(true)}><span className="fa fa-sign-in"></span>Login</a>
                            </li>
                    }
                    <li className={activeMenu == 'open' ? "active" : ""}>
                        <a onClick={() => setActiveMenu('open')}><span className="fa fa-file"></span>Open</a>
                    </li>
                    <li className={activeMenu == 'files' ? "active" : ""}>
                        <a onClick={() => setActiveMenu('files')}><span className="fa fa-folder"></span>Files</a>
                    </li>
                    <li className={activeMenu == 'terminal' ? "active" : ""}>
                        <a onClick={() => setActiveMenu('terminal')}><span className="fa fa-terminal"></span>Terminal</a>
                    </li>
                    <li className={activeMenu == 'run' ? "active" : ""}>
                        <a onClick={() => setActiveMenu('run')}><span className="fa fa-play"></span>Run</a>
                    </li>
                    <li className={activeMenu == 'debug' ? "active" : ""}>
                        <a onClick={() => setActiveMenu('debug')}><span className="fa fa-bug"></span>Debug</a>
                    </li>
                </ul>

                <div className="footer">
                    <p>
                        Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i className="icon-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib.com</a>
                    </p>
                </div>
            </nav>

            <div className={`${!isOpen && styles.hide}`} >
                <div className={`${isOpen && styles.darkBG}`} onClick={() => setIsOpen(false)} />
                <div className={`${isOpen && styles.centered}`}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.heading}>Sign in to Bilang</h5>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <RiCloseLine style={{ marginBottom: "-3px" }} />
                        </button>
                        <div className={styles.modalContent}>
                            <GoogleLogin
                                type='standard'
                                size='large'
                                theme='outline'
                                text='signin_with'
                                shape='circle'
                                width='280'
                                onSuccess={credentialResponse => {
                                    console.log(credentialResponse);
                                    axiosInstance()
                                        .post(
                                            "/users/login-google",
                                            JSON.stringify({
                                            credential: credentialResponse.credential,
                                            })
                                        )
                                        .then((res) => {
                                            localStorage.access_token = res.data.access_token;
                                            localStorage.username = res.data.user.username;
                                            setUsername(res.data.user.username);
                                            window.location.href = "/";
                                        })
                                        .catch((err) => {
                                            console.log(err.message);
                                        });
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                                />
                            <div className={styles.loginContainer}>
                                <a
                                    className={styles.loginLink}
                                    href={`https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GITHUB_REDIRECT_URI}`}
                                >
                                    
                                    <span>Login with GitHub&nbsp;&nbsp;&nbsp;</span>
                                    <GithubIcon />
                                </a>
                            </div>

                        </div>
                        <div className={styles.modalActions}>
                            <div className={styles.actionsContainer}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Menu