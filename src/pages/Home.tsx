import { useState, useEffect } from "react";
import Menu from "../components/Menu";
import axiosInstance from "../helpers/axiosInstance";
import RightSection from "../components/RightSection";
import LeftSection from "../components/LeftSection";
import Notification from "../components/Notification";
import { useAppSelector } from "../store/store";

type HomeProps = {
  username: string;
  setUsername: (username: string) => void;
};

interface customWindow extends Window {
    handleLogin?: (googleData:any) => void
}

enum CommandPalettePage {
  Root = "ROOT"
}

declare const window: customWindow;

const Home = ({ username, setUsername }: HomeProps) => {
  const [activeMenu, setActiveMenu] = useState("open");

  const [filepath, setFilepath] = useState("");
  const [dirpath, setDirpath] = useState("");

  const [breakpoints, setBreakpoints] = useState([]);
  const [curbp, setCurbp] = useState(0);
  const [lastbp, setLastbp] = useState(0);

  const [filetab, setFiletab] = useState([]);

  const { notifStatus } = useAppSelector(
    (store) => store.openai
  );

  // window.handleLogin = async (googleData) => {
  //   axiosInstance()
  //     .post(
  //       "/users/login-google",
  //       JSON.stringify({
  //         credential: googleData.credential,
  //       })
  //     )
  //     .then((res) => {
  //       localStorage.access_token = res.data.access_token;
  //       localStorage.username = res.data.user.username;
  //       setUsername(res.data.user.username);
  //       window.location.href = "/";
  //     })
  //     .catch((err) => {
  //       console.log(err.message);
  //     });
  // };

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
        <div className="container-fluid">
          <div className="row">
            <LeftSection
              activeMenu={activeMenu}
              username={username}
              setActiveMenu={setActiveMenu}
              setDirpath={setDirpath}
              dirpath={dirpath}
            />
            <RightSection
              activeMenu={activeMenu}
              filepath={filepath}
              dirpath={dirpath}
            />
          </div>
          {notifStatus &&
            <div className={"notification-wrapper"}>
              <Notification />
            </div>
          }
        </div>
      </div>
      <Menu activeMenu={activeMenu} setActiveMenu={setActiveMenu} setUsername={setUsername} />
    </div>
  );
};

export default Home;
