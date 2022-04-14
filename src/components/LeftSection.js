import React, {useState} from 'react'
import EditorSection from './EditorSection';
import FilesSection from './FilesSection';
import HelpSection from './HelpSection';

const LeftSection = ({ activeMenu, username, setActiveMenu }) => {
    const [filepath, setFilepath] = useState('');
    let activeSection, heightCls, bgCls;
    switch (activeMenu) {
        case 'files':
            activeSection = <FilesSection
                username={username}
                setFilepath={setFilepath}
                setActiveMenu={setActiveMenu}
            />;
            heightCls = 'full';
            bgCls = 'bg-white';
            break;
        case 'open':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
            />;
            heightCls = 'full';
            bgCls = 'bg-gelap';
            break;
        case 'terminal':
            activeSection = <EditorSection
                username={username}
                filepath={filepath}
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
                filepath={filepath}
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