"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LoginDialog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_API+"/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
        // localStorage.setItem("token", data.access_token)
        console.log("From login api :",data )
      login(data.access_token, { email, username: data.username });
      console.log("Login success:", data);
      alert("Login successful!");
      // optionally redirect or close dialog
    } catch (err: any) {
      alert(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Log in</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111112] border border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Login</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <input
            className="p-2 rounded-md bg-black border border-gray-700 text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="p-2 rounded-md bg-black border border-gray-700 text-white"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button disabled={loading} onClick={handleLogin}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
