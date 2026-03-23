"use client";

import { useEffect, useState } from "react";
import { PortfolioItem } from "@/components/types/portfolio";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useTags } from "@/components/contexts/tagcontext";

export default function Leftside({ id, list }: { id: number, list: PortfolioItem[] }) {
    return (
        <AnimatePresence mode="wait">
            <LeftsideInner id={id} list={list} />
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
                layoutDependency={[timeline, oldNew]}
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
        <motion.div className="leftside">
            <AnimatePresence mode="sync">
                <motion.div
                    className="flex flex-col gap-20 max-width-[50%] info-parent align-items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    layout                          
                >
                    <div className="flex flex-row info">
                        <div className="flex flex-col gap-2 basis-[50%] self-center flex-grow-0">
                            <div>
                                <div className="bolded">Public Safety</div> is an independent web development studio based in Chicago, Illinois. It specializes in individualized development with an emphasis on client-centric modularity and customization.
                            </div>
                            <div>
                                Websites are built from the ground up and designed at the strict discretion of the client.
                            </div>
                            <br/>
                            <div className="contact-link">
                                <a className="hover-bold child underline" target="_blank" href="mailto:[INSERT EMAIL]">Contact</a>
                                <em className="child">→name@domain.com</em>
                                <br/>
                                <em className="child smaller">Include a general outline of your project. Rates are determined based on time commitment and hosting/server costs.</em> 
                            </div>
                            
                        </div>
                        <div className="basis-[50%] flex items-center info-img">
                            <img 
                                src="sign.svg" 
                                draggable="false" 
                            /> 
                        </div>
                    </div>
                    <em className=" smaller text-center">
                        Public Safety is the studio of <a href="https://otherseas1.com" target="_blank" className="hover-bold">otherseas1</a>. Portfolio available upon request.
                    </em>
                </motion.div>

            </AnimatePresence>
                
        </motion.div>
    )
}