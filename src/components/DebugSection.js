import React, { useEffect, useState, useRef } from "react";
import "./Debug.css"

const DebugSection = ({ filepath, dirpath, breakpoints, setCurbp, curbp, setLastbp }) => {
  const [log, setLog] = useState([]);
  const [isrun, setIsrun] = useState(false);

  const url = `${process.env.REACT_APP_BE_WSDEBUG}`;
  
  const ws = useRef();
  if (!ws.current) {
    ws.current = new WebSocket(url);
  }

  ws.current.onclose = function (event) {
    console.log("close");
  };

  ws.current.onmessage = function (evt) {
    console.log(isValidLog(evt.data), evt.data);
    if(isValidLog(evt.data)){
      setLog([...log, evt.data.replace('(dlv) ','')]);
    }else if(evt.data.includes("has exited with status")){
      stop();
    }else if(evt.data.includes("hits goroutine")){
      let curLine = getCurLine(evt.data);
      setLastbp(curbp);
      setCurbp(parseInt(curLine));
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
      "has exited with status"
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

  const cont = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("continue");
    }
  }

  const stop = () => {
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("exit");
      setIsrun(false);
      setLog([]);
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
      setIsrun(true);
    }
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