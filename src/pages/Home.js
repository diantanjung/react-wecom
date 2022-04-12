import { useState, useEffect } from 'react'
import Menu from '../components/Menu'
import TopSection from '../components/TopSection'
import BottomSection from '../components/BottomSection'
import axiosInstance from "../helpers/axiosInstance";
import isAuthenticated from "../utils/isAuthenticated";

const Home = () => {
    const [activeMenu, setActiveMenu] = useState('open');
    const [username, setUsername] = useState(localStorage.username || '');

    window.handleLogin = async (googleData) => {
        axiosInstance()
            .post("/users/login-google", JSON.stringify({
                credential: googleData.credential,
            }))
            .then((res) => {
                localStorage.access_token = res.data.access_token;
                localStorage.username = res.data.user.username;
                setUsername(res.data.user.username);
                window.location = "/";
            })
            .catch((err) => {
                console.log(err.message);
            });

    };

    useEffect(() => {
        console.log(username);
    }, [username]);

    return (

        <div className="wrapper d-flex align-items-stretch">
            {/* {
                !isAuthenticated() &&
                <div id="g_id_onload"
                    data-client_id={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                    data-callback="handleLogin"
                    data-your_own_param_1_to_login="any_value"
                    data-your_own_param_2_to_login="any_value">
                </div>
            } */}

            <div id="content">
                <TopSection
                    activeMenu={activeMenu}
                    username={username}
                />
                <BottomSection
                    activeMenu={activeMenu}
                    username={username}
                />
            </div>
            <Menu
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
            />
        </div>
    )
}

export default Home