import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCursor, addFileItem, clearCursor } from "../feature/filetabSlice";
import "./Debug.css"

const DebugSection = () => {
  const dispatch = useDispatch();
  const { aktifTabItem } = useSelector((store) => store.filetabs);

  const [log, setLog] = useState([]);
  const [local, setLocal] = useState({});
  const [isrun, setIsrun] = useState(false);
  const [error, setError] = useState("");
  const oldValue = useRef({});
  const [loading, setLoading] = useState(true);

  const fieldVar = useRef({})

  const url = `${process.env.REACT_APP_BE_WSDEBUG}`;

  const ws = useRef();

  // useLayoutEffect(() => {

  // }, [ws]);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onclose = function (event) {
      console.log("close");
    };

    const wsCurrent = ws.current;

    waitForSocketConnection();

    return () => {
      wsCurrent.close();
    };
  }, []);

  if (ws.current) {
    ws.current.onmessage = function (evt) {
      console.log(isValidLog(evt.data), evt.data);
      if (isValidLog(evt.data)) {
        setLog([...log, evt.data.replace('(dlv) ', '')]);
      } else if (new RegExp(/Process [0-9]+ has exited with status [0-9]+/g).test(evt.data)) {
        if (ws.current.readyState === 1 && ws.current) {
          ws.current.send("exit");
          setIsrun(false);
          setLog([]);
          setLocal({});
          dispatch(clearCursor());
        }
      } else if (new RegExp(/> \S+ .+.go:(\d+)/g).test(evt.data)) {
        const regexp = /> [^ ]+ ([^ ]+):([0-9]+)/g;
        const match = regexp.exec(evt.data);
        const curLine = parseInt(match[2]);
        let curPath = match[1];
        if (curPath.indexOf('./') !== -1) {
          curPath = aktifTabItem.dirpath + "/" + curPath;
        }
        dispatch(addFileItem(curPath)).then(res => {
          if (res) {
            dispatch(setCursor({ curPath: res.payload.filepath, curLine }));
          }
        });
        ws.current.send("locals");
      } else if (new RegExp(/^Command failed:/g).test(evt.data)) {
        setError(evt.data);
        setLocal(oldValue.current);

        for (let key in oldValue.current) {
          fieldVar.current[key].value = oldValue.current[key];
        }

      } else if (new RegExp(/[a-zA-Z\d_]+ = .+/g).test(evt.data)) {
        let temp = getVarVal(evt.data);
        setLocal(prev => {
          return { ...prev, ...temp };
        });
      }
    };
  }



  const absolute = ({ base, relative }) => {
    var stack = base.split("/"),
      parts = relative.split("/");
    stack.pop(); // remove current file name (or empty string)
    // (omit if "base" is the current folder without trailing slash)
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] == ".")
        continue;
      if (parts[i] == "..")
        stack.pop();
      else
        stack.push(parts[i]);
    }
    return stack.join("/");
  }

  const isValidLog = (msg) => {
    const substrings = [
      "\\[33m",
      "\\[34m",
      "\\(dlv\\) Breakpoint ",
      "\\(dlv\\) Command failed",
      "\\(dlv\\) Process restarted",
      /> \S+ .+.go:\d+/g,
      "hits goroutine",
      " for list of commands",
      "(no locals)",
      "[a-zA-Z\\d_]+ = .+",
      "Command failed:"
    ];
    const regexp = /> \S+ .+.go:\d+|\[33m|\(dlv\) Breakpoint|\(dlv\) Command failed|\(dlv\) Process restarted|hits goroutine|for list of commands|Process \d+ has exited with status 0|\(no locals\)|[a-zA-Z0-9_]+ = .+|Command failed:/g
    if (new RegExp(regexp).test(msg)) {
      return false;
    } else {
      return true;
    }
  }

  const getCurLine = (str) => {
    const regexp = /> \S+ .+.go:(\d+)/g
    return Array.from(str.matchAll(regexp), m => m[1]);
  }

  const getVarVal = (str) => {
    const regexp = /([a-zA-Z\d_]+) = (.+)/g
    let match = regexp.exec(str);
    let variabel = match[1], value = match[2];
    let temp = {};
    temp[variabel] = value;
    return temp;
  }

  const init = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("cd " + aktifTabItem.dirpath);
      ws.current.send("dlv debug --allow-non-terminal-interactive=true");
      aktifTabItem.breakpoints.forEach(
        (val) => {
          ws.current.send("break " + aktifTabItem.filepath + ":" + val);
        });
      ws.current.send("continue");
    }
  }


  const cont = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("continue");
      // ws.current.send("locals");
    }
  }
  const stepover = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("next");
    }
  }

  const stepInto = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("step");
    }
  }

  const stepOut = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("stepout");
    }
  }

  const stop = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("exit");
      setIsrun(false);
      setLog([]);
      setLocal({});
      dispatch(clearCursor());
    }
  }

  const restart = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("exit");
      setLog([]);
      setLocal({});
      ws.current.send("cd " + aktifTabItem.dirpath);
      ws.current.send("dlv debug --allow-non-terminal-interactive=true");
      aktifTabItem.breakpoints.forEach(
        (val) => {
          ws.current.send("break " + aktifTabItem.filepath + ":" + val);
        });
      ws.current.send("continue");
    }
  }

  const startDebug = (e) => {
    e.preventDefault();
    console.log("ws.current.readyState : ", ws.current.readyState);
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("cd " + aktifTabItem.dirpath);
      ws.current.send("dlv debug --allow-non-terminal-interactive=true");
      aktifTabItem.breakpoints.forEach(
        (val) => {
          ws.current.send("break " + aktifTabItem.filepath + ":" + val);
        });
      ws.current.send("continue");
      setLog([]);
      setIsrun(true);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setError("");
      const target = e.target;
      const variabel = target.name;
      const value = target.value;

      oldValue.current = local;
      setLocal(prev => {
        return { ...prev, [variabel]: value }
      });
      ws.current.send(`call ${variabel} = ${value}`);
    }
  }

  const cobaKlik = (e) => {
    e.preventDefault();
    console.log("Test Aja");
    dispatch(addFileItem("/home/guest/coba.go")).then(res => {
      if (res) {
        dispatch(setCursor({ curPath: "/home/guest/coba.go", curLine: 6 }));
      }
    });
  }

  const waitForSocketConnection = () => {
    setTimeout(
      function () {
        if (ws.current.readyState === 1) {
          console.log("Connection is made")
          setLoading(false);
        } else {
          console.log("wait for connection...")
          setLoading(true);
          waitForSocketConnection();
        }

      }, 5);
  }

  return (
    <div>
      <div>
        {loading ?
          <span>Loading...</span>
          :
          isrun ?
            <>
              <a href="#" onClick={cont} className="btn btn-dark btn-sm tombol" title="Continue"><span className="fa fa-play"></span></a>
              <a href="#" onClick={stepover} className="btn btn-dark btn-sm tombol" title="Step Over"><span className="fa fa-rotate-right"></span></a>
              <a href="#" onClick={stepInto} className="btn btn-dark btn-sm tombol" title="Step Into"><span className="fa fa-arrow-down"></span></a>
              <a href="#" onClick={stepOut} className="btn btn-dark btn-sm tombol" title="Step Out"><span className="fa fa-arrow-up"></span></a>
              <a href="#" onClick={restart} className="btn btn-dark btn-sm tombol" title="Restart"><span className="fa fa-rotate-left"></span></a>
              <a href="#" onClick={stop} className="btn btn-danger btn-sm tombol" title="Stop"><span className="fa fa-stop"></span></a>
            </>
            :
            <a href="#" onClick={startDebug} className="btn btn-primary btn-sm tombol" title="Run and Debug">Run and Debug</a>
        }

      </div>
      <div>
        <div className="hdebug-bg">
          <h6 className="h5-debug">Variables</h6>
        </div>
        <div>
          <br />
          {
            Object.keys(local).map((key, index) =>
              <div className="form-group row" key={index}>
                <label className="col-sm-1 col-form-label">{key} </label>
                <div className="col-sm-10">
                  <input ref={el => fieldVar.current[key] = el} type="text" name={key} defaultValue={local[key] || ""} className="var-field" onKeyDown={handleKeyDown} />
                </div>
              </div>
            )}
          {error !== "" && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="hdebug-bg">
          <h6 className="h5-debug">Debug Console</h6>
        </div>
        <div>
          {log.map((item, key) => <div key={key}>{item}</div>)}
        </div>
      </div>
    </div>
  )
}

export default DebugSection