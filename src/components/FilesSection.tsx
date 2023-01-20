import { useEffect, useState } from "react";
import axiosInstance from "../helpers/axiosInstance";
import { Tab, Table, Tabs } from "react-bootstrap";
import ListTable from "./ListTable";
import GlistTable from "./GlistTable";
import "./OpenDir.css";
import isAuthenticated from "../utils/isAuthenticated";
import { addFileItem } from "../store/feature/filetabSlice";
import { useAppDispatch } from "../store/store";

type FilesSectionProps = {
  username: string;
  setActiveMenu: (activeMenu: string) => void;
  setRunpath: (runPath: string) => void;
  setDirpath: (dirPath: string) => void;
};

type DataResponse = {
  id: number;
  isdir: boolean;
  filename: string;
};

const FilesSection = ({
  username,
  setActiveMenu,
  setRunpath,
  setDirpath,
}: FilesSectionProps) => {
  const dispatch = useAppDispatch();

  const [error, setError] = useState("");

  const [fileaddress, setFileaddress] = useState("/home/" + username);

  // let file = '/home/' + username ;
  const [data, setData] = useState<DataResponse[]>([]);
  const pathArr = fileaddress.split("/");
  let dirLink = "";

  useEffect(() => {
    (async () => {
      if (isAuthenticated()) {
        openDirFile();
      } else {
        gopenDirFile();
      }
    })();
  }, [fileaddress]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const openDirFile = () => {
    axiosInstance()
      .post(
        "/opendirfile",
        JSON.stringify({ path_str: fileaddress, username: username })
      )
      .then((res) => {
        if (res.data.is_dir) {
          setData(res.data.dir_list);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.error);
          if (
            err.response.data.error == "token has expired" ||
            err.response.data.error == "token is invalid"
          ) {
            logout();
          }
        } else {
          setError(err.message);
        }
      });
  };

  const gopenDirFile = () => {
    axiosInstance()
      .post(
        "/gopendirfile",
        JSON.stringify({ path_str: fileaddress, username: "guest" })
      )
      .then((res) => {
        if (res.data.is_dir) {
          setData(res.data.dir_list);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.error);
          if (
            err.response.data.error == "token has expired" ||
            err.response.data.error == "token is invalid"
          ) {
            logout();
          }
        } else {
          setError(err.message);
        }
      });
  };

  const GridContent = () => (
    <div className="row">
      {data &&
        data.length > 0 &&
        data.map((item) => (
          <div
            className="card border-0"
            style={{ width: "15rem" }}
            key={item.id}
          >
            <div className="card-body">
              {item.isdir ? (
                <div>
                  <svg
                    aria-label="Directory"
                    aria-hidden="true"
                    height="32"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="42"
                    data-view-component="true"
                    fill="currentColor"
                    style={{ color: "#54aeff" }}
                  >
                    <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z" />
                  </svg>
                  <br />
                  {/* <a href={"/@" + username + dirLink + "/" + item.filename} className="text-center">{item.filename}</a> */}
                  <a
                    onClick={() => {
                      setFileaddress(dirLink + "/" + item.filename);
                    }}
                    className="text-center"
                  >
                    {item.filename}
                  </a>
                </div>
              ) : (
                <div>
                  <svg
                    aria-label="File"
                    aria-hidden="true"
                    height="32"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="42"
                    data-view-component="true"
                    className="octicon octicon-file color-icon-tertiary"
                  >
                    <path d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"></path>
                  </svg>
                  <br />
                  <a
                    onClick={() => {
                      let path = dirLink + "/" + item.filename;
                      if (item.filename.indexOf(".") == -1) {
                        setRunpath(path.replace(/\/+/g, "/"));
                        setActiveMenu("output");
                      } else {
                        const filepath = path.replace(/\/+/g, "/");
                        dispatch(addFileItem(filepath));
                        setActiveMenu("open");
                      }
                      setDirpath(dirLink.replace(/\/+/g, "/"));
                    }}
                    className="text-center"
                    style={{ cursor: "pointer", color: "#1e1e1e" }}
                  >
                    {item.filename}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="container margin-top">
      <div>
        {error !== "" && (
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error!</h5>
            {error}
          </div>
        )}
        <div className="row">
          <h5>
            {pathArr &&
              pathArr.length > 0 &&
              pathArr.map((item, key) => {
                dirLink += "/" + item;

                return key < pathArr.length - 1 ? (
                  <span key={key}>
                    <a href={"/@" + username + dirLink}>{item}</a> /{" "}
                  </span>
                ) : (
                  <span key={key}>
                    <a href={"/@" + username + dirLink}>{item}</a>{" "}
                  </span>
                );
              })}
          </h5>
        </div>
        <div className="margin-top">
          <Tabs defaultActiveKey="grid" id="controlled-tab">
            <Tab
              eventKey="grid"
              title={
                <span>
                  <i className="fa fa-th-large"></i> Grid
                </span>
              }
            >
              <GridContent />
            </Tab>
            <Tab
              eventKey="list"
              title={
                <span>
                  <i className="fa fa-bars"></i> List
                </span>
              }
            >
              {/*<ListContent />*/}
              {isAuthenticated() ? (
                <ListTable file={fileaddress} />
              ) : (
                <GlistTable file={fileaddress} />
              )}
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FilesSection;
