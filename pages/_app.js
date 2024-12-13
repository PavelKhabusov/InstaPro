import "../styles/globals.css";
import { RecoilRoot } from "recoil";
import { StrictMode, useState, useEffect } from "react";
import { app, onUserAuthStateChanged } from "../firebase"; // Ensure correct firebase initialization
import { ToastContainer, Slide } from "react-toastify";

function MyApp({ Component, pageProps }) {
  const [session, setUser] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      if (user) setUser(user); 
      else setUser(null); 
    });
    return () => unsubscribe();
  });


  return (
    <StrictMode>
      <RecoilRoot>
        {/* Pass the user session as a prop */}
        <Component {...pageProps} userSession={session} />
        <ToastContainer
          autoClose={2500}
          position={"top-left"}
          transition={Slide}
          limit={2}
          theme="dark"
          pauseOnFocusLoss={false}
        />
      </RecoilRoot>
    </StrictMode>
  );
}

export default MyApp;
