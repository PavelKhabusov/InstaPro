import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../firebase";

const SetStatus = ({ login, active, setActive }) => {
  useEffect(() => {
    window.addEventListener("focus", () => setActive(true));
    window.addEventListener("blur", () => setActive(false));
    window.addEventListener("online", () => setActive(true));
    window.addEventListener("offline", () => setActive(false));
    return () => {
      window.removeEventListener("focus", () => setActive(true));
      window.removeEventListener("blur", () => setActive(false));
      window.addEventListener("online", () => setActive(true));
      window.addEventListener("offline", () => setActive(false));
    };
  }, [setActive]);

  useEffect(() => {
    const setStatus = async () => {
      getDoc(doc(db, "profile", login)).then(async (data) => {
        if (data.exists()) {
          await updateDoc(doc(db, `profile/${login}`), {
            active: active,
            timeStamp: serverTimestamp(),
          });
        }
      });
    };
    if (login) {
      setStatus();
    }
  }, [login, active]);

  return <></>;
};

export default SetStatus;
