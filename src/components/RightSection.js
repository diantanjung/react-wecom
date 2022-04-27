import React from 'react'
import TerminalSection from './TerminalSection'
import { Terminal } from "xterm";
import LocalEchoController from 'local-echo';
import { FitAddon } from 'xterm-addon-fit';

const RightSection = ({ activeMenu, username }) => {
    let activeSection, heightCls;
    const term = new Terminal({
        convertEol: true,
        fontFamily: `Abel, monospace, MesloLGS NF`,
        fontSize: 13,
        fontWeight: 400,
        height: `20px`,
        margin: `20px`,
        theme: {
            background: '#1e1e1e'
        }
        // rendererType: "dom" // default is canvas
    });
    const localEcho = new LocalEchoController();
    const fitAddon = new FitAddon();

    switch (activeMenu) {
        case 'files':
            heightCls = 'hilang';
            break;
        case 'open':
            heightCls = 'hilang';
            break;
        case 'terminal':
            heightCls = 'setengah';
            activeSection = <TerminalSection
                term={term}
                localEcho={localEcho}
                fitAddon={fitAddon}
                username={username}
                activeMenu={activeMenu}
            />
            break;
        case 'output':
            heightCls = 'hilang';
            break;
        case 'help':
            heightCls = 'hilang';
            break;
        default:
            break;
    }
    return (
        <div className={`${heightCls} bg-gelap`} style={{}}>
            {activeSection}
        </div>
    )
}

export default RightSection