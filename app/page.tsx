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

export default function Page() {
  const [isInfo, setIsInfo] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [id, setId] = useState(0);
  const [list, setList] = useState<PortfolioItem[]>([]);
  const [loaded, setLoaded] = useState(false);
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
        setList(output);
        setLoaded(true);
      })
      .catch(err => console.error("Error fetching portfolio items:", err));
  }

  useEffect(() => { getPortfolioItems(); }, []);

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

  return (
    <div>
      <TagProvider>
        <div className="header">
          <div className="switcher float-left flex items-center">
            <img src="teardrop.svg" className="teardrop" />
            <Link href="/">
              <span className="first">Health</span>+<span className="second" onClick={() => setIsInfo(false)}>Recreation</span>
            </Link>
          </div>
          <div className="switcher float-right text-right">
            <a onClick={() => setIsInfo(e => !e)}>
              <span className={isInfo ? "first" : "second"}>Work</span>{isInfo ? "←" : "→"}<span className={isInfo ? "second" : "first"}>Info</span>
            </a>
            <Clock />
          </div>
        </div>

        <div className={trigger ? 'zoom-in content' : 'content'} style={{ opacity: loaded ? 1 : 0 }}>
          {isInfo ? (
            loaded && <Info />
          ) : (
            <>
              {loaded && <Leftside id={id} setId={setId} list={list} />}
              {loaded && <Rightside id={id} setId={setId} list={list} />}
            </>
          )}
        </div>
      </TagProvider>
    </div>
  );
}