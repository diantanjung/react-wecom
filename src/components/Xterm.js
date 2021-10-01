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

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: ""
        };
    }

    componentDidMount() {
        term = new Terminal({
            convertEol: true,
            fontFamily: `Abel, monospace`,
            fontSize: 15,
            fontWeight: 400
            // rendererType: "dom" // default is canvas
        });

        //Styling
        term.setOption("theme", {
            background: "#1E1E1E",
            foreground: "#DCDCDC"
        });

        // Load Fit Addon
        term.loadAddon(fitAddon);

        // Open the terminal in #terminal-container
        term.open(document.getElementById("xterm"));

        //Write text inside the terminal
        term.write("Write your command below, try running `help`.");

        // Make the terminal's size and geometry fit the size of #terminal-container
        fitAddon.fit();

        term.onData(e => {
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
                    if (term._core.buffer.x > 2) {
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
        });

        this.prompt();
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
        var shellprompt = "$ ";
        term.write("\r\n" + shellprompt);
    };

    doAction = (exe) => {
        axiosInstance()
            .post("/terminal", JSON.stringify({"exe" : exe}))
            .then((res) => {
                if(res.data.path){
                    window.open(res.data.path, '_blank');
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
            open: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "open [dir/command/file]",
                description: 'Open source code.'
            },
            build: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "build [dir/command]",
                description: 'Build Command.'
            },
            run: {
                f: (exe) => {
                    this.doAction(exe);
                    // this.prompt();
                },
                usage: "run [dir/command]",
                description: 'Run Command.'
            },
            clear: {
                f: (exe) => {
                    window.location = "/";
                    // this.prompt();
                },
                usage: "clear",
                description: 'Clear terminal.'
            }
        };

        return (
            <div style={{
                background: "#1E1E1E",
                "border-radius": "10px",
                padding: "1.5em",
                margin: "0",
                height: "650px",
                width: "100%"
            }}>
                <div id="xterm" style={{ height: "100%", width: "100%" }} />
            </div>
        );
    }
}

// <div style={{ background: "" }}>
//     <Resizable
//         width={500}
//         height={4000}
//         style={{
//             background: "#1E1E1E",
//             padding: "1em",
//             margin: "0",
//             "border-radius": "10px",
//             "height" : "2000px"
//         }}
//     >
//         <div id="xterm" style={{ height: "100%", width: "100%" }} />
//         <ResizeObserver
//             onResize={rect => {
//                 fitAddon.fit();
//                 console.log("Resized. New bounds:", rect.width, "x", rect.height);
//             }}
//             onPosition={rect => {
//                 console.log("Moved. New position:", rect.left, "x", rect.top);
//             }}
//         />
//     </Resizable>
// </div>