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

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: "",
            username: "",
            currentPath: "~"
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

        //Styling
        term.setOption("theme", {
            background: "#000000",
            foreground: "#FFFFFF"
        });

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
                }
            }else if(e === '\r' && command.trim().split(' ')[0] == "login"){
                var shellprompt = "$ please input password :  ";
                term.write("\r\n" + shellprompt);
                command +=  ' ';
                login = true;
            }else{
                switch (e) {
                    case '\u0003': // Ctrl+C
                        term.write('^C');
                        this.prompt();
                        break;
                    case '\r': // Enter
                        this.runCommand(term, command);
                        command = '';
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
                            }
                        }
                        break;
                    default: // Print all other characters for demo
                        if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7B)) {
                            command += e;
                            term.write(e);
                        }
                }
            }

        });

        // this.prompt();
    }

    runCommand = (term, text) => {
        const command = text.trim().split(' ')[0];
        if (command.length > 0) {
            term.writeln('');
            if (command in commands) {
                commands[command].f(text);
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
                console.log(err.response.data);
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
        var shellprompt = "$ Please Login, username : ";
        term.write("\r\n" + shellprompt);
        command =  "login ";
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
                console.log(err.message);
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
            build: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "build [package] [output] ",
                description: 'Build Command.'
            },
            run: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "run [command path]",
                description: 'Run Command.'
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
                usage: "rm [file name]",
                description: 'remove a directory/file'
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
