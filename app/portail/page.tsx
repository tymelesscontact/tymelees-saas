"use client";
import dynamic from "next/dynamic";

const TymelessPortail = dynamic(() => import("./TymelessPortail"), {
  ssr: false,
});

export default function Page() {
  return <TymelessPortail />;
}