import React, { useState, useEffect } from 'react';
import axiosInstance from "../helpers/axiosInstance";

export default function Home(props) {
  const [commands, setCommands] = useState([]);
  const [args, setArgs] = useState('');
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (
      async () => {
        axiosInstance()
          .get("/commands")
          .then((res) => {
            setCommands(res.data);
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    )();
  }, []);

  function setArguments(e) {
    setArgs(e.target.value);
  }

  async function deleteCode(dir, cmd) {
    // e.preventDefault();
    setProgress(true);

    axiosInstance()
      .delete("/command/" + dir + "/" + cmd)
      .then((res) => {
        setError("");
        window.location = "/";
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.error);
        } else {
          setError(err.message);
        }
      });

    setProgress(false)
  }

  let home;
  if (props.username === ''){
    home = (
      <div className="text-center">You are not loged in.</div>
      );
  }else{
    home = (
      <div>
        {error !== "" && (
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error!</h5>
            {error}
          </div>
        )}
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Command</th>
              <th scope="col">Arguments</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commands.map((item, i) => (
              <tr key={i}>
                <td>/{item.dir}/{item.cmd}</td>
                <td><input type="text" className="form-control" id="arguments" name="arguments" placeholder="?p=123&r=456" onChange={setArguments} /></td>
                <td>
                  <a href={`/run/${item.dir}/${item.cmd}${args}`} className="btn btn-outline-primary button-margin" >Run</a>
                  <a href={`/editcode/${item.dir}/${item.cmd}`} className="btn btn-outline-primary button-margin" >Edit</a>
                  <button disabled={progress} type="button" className="btn btn-outline-danger button-margin" onClick={() => deleteCode(item.dir, item.cmd)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
      </div>
    );
  }

  return (
    home
  );
}