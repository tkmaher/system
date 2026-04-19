"use client";
import { useState, useRef, useMemo, useEffect, useLayoutEffect, useCallback } from "react";
import { PortfolioItem } from "./types/portfolio";
import { motion } from "framer-motion";
import { useTags } from "@/components/contexts/tagcontext";
import ReactMarkDown from "react-markdown";
import Image from "next/image";

const GAP_PX = 1200; // must match the `gap: x` in globals.scss

export default function Rightside({
    id,
    setId,
    list,
}: {
    id: number;
    setId: (id: number) => void;
    list: PortfolioItem[];
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const leftContainerRef = useRef<HTMLDivElement>(null);
    const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [leftY, setLeftY] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const programmaticScroll = useRef(false);
    const { tags, oldNew } = useTags();

    // Detect mobile breakpoint
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const sortedList = useMemo(() => {
        return [...list]
            .filter(item => tags.size === 0 || [...tags].every(tag => item.tags.includes(tag)))
            .sort((a, b) => oldNew
                ? a.date.getTime() - b.date.getTime()
                : b.date.getTime() - a.date.getTime()
            );
    }, [list, tags.size, oldNew]);

    const listAlignment = useMemo(() => {
        return new Map(list.map((item, i) => [item.id, i]));
    }, [list]);

    const scrollToId = useCallback((targetId: number, behavior: ScrollBehavior) => {
        const idx = sortedList.findIndex(item => (item.index ?? 0) === targetId);
        const ref = idx !== -1 ? itemRefs.current[idx] : null;
        if (!ref) return false;
        const container = containerRef.current!;
        if (Math.abs(ref.offsetTop - container.scrollTop) < 4) return true;
        programmaticScroll.current = true;
        ref.scrollIntoView({ behavior, block: 'start' });
        // Use timeout instead of scrollend (Safari doesn't support scrollend)
        setTimeout(
            () => { programmaticScroll.current = false; },
            behavior === 'smooth' ? 600 : 100
        );
        return true;
    }, [sortedList]);

    
    const updateLeftColumn = useCallback(() => {
        const container = containerRef.current;
        if (!container || sortedList.length === 0) return;
        const scrollTop = container.scrollTop;
    
        let lowerIdx = 0;
        for (let i = 0; i < itemRefs.current.length; i++) {
            if (itemRefs.current[i] && itemRefs.current[i]!.offsetTop <= scrollTop + 1) {
                lowerIdx = i;
            }
        }
        const upperIdx = Math.min(lowerIdx + 1, sortedList.length - 1);
    
        const lowerTop = itemRefs.current[lowerIdx]?.offsetTop ?? 0;
        const upperTop = itemRefs.current[upperIdx]?.offsetTop ?? lowerTop;
        const t = upperTop === lowerTop ? 0 : Math.min(1, (scrollTop - lowerTop) / (upperTop - lowerTop));
    
        const getLeftY = (idx: number) => {
            let offset = 0.0;
            for (let i = 0; i < idx; i++) {
                offset += (leftItemRefs.current[i]?.offsetHeight ?? 0) + GAP_PX;
            }
            const h = leftItemRefs.current[idx]?.offsetHeight ?? 0;
            return window.innerHeight / 2 - offset - h / 2;
        };
    
        setLeftY(getLeftY(lowerIdx) + (getLeftY(upperIdx) - getLeftY(lowerIdx)) * t);
    }, [sortedList]);
    
    const updateActiveItem = useCallback(() => {
        if (programmaticScroll.current) return;
        const container = containerRef.current;
        if (!container || sortedList.length === 0) return;
        const scrollTop = container.scrollTop;
        let closest = 0, minDist = Infinity;
        itemRefs.current.forEach((ref, i) => {
            if (!ref) return;
            const dist = Math.abs(ref.offsetTop - scrollTop);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        setId(sortedList[closest]?.index ?? closest);
    }, [sortedList, setId]);

    const computeLeftY = useCallback((targetIdx: number) => {
        let offset = 0.0;
        for (let i = 0; i < targetIdx; i++) {
            offset += (leftItemRefs.current[i]?.offsetHeight ?? 0) + GAP_PX;
        }
        const h = leftItemRefs.current[targetIdx]?.offsetHeight ?? 0;
        return window.innerHeight / 2 - offset - h / 2;
    }, []);

    // 1. Button press / leftside click → scroll right column
    useEffect(() => {
        scrollToId(id, 'smooth');
    }, [id]); // intentionally omit scrollToId

    // 2. Tag/sort change → correct scroll and leftY before paint
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || sortedList.length === 0) return;

        const inList = sortedList.some(item => (item.index ?? 0) === id);
        const targetId = inList ? id : (sortedList[0].index ?? 0);
        if (!inList) setId(targetId);

        const targetIdx = sortedList.findIndex(item => (item.index ?? 0) === targetId);
        if (targetIdx === -1) return;

        const ref = itemRefs.current[targetIdx];
        if (ref) {
            programmaticScroll.current = true;
            container.scrollTop = ref.offsetTop;
            // Use timeout instead of scrollend (Safari doesn't support scrollend)
            setTimeout(() => { programmaticScroll.current = false; }, 100);
        }

        setLeftY(computeLeftY(targetIdx));
    }, [sortedList]); // eslint-disable-line react-hooks/exhaustive-deps

    // 3. Scroll listeners — replaces scrollend (not supported in Safari) with
    //    a debounced fallback: left column interpolates on every scroll tick,
    //    active id + final left position settle ~150ms after scrolling stops.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let scrollEndTimer: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            updateLeftColumn();
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(() => {
                updateActiveItem();
                updateLeftColumn();
            }, 150);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollEndTimer);
        };
    }, [updateLeftColumn, updateActiveItem]);


    return (
        <div ref={containerRef} className="rightside-scroll-container">

            <div className="right">
                {sortedList.map((item, i) => (
                    <div
                        key={item.id}
                        ref={el => { itemRefs.current[i] = el; }}
                        className="rightside-item-snap sorted-list"
                    >
                        <RightsideInner item={item} listAlignment={listAlignment}/>
                        
                        {isMobile && (
                            <div className="mobile-inline-desc">
                                <RightsideDesc item={item} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div
                ref={leftContainerRef}
                className="left-desc-container"
                style={{ 
                    transform: `translateY(${leftY}px)`,
                }}
            >
                {sortedList.map((item, i) => (
                    <div 
                        key={item.id} ref={el => { leftItemRefs.current[i] = el; }}
                        style={{ opacity: (item.index ?? 0) === id ? 1 : 0.5,
                            filter: (item.index ?? 0) === id ? "blur(0)" : `blur(${1 * Math.abs((item.index ?? 0) - id)}px)`,
                            cursor: (item.index ?? 0) === id ? "default" : "pointer",
                            alignSelf: listAlignment.get(item.id)! % 2 == 0 ? "flex-end" : "flex-start"
                        }}
                        className="sorted-list"
                        onClick={() => setId(item.index ?? 0)}
                    >
                        <RightsideDesc item={item} />
                    </div>
                ))}
            </div>

            {sortedList.length === 0 && (
                <div className="rightside-item-snap empty">no items to display</div>
            )}
        </div>
    );
}

function RightsideInner({ item, listAlignment }: { item: PortfolioItem, listAlignment: Map<string, number> }) {
    const [loaded, setLoaded] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [playing, setPlaying] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mouseDownPos = useRef({ x: 0, y: 0 });
    const originalMousePos = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);

    const DRAG_THRESHOLD = 5;
    const softClamp = (value: number, limit: number) => limit * Math.tanh(value / limit);

    function togglePlay() {
        if (playing) { setPlaying(false); videoRef.current?.pause(); }
        else { setPlaying(true); videoRef.current?.play(); }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const box = e.currentTarget.getBoundingClientRect();
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
        originalMousePos.current = {
            x: e.clientX - box.left - box.width / 2,
            y: e.clientY - box.top - box.height / 2,
        };
        hasDragged.current = false;
        setDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const dx = e.clientX - mouseDownPos.current.x;
        const dy = e.clientY - mouseDownPos.current.y;
        if (!hasDragged.current) {
            if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
            hasDragged.current = true;
        }
        const box = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - box.left - box.width / 2) - originalMousePos.current.x;
        const y = (e.clientY - box.top - box.height / 2) - originalMousePos.current.y;
        setRotation({ x: softClamp(-(y / 10), 15), y: softClamp(x / 10, 15) });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!hasDragged.current && item.video_url) {
            if ((e.target as Element).closest(".media-wrapper")) togglePlay();
        }
        hasDragged.current = false;
        setDragging(false);
        setRotation({ x: 0, y: 0 });
    };

    const handleMouseLeave = () => {
        hasDragged.current = false;
        setDragging(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <motion.div
            className="rightside"
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
                transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                cursor: dragging ? "grabbing" : "grab",
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                alignSelf: listAlignment.get(item.id)! % 2 == 0 ? "flex-start" : "flex-end"
            }}
        >
            <div className="media-wrapper">
                {!loaded && <div className="text-center">Loading...</div>}
                <Image
                    src={item.images[0]}
                    onLoad={() => setLoaded(true)}
                    style={{ opacity: playing ? 0 : 1 }}
                    alt={item.name}
                    width={800}
                    height={800}
                />
                {item.video_url && (
                    <video
                        loop
                        ref={videoRef}
                        src={item.video_url}
                        preload="auto"
                        playsInline
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: playing ? 1 : 0,
                            pointerEvents: "none",
                        }}
                    />
                )}
                {item.video_url && (
                    <div className="play-button">
                        <a>{playing ? "⏸" : "▶"}</a>
                    </div>
                )}
            </div>
            
        </motion.div>
    );
}

function RightsideDesc({ item }: { item: PortfolioItem }) {
    const { tags, setTagList, setTags } = useTags();

    function Tag({ name }: { name: string }) {
        return (
            <div className="tag" onMouseDown={() => {
                if (tags.has(name)) {
                    setTagList(prev => prev.add(name));
                    setTags(prev => { const n = new Set(prev); n.delete(name); return n; });
                } else {
                    setTags(prev => prev.add(name));
                    setTagList(prev => { const n = new Set(prev); n.delete(name); return n; });
                }
            }}>
                <div className="tag-permanent">{name}</div>
            </div>
        );
    }

    const TagMemo = useMemo(() => {
        return item.tags.map((tag, i) => <Tag key={i} name={tag} />);
    }, [tags]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-row gap-[1em] ">
            <div>{item.date.getFullYear()}</div>
            <div className="description" style={{}}>
                <div className="title">
                    <div>
                        <div className="bolded">{item.name}</div>
                        <div>{item.client} • {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(item.date)}</div>
                    </div>
                    {item.link &&
                    <a href={item.link} target="_blank">
                        <img src="button-linkout.svg" />
                    </a>
                }
                </div>

                <div className="description">
                    <ReactMarkDown>{item.body}</ReactMarkDown>
                </div>
                <div className="flex flex-row smaller mt-1.5">
                    {TagMemo}
                </div>
            </div>
        </div>
    );
}