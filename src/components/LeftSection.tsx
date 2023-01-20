
import { useState } from "react";
import { Editor } from "./Editor";
import FilesSection from "./FilesSection";
import HelpSection from "./HelpSection";
import OutputSection from "./OutputSection";

type LeftSectionProps = {
  activeMenu: string;
  username: string;
  setActiveMenu: (menu: string) => void;
  dirpath: string;
  setDirpath: (dirpath: string) => void;
};

const LeftSection = ({
  activeMenu,
  username,
  setActiveMenu,
  dirpath,
  setDirpath,
}: LeftSectionProps) => {
  const [runpath, setRunpath] = useState("");
  let activeSection, heightCls, bgCls;
  switch (activeMenu) {
    case "files":
      activeSection = (
        <FilesSection
          username={username}
          setRunpath={setRunpath}
          setDirpath={setDirpath}
          setActiveMenu={setActiveMenu}
        />
      );
      heightCls = "full";
      bgCls = "bg-white";
      break;
    case "open":
      activeSection = <Editor />;
      heightCls = "full";
      bgCls = "bg-gelap";
      break;
    case "terminal":
      activeSection = <Editor />;
      heightCls = "setengah";
      bgCls = "bg-gelap";
      break;
    case "run":
      activeSection = <Editor />;
      heightCls = "setengah";
      bgCls = "bg-gelap";
      break;
    case "debug":
      activeSection = <Editor />;
      heightCls = "setengah";
      bgCls = "bg-gelap";
      break;
    case "output":
      activeSection = <OutputSection username={username} runpath={runpath} />;
      heightCls = "full";
      bgCls = "bg-white";
      break;
    case "help":
      activeSection = <HelpSection />;
      heightCls = "full";
      bgCls = "bg-white";
      break;
    default:
      activeSection = <Editor />;
      heightCls = "full";
      bgCls = "bg-gelap";
      break;
  }
  return <div className={`${heightCls} ${bgCls}`}>{activeSection}</div>;
};

export default LeftSection;
