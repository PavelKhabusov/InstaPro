import { useState } from "react";
import { signInWithGoogle, signInWithApple } from "../../firebase"; // Assuming this is where your firebase.js config is located
import Image from "next/image";
import { useRouter } from "next/router"; // For redirect after successful login

const SignIn = () => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [error, setError] = useState(null);
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <div className="relative h-28 w-28">
        <Image
          loader={imgLoader}
          loading="eager"
          src={require("../../public/icon-512x512.png")}
          alt="InstaPro Logo"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <p className="font-xs italic text-gray-500">InstaPro</p>
      <div className="mt-10">
        {error && <p className="text-red-500">{error}</p>} {/* Display any errors */}
        {/* Google Sign-In Button */}
        <button
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-gray-100 font-semibold hover:text-blue-500 shadow-lg border mb-4"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
        {/* Apple Sign-In Button */}
        <button
          className="p-3 bg-black text-white rounded-lg hover:bg-gray-100 font-semibold hover:text-black shadow-lg border"
          onClick={signInWithApple}
        >
          Sign in with Apple
        </button>
      </div>
    </div>
  );
};

export default SignIn;
