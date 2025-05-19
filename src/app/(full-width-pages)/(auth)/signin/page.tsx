import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Portal | Sign In",
  description: "Sign in to access your admin dashboard",
};

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-5xl flex overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Left side - Sign in form */}
        <div className="w-full md:w-1/2 p-6">
          <SignInForm />
        </div>
        
        {/* Right side - Decorative */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 p-12 relative">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center text-white">
            <div className="mb-8">
              <Image
                src="/images/logo.svg" // Update this path to your logo
                alt="Company Logo"
                width={150}
                height={40}
                priority
              />
            </div>
            
            <h2 className="text-3xl font-bold mb-6">
              Admin Dashboard
            </h2>
            
            <p className="text-white/80 mb-8 text-lg max-w-md">
              Manage your application, monitor performance, and make data-driven decisions all in one place.
            </p>
            
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="h-2 w-2 rounded-full bg-white/70"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}