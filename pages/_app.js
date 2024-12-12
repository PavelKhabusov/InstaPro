import "../styles/globals.css";
import { RecoilRoot } from "recoil";
import { StrictMode } from "react";
import { useAuthSession } from "../firebase"; // Ensure correct firebase initialization
import { ToastContainer, Slide } from "react-toastify";

function MyApp({ Component, pageProps }) {
  const userSession = useAuthSession();

  return (
    <StrictMode>
      <RecoilRoot>
        {/* Pass the user session as a prop */}
        <Component {...pageProps} userSession={userSession} />
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
