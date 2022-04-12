import React from 'react'
import isAuthenticated from "../utils/isAuthenticated";

const Menu = ({ activeMenu, setActiveMenu }) => {
    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        window.location = "/";
    }

    return (
        <nav id="sidebar" className="active">
            <h1><a href="#" className="logo"><img src="favicon-32x32.png" alt="bilang.io" /></a></h1>
            <ul className="list-unstyled components mb-5">

                {
                    isAuthenticated() ?
                        <li >
                            <a onClick={() => logout()}><span className="fa-solid fa-reply"></span> Logout</a>
                        </li>
                        :
                        <li style={{ paddingLeft: '25px', paddingBottom: '15px' }} >
                            <div id="g_id_onload"
                                data-client_id={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                // data-login_uri="http://localhost:9000/users/login-google"
                                data-callback='handleLogin'
                                data-auto_prompt="false" >
                            </div>
                            <div className="g_id_signin"
                                data-type="icon"
                                data-size="medium"
                                data-theme="outline"
                                data-text="sign_in_with"
                                data-shape="rectangular"
                                data-logo_alignment="right"
                                data-width="350">
                            </div>
                            
                        </li>
                }


                <li className={activeMenu == 'files' ? "active" : ""}>
                    <a onClick={() => setActiveMenu('files')}><span className="fa fa-folder"></span> Files</a>
                </li>
                <li className={activeMenu == 'open' ? "active" : ""}>
                    <a onClick={() => setActiveMenu('open')}><span className="fa fa-file"></span> Open</a>
                </li>
                <li className={activeMenu == 'terminal' ? "active" : ""}>
                    <a onClick={() => setActiveMenu('terminal')}><span className="fa fa-terminal"></span> Terminal</a>
                </li>
                <li className={activeMenu == 'help' ? "active" : ""}>
                    <a onClick={() => setActiveMenu('help')}><span className="fa fa-info"></span> Help</a>
                </li>
            </ul>

            <div className="footer">
                <p>
                    Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i className="icon-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib.com</a>
                </p>
            </div>
        </nav>
    )
}

export default Menu