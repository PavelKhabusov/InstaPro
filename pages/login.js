import { useState, useEffect } from "react";
import { signInWithGoogle, signInWithApple, signOutUser, onUserAuthStateChanged } from "../firebase";
import { useRouter } from "next/router";
import Image from "next/image";

const Login = () => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // If logged in, set user state
        router.push(``); // Redirect to home
      } else {
        setUser(null); // If not logged in, reset user state
      }
    });
    return () => unsubscribe(); // Clean up the listener on unmount
  }, [router]);

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(); // Sign-in with Google
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setLoading(false);
    }
  };

  const handleSignInWithApple = async () => {
    setLoading(true);
    try {
      await signInWithApple(); // Sign-in with Apple
    } catch (error) {
      console.error("Error during Apple sign-in:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser(); // Sign-out the user
    } catch (error) {
      console.error("Error during sign-out:", error);
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 flex flex-col m-auto items-center justify-center login">
      {/* <h2>Аккаунт</h2> */}
      <div className="authentication bg-[#171717] rounded-[20px] p-4">
        <div className="flex flex-col">
          {/* Sign-In Button for Google */}
          {!loading && !user && (
            <button
              onClick={handleSignInWithGoogle}
              className="flex items-center justify-center p-2 px-3 bg-[#3e3e3e] shadow-lg transition-all rounded-[30px] hover:rounded-[10px] text-lg text-white cursor-pointer bg-slate-900"
            >
            <img className="firebaseui-idp-icon mr-2" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"></img>
              Sign in with Google
            </button>
          )}

          {/* Sign-In Button for Apple */}
          {!loading && !user && (
            <button
              onClick={handleSignInWithApple}
              className="flex items-center justify-center p-2 px-3 bg-[#3e3e3e] shadow-lg transition-all rounded-[30px] hover:rounded-[10px] text-lg mt-2 text-white cursor-pointer bg-slate-900"
            >
            <img className="firebaseui-idp-icon mr-2" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/apple.png"></img>
              Sign in with Apple
            </button>
          )}

          {!user && (
            <p className="mt-2 text-gray-400 text-center text-xs">
             By continuing, you are indicating <br/>that you accept our <a rel="noreferrer" href="https://kartoteka.digital/privacy-policy.php" target="_blank">Privacy Policy</a>.
            </p>
          )}

          {loading && <p className="mt-2 text-gray-400">Loading...</p>}

          {/* Sign-out Button if user is logged in */}
          {user && (
            <button
              onClick={handleSignOut}
              className="p-2 px-3 bg-red-500 shadow-lg border rounded-lg text-lg font-bold italic mt-2 text-white cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
