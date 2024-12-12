import { useState, useEffect } from "react";
import { signInWithGoogle, signInWithApple, signOutUser, onUserAuthStateChanged } from "../firebase";
import { useRouter } from "next/router";
import Image from "next/image";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // If logged in, set user state
        router.push("/"); // Redirect to home
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
    <div className="flex flex-col m-auto items-center justify-center w-full h-screen p-20 dark:bg-gray-900">
      <div className="relative h-28 w-28">
        <Image
          loader={() => require("../public/icon-512x512.png")}
          loading="eager"
          src={require("../public/icon-512x512.png")}
          alt="instaLogo"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <h6 className="px-2 py-1 text-sm font-bold italic mt-10 text-gray-600 dark:text-gray-400">
        Welcome To Kartoteka
      </h6>
      <div className="mt-10">
        {/* Sign-In Button for Google */}
        {!loading && !user && (
          <button
            onClick={handleSignInWithGoogle}
            className="p-2 px-3 bg-blue-400 shadow-lg border rounded-lg text-lg font-bold italic mt-2 text-white cursor-pointer hover:text-blue-500 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-500 dark:text-gray-300 dark:hover:text-blue-600"
          >
            Sign in with Google
          </button>
        )}

        {/* Sign-In Button for Apple */}
        {!loading && !user && (
          <button
            onClick={handleSignInWithApple}
            className="p-2 px-3 bg-gray-900 shadow-lg border rounded-lg text-lg font-bold italic mt-4 text-white cursor-pointer hover:text-gray-500 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-600"
          >
            Sign in with Apple
          </button>
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
  );
};

export default Login;
