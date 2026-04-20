"use client";

import { useEffect, useRef, useState } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTags } from "@/components/contexts/tagcontext";
import Image from "next/image";

export default function Leftside({ id, setId, list }: { id: number; setId: (id: number) => void; list: PortfolioItem[] }) {
    return (
        <AnimatePresence mode="wait">
            <LeftsideInner id={id} setId={setId} list={list} />
        </AnimatePresence>
    );
}

export function LeftsideInner({ id, setId, list }: { id: number; setId: (id: number) => void; list: PortfolioItem[] }) {
    const { tags, setTags, tagList, setTagList, oldNew, setOldNew } = useTags();

    useEffect(() => {
        for (const item of list) {
            item.tags.forEach((tag: string) => {
                if (tag !== "") setTagList(prev => new Set(prev).add(tag));
            });
        }
    }, [list]);

    const selectRef = useRef<HTMLSelectElement>(null);

    const resize = (value: string) => {
        const el = selectRef.current;
        if (!el) return;
            // Measure text width with a hidden element or canvas, or just use a lookup
        el.style.width = value === "" ? "4em" : `${value.length + 2}ch`;
    };

    function TagSelector() {
        return (
            <select
                ref={selectRef}
                style={{ width: "4em" }} // initial for "+ tag"
                className={`text-center ${tagList.size > 0 ? "tag" : "tag pointer-events-none opacity-50"}`}
                onChange={e => {
                    resize(e.target.value);
                    setTags(prev => prev.add(e.target.value));
                    setTagList(prev => { const n = new Set(prev); n.delete(e.target.value); return n; });
                }}
                defaultValue=""
            >
                <option value="">+ tag</option>
                {Array.from(tagList).map((tag, i) => (
                    <option key={i} value={tag}>{tag}</option>
                ))}
            </select>
        );
    }

    function Tag({ name }: { name: string }) {
        return (
            <div className="tag" onClick={() => {
                setTags(prev => { const n = new Set(prev); n.delete(name); return n; });
                setTagList(prev => prev.add(name));
            }}>
                <div className="float-left">×</div>
                <div className="float-right">{name}</div>
            </div>
        );
    }

    function ItemBlock({ item, index }: { item: PortfolioItem; index: number }) {
        const matchesTags = tags.size === 0 || [...tags].every((tag: string) => item.tags.includes(tag));
        if (!matchesTags) return null;
    
        const isActive = index === id;
    
        return (
            <motion.div
                className="item-block"
                animate={isActive ? "active" : "inactive"}
                variants={{
                    active:   { backgroundColor: "var(--block-active)" },
                    inactive: { backgroundColor: "var(--background)" }
                }}
                whileHover={{ backgroundColor: "var(--block-hover)" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                layoutId={`item-${item.id}`}
                onClick={() => setId(item.index ?? index)}
            />
        );
    }

    return (
        <motion.div
            className="leftside width-half"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <LayoutGroup>
                <motion.div layout className="m-[auto] mt-2 smaller">
                    <AnimatePresence mode="sync">
                        <div className="flex flex-wrap flex-row">
                            {[...list]
                                .sort((a, b) => oldNew
                                    ? a.date.getTime() - b.date.getTime()
                                    : b.date.getTime() - a.date.getTime()
                                )
                                .map(item => <ItemBlock item={item} index={item.index ?? 0} key={item.id} />)
                            }
                        </div>
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>
            <motion.div className="flex flex-row smaller m-[auto] mt-[1em]">
                <div className="switcher smaller mr-[1em]">
                    <a onClick={() => setOldNew(e => !e)}>
                        <span className={oldNew ? "first" : "second"}>new→old</span>{" "}
                        <span className={oldNew ? "second" : "first"}>old→new</span>
                    </a>
                </div>
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
                            <Tag name={tag} />
                        </motion.div>
                    ))}
                    <TagSelector />
                </AnimatePresence>
                
            </motion.div>
        </motion.div>
    );
}

export function Info() {
    const [loaded, setLoaded] = useState(false);

    return (
        <motion.div className="leftside width-full">
            <AnimatePresence mode="sync">
                <motion.div
                    className="flex flex-col gap-20 max-width-[50%] info-parent align-items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                >
                    <div className="flex flex-row info">
                        <div className="flex flex-col gap-2 basis-[50%] self-center flex-grow-0">
                            <div>
                                <div className="bolded">Health+Recreation</div> is an independent studio based in Chicago, Illinois. It specializes in providing web development and digital infrastructure to artists, musicians, and designers.
                            </div>
                            <div>
                                Services include full-stack web development, UI/UX design, graphic design, SEO, and video editing.
                            </div>
                            <br />
                            <div className="contact-link">
                                <a className="hover-bold child border-b-[0.5] border-dashed" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdNh9u1NH6s54Q8kS1bqYpKTz9oQvDPGJUmxtpz685k-pqaBw/viewform?usp=dialog">Contact</a>
                                <em className="child">→tom@health-and-recreation.com</em>
                                <br/>
                                <em className="child smaller">Include a general overview of your project. Rates are determined based on time commitment and hosting/server costs.</em>
                            </div>
                        </div>
                        <div className="basis-[50%] flex items-center info-img">
                            <Image src="sign.svg" draggable="false" width={800} height={800} alt="Health+Recreation" onLoad={() => setLoaded(true)}/>
                        </div>
                    </div>
                    <em className="smaller text-center">
                        Health+Recreation is the studio of <a href="https://otherseas1.com" target="_blank" className="hover-bold">otherseas1</a>. Portfolio available upon request.
                    </em>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}