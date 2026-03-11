"use client";

import { useEffect, useState } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://blue-river-ebb7.tomaszkkmaher.workers.dev"

export default function Leftside({ id }: { id: number }) {
    const [timeline, setTimeline] = useState(false);
    const [oldNew, setOldNew] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagList, setTagList] = useState(() => new Set<string>());
    const [list, setList] = useState<PortfolioItem[]>([]);

    async function getPortfolioItems() {
        await fetch(`${API_BASE}/api/portfolio`, {})
          .then((res) => res.json())
          .then((data) => {
            let tagListTmp = new Set<string>();
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
                    date: new Date(item.date),
                    index: i
                });
                item.tags.split(',').forEach((tag: string) => {
                    if (tag != "") tagListTmp.add(tag);
                });
                i++;
            }
            setList(output);
            setTagList(tagListTmp);
          })
          .catch((err) => {
            console.error("Error fetching portfolio items:", err);
          });
      }

    useEffect(() => {
        getPortfolioItems();
    }, []);

    function TagSelector() {
        return (
            <select className="tag"
                 onChange={(e) => {
                    setTags(prevList => [...prevList, e.target.value]);
                    setTagList(prevList => {
                        const newList = new Set(prevList);
                        newList.delete(e.target.value);
                        return newList;
                    });
                }} defaultValue="">
                    <option className="text-center" value="">+ tag</option>
                    {Array.from(tagList).map((tag, i) => (
                        <option key={i} value={tag}>{tag}</option>
                    ))}
            </select>
        )
    }

    function Tag({ name }: { name: string }) {
        return (
            <div className="tag" onClick={()=> {
                setTags(prevList => prevList.filter(item => item !== name));
                setTagList(prevList => prevList.add(name));
            }}>
                <div className="float-left">
                    ×
                </div>
                <div className="float-right">
                    {name}
                </div>
                
            </div>
        )
    }

    function ItemBlock({ item, index }: { item: PortfolioItem, index: number }) {
        const matchesTags = tags.every(tag => item.tags.includes(tag));
        if (!matchesTags) return null;

    
        return (
            <motion.div
                className={index == id ? "item-block grayed" : "item-block"}
                layoutId={`item-${item.id}`}
                layout
            />
        )
    }

    return (
        <div className="flex flex-col w-full mt-80">
            <div className="switcher">
                <a onClick={() => setTimeline(e => !e)}>
                <span className={timeline ? "first" : "second"}>Grid</span> <span className={timeline ? "second" : "first"}>Timeline</span>
                </a>
            </div>
            <div className="switcher smaller">
                <a onClick={() => setOldNew(e => !e)}>
                    <span className={oldNew ? "first" : "second"}>new→old</span> <span className={oldNew ? "second" : "first"}>old→new</span>
                </a>
            </div>
            <div className="flex gap-2 flex-row smaller mt-1.5">
                {tags.map((tag, i) => (
                    <Tag key={i} name={tag}/>
                ))}
                <TagSelector />
            </div>
            <motion.div layout className="mt-2 smaller">
                <AnimatePresence mode="sync">
                    {timeline ? (
                        Object.entries(
                            list.reduce((acc, item) => {
                                const year = item.date.getFullYear();
                                if (!acc[year]) acc[year] = [];
                                acc[year].push(item);
                                return acc;
                            }, {} as Record<number, PortfolioItem[]>)
                        )
                        .sort(([a], [b]) => oldNew ? Number(a) - Number(b) : Number(b) - Number(a))
                        .map(([year, items]) => (
                            <motion.div
                                key={year}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}          
                                transition={{ duration: 0.2 }}
                                layout                          
                            >
                                <div className="year">{year}</div>
                                <div className="flex flex-wrap flex-row">
                                    {items.map((item) => <ItemBlock item={item} index={item.index} key={item.id} />)}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div key="grid" layout className="flex flex-wrap flex-row">
                            {[...list]
                                .sort((a, b) => oldNew
                                    ? a.date.getTime() - b.date.getTime()
                                    : b.date.getTime() - a.date.getTime()
                                )
                                .map((item, i) => <ItemBlock item={item} index={item.index} key={item.id} />)
                            }
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}