"use client";

import { useEffect, useState } from "react";
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

    function TagSelector() {
        return (
            <select
                className={tagList.size > 0 ? "tag" : "tag pointer-events-none opacity-50"}
                onChange={e => {
                    setTags(prev => prev.add(e.target.value));
                    setTagList(prev => { const n = new Set(prev); n.delete(e.target.value); return n; });
                }}
                defaultValue=""
            >
                <option className="text-center" value="">+ tag</option>
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
            <motion.div className="flex flex-row smaller m-[auto] mt-1.5">
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
                                <div className="bolded">Health+Recreation</div> is an independent web development studio based in Chicago, Illinois. It specializes in personalized designs with an emphasis on modularity and customization.
                            </div>
                            <div>
                                Services include full-stack web development, UI/UX design, graphic design, SEO, and web consulting.
                            </div>
                            <br />
                            <div className="contact-link">
                                <a className="hover-bold child underline" target="_blank" href="mailto:[INSERT EMAIL]">Contact</a>
                                <em className="child">→name@domain.com</em>
                                <br />
                                <em className="child smaller">Include a general outline of your project. Rates are determined based on time commitment and hosting/server costs.</em>
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