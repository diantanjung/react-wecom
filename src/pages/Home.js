import React from 'react';
import Xterm from "../components/Xterm";
import {useLocation} from "react-router-dom";

export default function Home(props) {
  // let home;
  // if (props.username === ''){
  //   home = (
  //     <div className="text-center">You are not loged in.</div>
  //     );
  // }else{
  //   home = (
  //     <div>
  //      <Xterm />
  //     </div>
  //   );
  // }

    let location = useLocation();
    // let file = location.pathname.substring(10);

    return (
      <div>
        <Xterm username={props.username} />
      </div>
    );
}