import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Feed from "../components/Feed";
import Model from "../components/Model";
import { app, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, onUserAuthStateChanged, auth } from "../firebase";
import { useRecoilState } from "recoil";
import { themeState, userActivity } from "../atoms/states";
// import initBeams from "../components/initBeams";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [currentUser, setSession] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setSession(u); 
      else setSession(null);
    })
    // const unsubscribe = onUserAuthStateChanged((u) => {
    //   if (u) setUser(u); 
    //   else setUser(null); 
    // });
    return () => unsubscribe();
  });


  const router = useRouter();
  const [darkMode, setDarkMode] = useRecoilState(themeState);
  // const [beamsInitialized, setBeamsInitialized] = useRecoilState(beamsState);
  const [load, setLoad] = useState(false);
  const [active, setActive] = useRecoilState(userActivity);
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("theme"));
    setDarkMode(theme);
    // const beams = JSON.parse(localStorage.getItem("beamsState"));
    // setBeamsInitialized(beams);
  }, [setDarkMode]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (currentUser != undefined && !user) {
      getDoc(doc(db, `profile/${currentUser.email.split("@")[0]}`)).then(
        async (prof) => {
          if (prof.exists()) {
            setUser(prof.data());
          } else {
            console.log(currentUser);
            await setDoc(doc(db, "profile", currentUser.email.split("@")[0]), {
              username: currentUser.displayName,
              login: currentUser.email.split("@")[0],
              uid: currentUser.uid,
              image: currentUser?.photoURL,
              email: currentUser.email,
              timeStamp: serverTimestamp(),
            });
            toast.success(`Welcome User: ${currentUser.displayName}🥰`, {
              toastId: currentUser.uid,
            });
            setUser(currentUser);
          }
        }
      );
      // if (typeof Notification !== "undefined" && !beamsInitialized) {
      //   // initBeams(session.currentUser.uid, session.currentUser.displayName, setBeamsInitialized);
      // }
    }
    setActive(true);
  }, [user, setActive, currentUser]);

  const callback = (entries) => {
    // entries.forEach((entry) => {
    //   if (entry.isIntersecting) {
    //     entry.target.play();
    //   } else {
    //     entry.target.pause();
    //   }
    // });
  };

  // useEffect(() => {
  //   let observer;
  //   if (load) {
  //     observer = new IntersectionObserver(callback, { threshold: 0.6 });
  //     const elements = document.querySelectorAll("video");
  //     elements.forEach((element) => {
  //       observer.observe(element);
  //     });
  //   }
  //   return () => {
  //     observer?.disconnect();
  //   };
  // }, [load]);

  return (
    <div
      className={`h-screen overflow-y-scroll scrollbar-hide -z-3 ${
        darkMode ? "bg-gray-50" : "dark bg-black"
      }`}
    >
      <Head>
        <title>Kartoteka | Social</title>
      </Head>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} user={user} />
      {/* <img alt="Light ray background" src="../..public/bghero.png" className="bghero"></img> */}

      <Feed setLoad={setLoad} user={user} />
      <Model />
    </div>
  );
}
