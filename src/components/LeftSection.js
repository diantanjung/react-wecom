import React, { useState } from 'react'
import EditorSection from './EditorSection';
import FilesSection from './FilesSection';
import HelpSection from './HelpSection';
import OutputSection from './OutputSection';

const LeftSection = ({ activeMenu, username, setActiveMenu, filepath, setFilepath, dirpath, setDirpath, breakpoints, setBreakpoints, curbp, lastbp }) => {
    const [runpath, setRunpath] = useState('');
    let activeSection, heightCls, bgCls;
    switch (activeMenu) {
        case 'files':
            activeSection = <FilesSection
                username={username}
                setFilepath={setFilepath}
                setRunpath={setRunpath}
                setDirpath={setDirpath}
                setActiveMenu={setActiveMenu}
            />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        case 'open':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
                activeMenu={activeMenu}
                breakpoints={breakpoints}
                setBreakpoints={setBreakpoints}
            />;
            heightCls = 'full';
            bgCls = 'bg-gelap';
            break;
        case 'terminal':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
                activeMenu={activeMenu}
                breakpoints={breakpoints}
                setBreakpoints={setBreakpoints}
            />;
            heightCls = 'setengah';
            bgCls = 'bg-gelap';
            break;
        case 'run':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
                activeMenu={activeMenu}
                breakpoints={breakpoints}
                setBreakpoints={setBreakpoints}
            />;
            heightCls = 'setengah';
            bgCls = 'bg-gelap';
            break;
        case 'debug':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
                activeMenu={activeMenu}
                breakpoints={breakpoints}
                setBreakpoints={setBreakpoints}
                curbp={curbp}
                lastbp={lastbp}
            />;
            heightCls = 'setengah';
            bgCls = 'bg-gelap';
            break;
        case 'output':
            activeSection = <OutputSection
                username={username}
                runpath={runpath}
            />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        case 'help':
            activeSection = <HelpSection />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        default:
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
                breakpoints={breakpoints}
                setBreakpoints={setBreakpoints}
            />;
            heightCls = 'full';
            bgCls = 'bg-gelap';
            break;
    }
    return (
        <div className={`${heightCls} ${bgCls}`} >
            {activeSection}
        </div>
    )
}

export default LeftSection