"use client";
import dynamic from "next/dynamic";

const TymelessOS = dynamic(() => import("./tymeless"), {
  ssr: false,
  loading: () => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810",color:"#C9A84C",fontSize:"18px"}}>
      Chargement Xyra...
    </div>
  ),
});

export default function DashboardPage() {
  return <TymelessOS />;
}