"use client";
import Clock from "@/components/clock";
import Leftside, { Info } from "@/components/leftside";
import Rightside from "@/components/rightside";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import Link from "next/link";
import { TagProvider } from '@/components/contexts/tagcontext';

const API_BASE = "https://blue-river-ebb7.tomaszkkmaher.workers.dev"

export default function Home() {
  const [isInfo, setIsInfo] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [id, setid] = useState(0);
  const params = useSearchParams();
  const n = params.get("id");
  if (n && !isNaN(parseInt(n.toString()))) {
    if (parseInt(n.toString()) !== id) {
      setid(parseInt(n.toString()));
    }
  }
  const [list, setList] = useState<PortfolioItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function getPortfolioItems() {
    await fetch(`${API_BASE}/api/portfolio`, {})
      .then((res) => res.json())
      .then((data) => {
        let output: PortfolioItem[] = [];
        let i = 0;
        for (const item of data.items) {
            output.push({
                id: item.id,
                name: item.name,
                body: item.body,
                client: item.client,
                tags: item.tags.split(','),
                images: item.images,
                video_url: item.video_url ? item.video_url : null,
                date: new Date(item.date),
                index: i,
                link: item.link ? item.link : null,
            });
            
            i++;
        }
        if (id >= output.length) {
          setid(0);
        }
        setList(output);
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Error fetching portfolio items:", err);
      });
  }

  useEffect(() => {
      getPortfolioItems();
  }, []);

  useEffect(() => {
    setTrigger(true);
    const timer = setTimeout(() => setTrigger(false), 500); 
    return () => clearTimeout(timer);
  }, [isInfo]); 

  return (
    <div>
      <TagProvider>
        <div className="header">
          <Link className="switcher float-left" href="/" onClick={() => setIsInfo(false)}>
            <span className="first">Amala</span> <span className="second">Network</span>
          </Link>
          <div className="switcher float-right text-right">
            <a onClick={() => setIsInfo(e => !e)}>
              <span className={isInfo ? "first" : "second"}>Work</span>{isInfo ? "←" : "→"}<span className={isInfo ? "second" : "first"}>Info</span>
            </a>
            <Clock/>
          </div>
        </div>
        
        <div className={trigger ? 'zoom-in content ' : 'content'} style={{opacity: loaded ? 1 : 0}}>
          {isInfo ?
            loaded && <Info/> :
            <>
              {loaded && <Leftside id={id} list={list} />}
              {loaded && <Rightside id={id} item={list[id]} />}
            </>
          }
          
        </div>
      </TagProvider>
    </div>
  );
}
