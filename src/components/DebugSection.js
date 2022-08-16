import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import "./Debug.css"

const DebugSection = ({ filepath, dirpath, breakpoints, setCurbp, curbp, setLastbp }) => {
  const [log, setLog] = useState([]);
  const [local, setLocal] = useState({});
  const [isrun, setIsrun] = useState(false);

  const url = `${process.env.REACT_APP_BE_WSDEBUG}`;

  const ws = useRef();

  // useLayoutEffect(() => {

  // }, [ws]);

  if (!ws.current) {
    ws.current = new WebSocket(url);
  }

  ws.current.onclose = function (event) {
    console.log("close");
  };

  // ws.current.onopen = function () {
  //   console.log("open");
  // };

  ws.current.onmessage = function (evt) {
    console.log(isValidLog(evt.data), evt.data, new RegExp(/[a-zA-Z\d_]+ = .+/g).test(evt.data));
    if (isValidLog(evt.data)) {
      setLog([...log, evt.data.replace('(dlv) ', '')]);
    } else if (new RegExp("\\(dlv\\) Process \\d+ has exited with status 0").test(evt.data)) {
      restart();
    } else if (evt.data.includes("hits goroutine")) {
      let curLine = getCurLine(evt.data);
      setLastbp(curbp);
      setCurbp(parseInt(curLine));
      ws.current.send("locals");
    } else if (new RegExp(/[a-zA-Z\d_]+ = .+/g).test(evt.data)) {
      console.log("change local now!");
      let { variabel, value } = getVarVal(evt.data);
      // local[variabel] = value;
      // setLocal(local);
      changeLocal(variabel, value);
    }
  };

  const isValidLog = (msg) => {
    const substrings = [
      "\\[33m",
      "\\[34m",
      "\\(dlv\\) Breakpoint ",
      "\\(dlv\\) Command failed",
      "\\(dlv\\) Process restarted",
      "hits goroutine",
      " for list of commands",
      "\\(dlv\\) Process \\d+ has exited with status 0",
      "(no locals)",
      "[a-zA-Z\\d_]+ = .+"
    ];
    if (new RegExp(substrings.join("|")).test(msg)) {
      return false;
    } else {
      return true;
    }
  }

  const getCurLine = (str) => {
    const regexp = /.go:(\d+) \(hits goroutine/g
    return Array.from(str.matchAll(regexp), m => m[1]);
  }

  const getVarVal = (str) => {
    const regexp = /([a-zA-Z\d_]+) = (.+)/g
    let match = regexp.exec(str);
    let variabel = match[1], value = match[2];
    return { variabel, value };
  }

  // const addBreakpoints = () => {
  //   breakpoints.forEach(
  //     (val) => {
  //       ws.current.send("break " + filepath + ":" + val);
  //     });
  // }

  // useEffect(() => {
  //   if (ws.current.readyState === 1 && ws.current) {
  //     init();
  //   } else {
  //     setTimeout(init, 5000);
  //   }
  // }, []);

  const init = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("cd " + dirpath);
      ws.current.send("dlv debug --allow-non-terminal-interactive=true");
      breakpoints.forEach(
        (val) => {
          ws.current.send("break " + filepath + ":" + val);
        });
      ws.current.send("continue");
    }
  }

  const locals = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("locals");
    }
  }

  const cont = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("continue");
      // ws.current.send("locals");
    }
  }

  const stop = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("exit");
      setIsrun(false);
    }
  }

  const restart = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("restart");
      setLog([]);
    }
  }

  const startDebug = () => {
    if (ws.current.readyState === 1 && ws.current) {
      init();
      setLog([]);
      setIsrun(true);
    }
  }

  const changeLocal = (variabel, value) => {
    local[variabel] = value;
    setLocal(local);
  }

  return (
    <div>
      <div>
        {isrun ?
          <>
            <a href="#" onClick={cont} className="btn btn-dark btn-sm tombol" title="Continue"><span className="fa fa-play"></span></a>
            <a href="#" className="btn btn-dark btn-sm tombol" title="Step Over"><span className="fa fa-rotate-right"></span></a>
            <a href="#" className="btn btn-dark btn-sm tombol" title="Step Into"><span className="fa fa-arrow-down"></span></a>
            <a href="#" className="btn btn-dark btn-sm tombol" title="Step Out"><span className="fa fa-arrow-up"></span></a>
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
          {Object.keys(local).map((key, index) => <div key={index}>{key} = {local[key]}</div>)}
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