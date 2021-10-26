import React from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "./xterm.css";
import { Resizable } from "re-resizable";
import ResizeObserver from "react-resize-observer";
import c from "ansi-colors";
import axiosInstance from "../helpers/axiosInstance";

let term;
const fitAddon = new FitAddon();
let command = "";
let commands;
let login = false;
let wsStatus = false;
let textCat = "";
var conn;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: "",
            username: "",
            currentPath: "/"
        };
    }

    componentDidMount() {
        this.getUserAuth();
        term = new Terminal({
            convertEol: true,
            fontFamily: `Abel, monospace`,
            fontSize: 15,
            fontWeight: 400
            // rendererType: "dom" // default is canvas
        });

        term.currentLine = "";
        term.history = [];
        term.historyCursor = -1;
        term.pos = () => term._core.buffer.x - term._promptRawText().length - 1;
        term._promptRawText = () => `${this.state.username}:${this.state.currentPath} $`;

        //Styling
        term.setOption("theme", {
            background: "#000000",
            foreground: "#FFFFFF"
        });

        term.prompt = (prefix = "\r\n", suffix = " ") => {
            var shellprompt;
            if(this.state.username){
                shellprompt = this.state.username + ":" + this.state.currentPath + " $ ";
            }else{
                shellprompt = "$ ";
            }
            term.write(prefix + shellprompt);
        };

        term.setCurrentLine = (newLine) => {
            term.currentLine = newLine;
            command = newLine;
            // term.prompt();
            term.write(newLine);
        }

        term.stylePrint = (text) => {
            term.writeln(text);
        };

        // Load Fit Addon
        term.loadAddon(fitAddon);

        // Open the terminal in #terminal-container
        term.open(document.getElementById("xterm"));

        term.write("Welcome to the Command Web terminal.\n");
        term.write("Write your command below, try running `help`.");

        // Make the terminal's size and geometry fit the size of #terminal-container
        fitAddon.fit();

        term.onData(e => {
            if(login){
                command += e;
                //doaction();
                if (e === '\r'){
                    login = false;
                    this.runCommand(term, command);
                    command = '';
                    term.currentLine = '';
                }
            }else if(e === '\r' && command.trim().split(' ')[0] == "login"){
                var shellprompt = "$ please input password :  ";
                term.write("\r\n" + shellprompt);
                command +=  ' ';
                term.currentLine += ' ';
                login = true;
            }else if (wsStatus){
                switch (e) {
                    case '\u0003': // Ctrl+C
                        term.write('^C');
                        conn.send('^D');
                        wsStatus = false;
                        this.prompt();
                        break;
                    case '\u0004':
                        conn.send('^D');
                        wsStatus = false;
                        command = '';
                        term.currentLine = '';
                        break;
                    case '\r': // Enter
                        term.write("\r\n");
                        conn.send(textCat);
                        textCat = "";
                        break;
                    case '\u007F': // Backspace (DEL)
                        if (term._core.buffer.x > 0) {
                            term.write('\b \b');
                            if (textCat.length > 0) {
                                textCat = textCat.substr(0, textCat.length - 1);
                            }
                        }
                        break;
                    default: // Print all other characters for demo
                        if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7B)) {
                            textCat += e;
                            term.write(e);
                        }
                }
            }else{
                switch (e) {
                    case '\u0003': // Ctrl+C
                        term.write('^C');
                        this.prompt();
                        break;
                    case '\u0004':
                        term.write('^D');
                        break;
                    case '\u007E':
                        term.write(e);
                        break;
                    case '\r': // Enter
                        this.runCommand(term, command);
                        if (command !== "login "){
                            term.history.push(command);
                            command = '';
                            term.currentLine = '';
                        }

                        break;
                    case '\u007F': // Backspace (DEL)
                        // Do not delete the prompt
                        let noDelete = 27;
                        if (this.state.username.length > 0 )
                            noDelete = this.state.username.length + this.state.currentPath.length + 4;
                        if (term._core.buffer.x > noDelete) {
                            term.write('\b \b');
                            if (command.length > 0) {
                                command = command.substr(0, command.length - 1);
                                term.currentLine = command;
                            }
                        }
                        break;
                    // case '\033[A': // up
                    case '\u001b[A': // up
                        var h = [... term.history].reverse();
                        if (term.historyCursor < h.length - 1) {
                            term.historyCursor += 1;
                            term.setCurrentLine(h[term.historyCursor], false);
                        }
                        break;
                    // case '\033[B': // down
                    case '\u001b[B': // down
                        var h = [... term.history].reverse();
                        if (term.historyCursor > 0) {
                            term.historyCursor -= 1;
                            term.setCurrentLine(h[term.historyCursor], false);
                        } else {
                            term.clearCurrentLine(true);
                        }
                        break;
                    case '\t': // tab
                        const cmd = term.currentLine.split(" ")[0];
                        console.log(cmd);
                        const rest = term.currentLine.slice(cmd.length).trim();
                        const autocompleteCmds = Object.keys(commands).filter((c) => c.startsWith(cmd));
                        var autocompleteArgs;

                        // detect what to autocomplete
                        if (autocompleteCmds && autocompleteCmds.length > 1) {
                            const oldLine = term.currentLine;
                            term.stylePrint(`\r\n${autocompleteCmds.sort().join("   ")}`);
                            term.prompt();
                            term.setCurrentLine(oldLine);
                        }

                        // do the autocompleting
                        if (autocompleteArgs && autocompleteArgs.length > 1) {
                            const oldLine = term.currentLine;
                            term.writeln(`\r\n${autocompleteArgs.join("   ")}`);
                            term.prompt();
                            term.setCurrentLine(oldLine);
                        } else if (commands[cmd] && autocompleteArgs && autocompleteArgs.length > 0) {
                            term.prompt();
                            term.setCurrentLine(`${cmd} ${autocompleteArgs[0]}`);
                        } else if (commands[cmd] && autocompleteArgs && autocompleteArgs.length == 0) {
                            term.prompt();
                            term.setCurrentLine(`${cmd} ${rest}`);
                        } else if (autocompleteCmds && autocompleteCmds.length == 1) {
                            term.prompt();
                            term.setCurrentLine(`${autocompleteCmds[0]} `);
                        }
                        break;
                    default: // Print all other characters for demo
                        if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7B)) {
                            command += e;
                            term.currentLine += e;
                            term.write(e);
                        }
                }
            }

        });

        this.startWs("ws://"+ process.env.REACT_APP_BE_WS +"/ws");
    }

    startWs =  (websocketServerLocation) => {
        var that = this;
        conn = new WebSocket(websocketServerLocation);
        conn.onmessage = function(evt) {
            term.write(evt.data);
            that.prompt();
        };
        conn.onclose = function(){
            // Try to reconnect in 5 seconds
            that.prompt();
            setTimeout(function(){that.startWs(websocketServerLocation)}, 5000);
        };
    }

    runCommand = (term, text) => {
        const command = text.trim().split(' ')[0];
        if (command.length > 0) {
            term.writeln('');
            if (command in commands) {
                commands[command].f(text);
                return;
            }else{
                this.doAction(command);
                return;
            }
            term.writeln(`${command}: command not found`);
        }
        this.prompt();
    }

    prompt = () => {
        var shellprompt;
        if(this.state.username){
            shellprompt = this.state.username + ":" + this.state.currentPath + " $ ";
        }else{
            shellprompt = "$ ";
        }
        term.write("\r\n" + shellprompt);
    };

    doAction = (exe) => {
        axiosInstance()
            .post("/terminal", JSON.stringify({"exe" : exe, "path" : this.state.currentPath}))
            .then((res) => {
                if(res.data.path){
                    window.open(res.data.path, '_blank');
                }if(res.data.access_token){
                    localStorage.access_token = res.data.access_token;
                    term.writeln("Login success.");
                }else {
                    term.writeln(res.data.message);
                }
                this.prompt();
            })
            .catch((err) => {
                if (err.response) {
                    term.writeln(err.response.data.error);
                } else {
                    term.writeln(err.message);
                }
                this.prompt();
            });
    };

    doChangeDir = (exe) => {
        axiosInstance()
            .post("/terminal", JSON.stringify({"exe" : exe, "path" : this.state.currentPath}))
            .then((res) => {
                this.setState({
                    currentPath: res.data.message
                });
                this.prompt();
            })
            .catch((err) => {
                if (err.response) {
                    term.writeln(err.response.data.error);
                } else {
                    term.writeln(err.message);
                }
                this.prompt();
            });
    };

    doLogin = (exe) => {
        let arrCmd = exe.trim().split(' ');
        if(arrCmd.length !== 3){
            term.writeln("Command format not found.");
        }
        let username = arrCmd[1];
        let password = arrCmd[2];
        axiosInstance()
            .post("/users/login", JSON.stringify({"username" : username, password : password}))
            .then((res) => {
                if(res.data.access_token){
                    localStorage.access_token = res.data.access_token;
                    this.getUserAuth();
                    term.writeln("Login success.");
                }else {
                    term.writeln(res.data.message);
                }
            })
            .catch((err) => {
                if (err.response) {
                    term.writeln(err.response.data.error);
                } else {
                    term.writeln(err.message);
                }
                this.startLoginNow();
            });
    };

    startLoginNow = () => {
        command =  "login ";
        var shellprompt = "$ Please Login, username : ";
        term.write("\r\n" + shellprompt);
    }

    getUserAuth = () => {
        axiosInstance()
            .get("/user")
            .then((res) => {
                this.setState({
                    username: res.data.username
                });
                this.prompt();
            })
            .catch((err) => {
                this.startLoginNow()
            });
    }


    render() {
        commands = {
            help: {
                f: (exe) => {
                    term.writeln([
                        'Try some of the commands below.',
                        '',
                        ...Object.keys(commands).map(e => `  ${commands[e].usage.padEnd(25)} ${commands[e].description}`)
                    ].join('\n\r'));
                    this.prompt();
                },
                usage: "help",
                description: 'Prints this help message',
            },
            ls: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "ls",
                description: 'Prints list command'
            },
            edit: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "edit [file path]",
                description: 'Edit source code.'
            },
            adduser: {
                f: (exe) => {
                    if (this.state.username == "admin"){
                        this.doAction(exe);
                    }else{
                        term.writeln("Error user permission.");
                        this.prompt();
                    }
                },
                usage: "adduser",
                description: 'Link to add user form.'
            },
            // build: {
            //     f: (exe) => {
            //         this.doAction(exe);
            //         // this.prompt();
            //     },
            //     usage: "build [package] [output] ",
            //     description: 'Build Command.'
            // },
            // run: {
            //     f: (exe) => {
            //         this.doAction(exe);
            //         // this.prompt();
            //     },
            //     usage: "run [command path]",
            //     description: 'Run Command.'
            // },
            go: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "go [command] [args..] ",
                description: 'Run Go Command.'
            },
            cargo: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "cargo [command] [args..] ",
                description: 'Run Cargo Rust Command.'
            },
            clear: {
                f: (exe) => {
                    term.clear();
                    this.prompt();
                },
                usage: "clear",
                description: 'Clear terminal.'
            },
            login: {
                f: (exe) => {
                    this.doLogin(exe);
                },
                usage: "login [username]",
                description: 'Login user'
            },
            logout: {
                f: (exe) => {
                    localStorage.removeItem("access_token");
                    this.setState({
                        username: ""
                    });
                    // this.prompt();
                    this.startLoginNow();
                },
                usage: "logout",
                description: 'Logout '
            },
            cd: {
                f: (exe) => {
                    this.doChangeDir(exe);
                },
                usage: "cd [directory path]",
                description: 'Change location directory'
            },
            mkdir: {
                f: (exe) => {
                    this.doAction(exe);
                },
                usage: "mkdir [directory name]",
                description: 'Make a directory'
            },
            rm: {
                f: (exe) => {
                    this.doAction(exe);
                },
                usage: "rm [file]",
                description: 'remove file'
            },
            rmdir: {
                f: (exe) => {
                    this.doAction(exe);
                },
                usage: "rmdir [args] [directory]",
                description: 'remove directory'
            },
            pwd: {
                f: (exe) => {
                    this.doAction(exe);
                },
                usage: "pwd",
                description: 'return working directory name'
            },
            cat: {
                f: (exe) => {
                    if (/cat >+ \S+$/i.test(exe)){
                        if (!conn) {
                            return false;
                        }
                        conn.send(this.state.username + "#" + this.state.currentPath + "#" + exe);
                        wsStatus = true;
                    }else{
                        this.doAction(exe);
                    }
                },
                usage: "cat [args] [file]",
                description: 'Create and modify file'
            },
            touch: {
                f: (exe) => {
                    this.doAction(exe);
                },
                usage: "pwd",
                description: 'return working directory name'
            }
        };

        return (
            <div style={{
                background: "#000000",
                padding: "1.5em",
                margin: "0"
            }}>
                <div id="xterm" style={{ height: "100vh", width: "100%" }} />
            </div>
        );
    }
}
