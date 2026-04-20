"use client";
import Clock from "@/components/clock";
import Leftside, { Info } from "@/components/leftside";
import Rightside from "@/components/rightside";
import { useState, useEffect, useRef } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import Link from "next/link";
import { TagProvider } from '@/components/contexts/tagcontext';

const API_BASE = "https://blue-river-ebb7.tomaszkkmaher.workers.dev";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function Teardrop({ className }: { className?: string }) {
  return (
    <svg fill="currentColor" viewBox="0 0 204.41 204.41" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M100.178,0.833c-3.153,3.3-77.344,81.287-77.344,124.212c0,43.771,35.604,79.365,79.371,79.365
        c43.782,0,79.371-35.6,79.371-79.365c0-42.925-74.188-120.912-77.344-124.212C103.171-0.278,101.231-0.278,100.178,0.833z
        M102.2,198.808c-40.673,0-73.768-33.095-73.768-73.773c0-36.89,61.705-105.18,73.768-118.173
        c12.051,12.982,73.768,81.284,73.768,118.173C175.968,165.713,142.873,198.808,102.2,198.808z"/>
    </svg>
  );
}

export default function Page() {
  const [isInfo, setIsInfo] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [id, setId] = useState(0);
  const [list, setList] = useState<PortfolioItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState('light');
  const initialUrlParsed = useRef(false);

  async function getPortfolioItems() {
    fetch(`${API_BASE}/api/portfolio`)
      .then(res => res.json())
      .then(data => {
        const output: PortfolioItem[] = data.items.map((item: any, i: number) => ({
          id: item.id,
          name: item.name,
          body: item.body,
          client: item.client,
          tags: item.tags.split(','),
          images: item.images,
          video_url: item.video_url ?? null,
          date: new Date(item.date),
          index: i,
          link: item.link ?? null,
        }));
        const now = new Date();
        setList(output.filter(item => item.date < now));
        setLoaded(true);
      })
      .catch(err => console.error("Error fetching portfolio items:", err));
  }

  useEffect(() => { 
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemPrefersDark ? 'dark' : 'light');
    getPortfolioItems(); 
  }, []);

  // Parse ?id=slug from URL once after list loads
  useEffect(() => {
    if (!list.length || initialUrlParsed.current) return;
    initialUrlParsed.current = true;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('id');
    if (!slug) return;

    const match = list.find(item => toSlug(item.name) === decodeURIComponent(slug).toLowerCase());
    if (match) setId(match.index ?? 0);
  }, [list]);

  // Keep URL in sync with active id
  useEffect(() => {
    if (!list.length || isInfo) return;
    const item = list.find(it => (it.index ?? 0) === id);
    if (!item) return;
    window.history.replaceState(null, '', `?id=${toSlug(item.name)}`);
  }, [id, list, isInfo]);

  useEffect(() => {
    setTrigger(true);
    const timer = setTimeout(() => setTrigger(false), 500);
    return () => clearTimeout(timer);
  }, [isInfo]);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <TagProvider>
        <div className="header">
          <div className="switcher float-left flex items-center">
          <Teardrop className="teardrop" />
            <a onClick={toggleTheme}>
              <span className="first">Health</span>+<span className="second" >Recreation</span>
            </a>
          </div>
          <div className="switcher float-right text-right">
            <a onClick={() => setIsInfo(e => !e)}>
              <span className={isInfo ? "first" : "second"}>Work</span>{isInfo ? "←" : "→"}<span className={isInfo ? "second" : "first"}>Info</span>
            </a>
            <Clock />
          </div>
        </div>

        {!loaded && <div>Loading...</div>}

        <div className={trigger ? 'zoom-in content' : 'content'} style={{ opacity: loaded ? 1 : 0 }}>
          {loaded && <>
              {isInfo && <Info />}
              <Rightside id={id} setId={setId} list={list} />
            </>
          }
        </div>
        {loaded && !isInfo && <Leftside id={id} setId={setId} list={list} />}
      </TagProvider>
    </div>
  );
}