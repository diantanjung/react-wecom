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
            fontFamily: `'Fira Mono', monospace`,
            fontSize: 15,
            fontWeight: 900
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
                commands[command].f();
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
            .get("/terminal/" + this.props.match.params.dir + "/" + this.props.match.params.cmd + "/" + exe)
            .then((res) => {
                term.writeln(res.data.message);
                this.prompt();
            })
            .catch((err) => {
                term.writeln(err.message);
                this.prompt();
            });
    };


    render() {
        commands = {
            help: {
                f: () => {
                    term.writeln([
                        'Welcome to xterm.js! Try some of the commands below.',
                        '',
                        ...Object.keys(commands).map(e => `  ${e.padEnd(10)} ${commands[e].description}`)
                    ].join('\n\r'));
                    this.prompt();
                },
                description: 'Prints this help message',
            },
            ls: {
                f: () => {
                    this.doAction("ls");
                    // this.prompt();
                },
                description: 'Prints list file in directory ' + "/" + this.props.match.params.dir + "/" + this.props.match.params.cmd
            }
        };

        return (
            <div className="App" style={{ background: "" }}>
                <h1>Xterm.js</h1>
                <Resizable
                    width={350}
                    height={350}
                    style={{
                        background: "#1E1E1E",
                        padding: "1em",
                        margin: "0"
                    }}
                >
                    <div id="xterm" style={{ height: "100%", width: "100%" }} />
                    <ResizeObserver
                        onResize={rect => {
                            fitAddon.fit();
                            console.log("Resized. New bounds:", rect.width, "x", rect.height);
                        }}
                        onPosition={rect => {
                            console.log("Moved. New position:", rect.left, "x", rect.top);
                        }}
                    />
                </Resizable>
            </div>
        );
    }
}