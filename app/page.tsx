"use client";
import Clock from "@/components/clock";
import Leftside from "@/components/leftside";
import Rightside from "@/components/rightside";
import { useState } from "react";

export default function Home() {
  const [isInfo, setIsInfo] = useState(false);

  return (
    <div>
      <div className="header">
          <a className="switcher float-left" href="/">
            <span className="first">Amala</span> <span className="second">Network</span>
          </a>
          <div className="switcher float-right text-right">
            <a onClick={() => setIsInfo(e => !e)}>
              <span className={isInfo ? "first" : "second"}>Work</span> <span className={isInfo ? "second" : "first"}>Info</span>
            </a>
            <Clock/>
          </div>
        </div>
        <div className="content">
          <Leftside/>
          <Rightside/>
        </div>
    </div>
  );
}
