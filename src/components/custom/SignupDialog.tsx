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

export default function SignupDialog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
      }

      const data = await res.json();
      login(data.access_token, { email, username: data.username });
      console.log("Signup success:", data);
      alert("Signup successful!");
      // optionally redirect or close dialog
    } catch (err: any) {
      alert(err.message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Sign up</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111112] border border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Sign up</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <input
            className="p-2 rounded-md bg-black border border-gray-700 text-white outline-none"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="p-2 rounded-md bg-black border border-gray-700 text-white outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="p-2 rounded-md bg-black border border-gray-700 text-white outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button disabled={loading} onClick={handleRegister} className="">
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
