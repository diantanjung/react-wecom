import React from 'react'
import EditorSection from './EditorSection'
import FilesSection from './FilesSection'
import HelpSection from './HelpSection';

const TopSection = ({ activeMenu, username }) => {
    let activeSection, heightCls, bgCls;
    console.log("username top : " + username)
    switch (activeMenu) {
        case 'files':
            activeSection = <FilesSection
                username={username}
            />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        case 'open':
            activeSection = <EditorSection
                username={username}
            />;
            heightCls = 'full';
            bgCls = 'bg-gelap';
            break;
        case 'terminal':
            activeSection = <EditorSection
                username={username}
            />;
            heightCls = 'setengah';
            bgCls = 'bg-gelap';
            break;
        case 'help':
            activeSection = <HelpSection />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        default:
            activeSection = <EditorSection
                username={username}
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

export default TopSection