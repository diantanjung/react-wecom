import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import "./Debug.css"

const DebugSection = ({ filepath, dirpath, breakpoints, setCurbp, curbp, setLastbp }) => {
  const [log, setLog] = useState([]);
  const [local, setLocal] = useState({});
  const [isrun, setIsrun] = useState(false);
  const [error, setError] = useState("");
  const oldValue = useRef({})

  const fieldVar = useRef({})

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
    console.log(isValidLog(evt.data), evt.data, new RegExp("Command failed:").test(evt.data));
    if (isValidLog(evt.data)) {
      setLog([...log, evt.data.replace('(dlv) ', '')]);
    } else if (new RegExp("\\(dlv\\) Process \\d+ has exited with status 0").test(evt.data)) {
      restart();
    } else if (evt.data.includes("hits goroutine")) {
      let curLine = getCurLine(evt.data);
      setLastbp(curbp);
      setCurbp(parseInt(curLine));
      ws.current.send("locals");
    } else if (new RegExp(/^Command failed:/g).test(evt.data)) {
      console.log("Command failed gaes", oldValue.current);
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

  const isValidLog = (msg) => {
    const substrings = [
      "\\[33m",
      "\\[34m",
      "\\(dlv\\) Breakpoint ",
      "\\(dlv\\) Command failed",
      "\\(dlv\\) Process restarted",
      "\\(dlv\\) >",
      "hits goroutine",
      " for list of commands",
      "\\(dlv\\) Process \\d+ has exited with status 0",
      "(no locals)",
      "[a-zA-Z\\d_]+ = .+",
      "Command failed:"
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
    let temp = {};
    temp[variabel] = value;
    return temp;
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

  const cont = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("continue");
      // ws.current.send("locals");
    }
  }

  const stop = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("exit");
      setIsrun(false);
    }
  }

  const restart = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      ws.current.send("restart");
      setLog([]);
      setLocal({});
    }
  }

  const startDebug = (e) => {
    e.preventDefault();
    if (ws.current.readyState === 1 && ws.current) {
      init();
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

      console.log(`call ${variabel} = ${value}`);
      ws.current.send(`call ${variabel} = ${value}`);
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