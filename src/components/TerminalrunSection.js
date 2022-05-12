import React, { useEffect, useState } from "react";
import { WebLinksAddon } from 'xterm-addon-web-links';
import { AttachAddon } from 'xterm-addon-attach';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { SerializeAddon } from "xterm-addon-serialize";
import "./xterm.css";
import isAuthenticated from "../utils/isAuthenticated";

// const term = new Terminal({
//     convertEol: true,
//     fontFamily: `Abel, monospace, MesloLGS NF`,
//     fontSize: 15,
//     fontWeight: 400,
//     height: `20px`,
//     margin: `20px`
//     // rendererType: "dom" // default is canvas
// });
// const localEcho = new LocalEchoController();
// const fitAddon = new FitAddon();


const TerminalrunSection = ({ term, localEcho, fitAddon, filepath, dirpath, activeMenu }) => {
    const [username] = useState(localStorage.username);

    useEffect(() => {


        // Open the terminal in #terminal-container
        term.open(document.getElementById("xterm"));

        // Create a local echo controller (xterm.js >=v4)
        term.loadAddon(localEcho);

        term.loadAddon(fitAddon);
        setTimeout(function () { fitAddon.fit() });
        term.focus();
        if (!isAuthenticated()) {
            startWs("guest");
        } else {
            startWs(username);
        }

    }, []);


    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        window.location = "/";
    }

    const startWs = (username) => {
        const url = `${process.env.REACT_APP_BE_WS2}/${username}`;

        const ws = new WebSocket(url);
        const attachAddon = new AttachAddon(ws);

        // const webLinksAddon = new WebLinksAddon();
        const webLinksAddon = new WebLinksAddon(
            (event, url) => {
                window.open(url);
            },
            {
                validationCallback: (url, callback) => {
                    callback(true);
                    if (url.startsWith("https://bilang.io") || url.startsWith("http://localhost")) {
                        window.open(url);
                    }
                }
            }
        );
        term.loadAddon(webLinksAddon);

        const unicode11Addon = new Unicode11Addon();
        term.loadAddon(unicode11Addon);

        const serializeAddon = new SerializeAddon();
        term.loadAddon(serializeAddon);

        ws.onclose = function (event) {
            term.write('\r\n\nconnection has been terminated from the server-side (hit refresh to restart)\n')
            // logout();
        };

        ws.onopen = function () {
            term.loadAddon(attachAddon);
            term._initialized = true;
            term.focus();
            setTimeout(function () {
                fitAddon.fit();
                var dimensions = fitAddon.proposeDimensions();
                var size = JSON.stringify({ cols: dimensions.cols, rows: dimensions.rows });
                var send = new TextEncoder().encode("\x01" + size);
                console.log('resizing to', send);
                ws.send(send);

                console.log(activeMenu);
                if (activeMenu == "run") {
                    var cmdStr = "cd " + dirpath + "\n";
                    ws.send(cmdStr);

                    cmdStr = "clear\ngo build " + filepath + "\n";
                    ws.send(cmdStr);

                    cmdStr = "go run " + filepath + "\n";
                    ws.send(cmdStr);
                }
            });
            term.onResize(function (event) {
                var rows = event.rows;
                var cols = event.cols;
                var size = JSON.stringify({ cols: cols, rows: rows });
                var send = new TextEncoder().encode("\x01" + size);
                ws.send(send);
            });
            term.onTitleChange(function (event) {
                let curPath = "/home/" + username;
                let command = "";

                if (event.includes(":")) {
                    let term = event.trim().split(':');
                    let len = term.length;
                    curPath = term[len - 1];
                    if (curPath === "~") {
                        curPath = "/home/" + username;
                    }
                }

                if (event.includes(" ")) {
                    command = event.trim().split(' ')[0]
                } else {
                    command = event;
                }
                switch (command) {
                    case 'quit':
                        logout();
                        break;
                    default:
                        break;
                }
            });
            window.onresize = function () {
                var dimensions = fitAddon.proposeDimensions();
                if (!(isNaN(dimensions.cols) || isNaN(dimensions.rows))) {
                    fitAddon.fit();
                }
            };
        };

        ws.onmessage = function (event) {
            var msg = event.data;
            if (msg.length > 1) {
                if (msg.startsWith("failed to start tty:")) {
                    logout();
                }
            }

        };
    }

    return (
        <div id="xterm" />
    );
}

export default TerminalrunSection