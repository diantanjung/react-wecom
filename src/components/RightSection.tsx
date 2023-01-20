import React, { useState } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import DebugSection from "./DebugSection";
import { useAppSelector } from "../store/store";
import { Terminal } from "./Terminal";

type RightSectionProps = {
  activeMenu: string;
  filepath: string;
  dirpath: string;
};

const RightSection = ({ activeMenu, filepath, dirpath }: RightSectionProps) => {
  let activeSection, heightCls;
  const [terminal, setTerminal] = React.useState<XTerminal | null>(null);

  const term = new XTerminal({
    convertEol: true,
    fontFamily: `Abel, monospace, MesloLGS NF`,
    fontSize: 13,
    fontWeight: 400,
    theme: {
      background: "#1e1e1e",
    },
    // rendererType: "dom" // default is canvas
  });
  const fitAddon = new FitAddon();

  const { aktifTabItem } = useAppSelector((store) => store.filetabs);

  switch (activeMenu) {
    case "files":
      heightCls = "hilang";
      break;
    case "open":
      heightCls = "hilang";
      break;
    case "terminal":
      heightCls = "setengah";
      activeSection = (
        <Terminal
          setTerminal={setTerminal}
          activeMenu={activeMenu}
          filepath={filepath}
          dirpath={dirpath}
        />
      );
      break;
    case "run":
      heightCls = "setengah";
      activeSection = (
        <Terminal
          setTerminal={setTerminal}
          activeMenu={activeMenu}
          filepath={filepath}
          dirpath={dirpath}
        />
      );
      break;
    case "debug":
      heightCls = "setengah";
      if (aktifTabItem.language == "racket") {
        activeSection = (
          <Terminal
          setTerminal={setTerminal}
          activeMenu={activeMenu}
          filepath={filepath}
          dirpath={dirpath}
        />
        );
      } else {
        activeSection = <DebugSection />;
      }
      break;
    case "output":
      heightCls = "hilang";
      break;
    case "help":
      heightCls = "hilang";
      break;
    default:
      break;
  }
  return (
    <div className={`${heightCls} bg-gelap`} style={{}}>
      {activeSection}
    </div>
  );
};

export default RightSection;
