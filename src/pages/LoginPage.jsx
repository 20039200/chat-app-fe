import { useAuthStore } from "../store/useAuthStore";
import {
  MessageSquare,
} from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LogInPage = () => {
  const { signup } = useAuthStore();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="mb-8 text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div className="flex items-center justify-center transition-colors size-12 rounded-xl bg-primary/10 group-hover:bg-primary/20">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="mt-2 text-2xl font-bold">Sign Up / Sign In via Google</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              className="w-full"
              onSuccess={(credentialResponse) => {
                const credentials = jwtDecode(credentialResponse.credential);

                signup({
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
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};
export default LogInPage;
