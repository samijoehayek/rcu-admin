"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "../../utils/authUtils";

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }

    if (!isAdmin()) {
      // User is authenticated but not an admin
      router.replace("/unauthorized");
      return;
    }
  }, [router]);

  return <>{children}</>;
};

export default AdminGuard;