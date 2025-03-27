import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const { googleSignInUp } = useAuthStore();

  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="flex items-center justify-center w-12 h-12 transition-colors rounded-xl bg-primary/10 group-hover:bg-primary/20"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="mt-2 text-2xl font-bold">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              className="w-full"
              onSuccess={(credentialResponse) => {
                const credentials = jwtDecode(credentialResponse.credential);

                googleSignInUp({
                  fullName: credentials.name,
                  email: credentials.email,
                  profilePic: credentials.picture,
                });
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />
    </div>
  );
};
export default LoginPage;