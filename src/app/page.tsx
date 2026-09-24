"use client";

import LoginCard from "../components/LoginCard";

export default function Home() {
  return (
    <div className="min-h-screen supports-[min-height:100svh]:min-h-svh p-4 grid place-items-center">
      <LoginCard />
    </div>
  );
}
