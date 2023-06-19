import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { setNotifStatus } from "../../store/feature/openAiSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import "./Notification.css";

const Notification = () => {
    const { acceptCode } = useAppSelector(
        (store) => store.openai
      );
    const dispatch = useAppDispatch();
    return (
        <div className="notification-item">
            <button onClick={() => dispatch(setNotifStatus({notifStatus: false}))}>X</button>
            <h4>Open AI Response</h4>
            <ReactMarkdown>{acceptCode}</ReactMarkdown>
        </div>
    )
}

export default Notification