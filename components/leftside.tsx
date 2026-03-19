"use client";

import { useEffect, useState } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useTags } from "@/components/contexts/tagcontext";

export default function Leftside({ id, list, mode }: { id: number, list: PortfolioItem[], mode: boolean }) {
    return (
        <AnimatePresence mode="wait">
            {mode ? <LeftsideInner id={id} list={list} /> : <Info />}
        </AnimatePresence>
    );
}

export function LeftsideInner({ id, list }: { id: number, list: PortfolioItem[] }) {
    const [timeline, setTimeline] = useState(false);
    const [oldNew, setOldNew] = useState(false);
    const { tags, setTags, tagList, setTagList } = useTags();

    const router = useRouter();

    useEffect(() => {
        for (const item of list) {
            item.tags.forEach((tag: string) => {
                if (tag != "") setTagList(prevList => new Set(prevList).add(tag));
            });
        }
    }, [list]);
    

    function TagSelector() {
        return (
            <select className={tagList.size > 0 ? "tag" : "tag pointer-events-none opacity-50"}
            
                 onChange={(e) => {
                    setTags(prevList => prevList.add(e.target.value));
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
                setTags(prevList => {
                    const newList = new Set(prevList);
                    newList.delete(name);
                    return newList;
                });
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
        const matchesTags = tags.size === 0 || [...tags].every((tag: string) => item.tags.includes(tag));
        if (!matchesTags) return null;
        return (
            <motion.div
                className={index == id ? "item-block grayed" : "item-block"}
                layoutId={`item-${item.id}`}
                layoutDependency={timeline}
                onClick={() => router.push(`?id=${item.index}`)}
            />
        )
    }

    return (
        <motion.div
            className="leftside"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1}}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div>
                <div className="switcher">
                    <a onClick={() => setTimeline(e => !e)}>
                        <span className={timeline ? "second" : "first"}>Timeline</span>
                    </a>
                </div>
                <div className="switcher smaller">
                    <a onClick={() => setOldNew(e => !e)}>
                        <span className={oldNew ? "first" : "second"}>new→old</span> <span className={oldNew ? "second" : "first"}>old→new</span>
                    </a>
                </div>
                <motion.div className="flex flex-row smaller mt-1.5">
                    <AnimatePresence mode="sync">
                        {[...tags].map((tag, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "fit-content" }}
                                exit={{ opacity: 0, width: 0 }}          
                                transition={{ duration: 0.2 }}
                                layout                          
                            >
                                <Tag name={tag}/>
                            </motion.div>
                        ))}
                        <TagSelector />
                    </AnimatePresence>
                </motion.div>
                <LayoutGroup>
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
                                        className="flex flex-row mr-2 gap-5"
                                        key={year}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}          
                                        transition={{ duration: 0.2 }}
                                        layout                          
                                    >
                                        <div className="year">{year}</div>
                                        <div className="flex flex-wrap flex-row">
                                            {items.map((item) => 
                                                <ItemBlock item={item} index={item.index ? item.index : 0} key={item.id} />
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-wrap flex-row">
                                    {[...list]
                                        .sort((a, b) => oldNew
                                            ? a.date.getTime() - b.date.getTime()
                                            : b.date.getTime() - a.date.getTime()
                                        )
                                        .map((item) => <ItemBlock item={item} index={item.index ?? 0} key={item.id} />)
                                    }
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </LayoutGroup>
            </div>
        </motion.div>
    )
}

export function Info() {
    return (
        <div className="leftside">
            <motion.div className="flex flex-row smaller mt-1.5">
                <AnimatePresence mode="sync">
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "fit-content" }}
                        exit={{ opacity: 0, width: 0 }}          
                        transition={{ duration: 0.2 }}
                        layout                          
                    >
                        test
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    )
}