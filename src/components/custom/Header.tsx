"use client"

import React from "react";
import SignupDialog from "./SignupDialog";
import LoginDialog from "./LoginDialog";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import Link from "next/link";

const Header = () => {
  const { user, isAuthenticated, logout,loading } = useAuth();

  return (
    <div className="w-full h-16 flex justify-between items-center p-4 z-10 sticky">
      <Link href={'/'}>
        <div className="font-bold text-2xl text-white">aniMate</div>
        </Link>
     {!loading &&  <div className="flex gap-3 items-center">
        {isAuthenticated ? (
          <>
            <span className="text-white">
              Hi, {user?.username ?? user?.email}
            </span>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <LoginDialog />
            <SignupDialog />
          </>
        )}
      </div>}
    </div>
  );
};

export default Header;
