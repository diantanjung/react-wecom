import React, { useEffect, useState, useRef } from "react";
import "./Psaux.css"


const Psaux = () => {
    const [log, setLog] = useState([]);
    const ws = useRef();

    useEffect(() => {
        const url = `${process.env.REACT_APP_BE_WSDEBUG}`;
        if (!ws.current) {
            ws.current = new WebSocket(url);
        }
        // if (ws.current.readyState === 1 && ws.current) {
        //     init();
        // } else {
        //     setTimeout(init, 5000);
        // }

        ws.current.onopen = function () {
            if (ws.current.readyState === 1 && ws.current) {
                ws.current.send("ps aux\n");
            }
        };

        ws.current.onmessage = function (evt) {
            console.log(evt.data);
            setLog(prev => [...prev, evt.data]);
        };

        return () => ws.current.close();

    }, []);

    return (
        <div>
            <div className="hdebug-bg">
                <h6 className="h5-debug">PS AUX LIST</h6>
            </div>
            <div className="ps-bg">
                <table>
                    {log.map((item, key) => {
                        let split_item = item.split(/ +/);
                        let cmd = split_item.slice(11);
                        console.log(cmd);
                        let kolom = split_item.map((item, key) => {
                            if (key < 10)
                                return <td>{item}</td>
                            if (key == 10)
                                return <td>{item} {cmd.join(' ')}</td>
                        });
                        return <tr>{kolom}</tr>;
                    }

                    )}
                </table>
            </div>
        </div>
    )
}

export default Psaux