"use client";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { PortfolioItem } from "./types/portfolio";
import { motion } from "framer-motion";
import { useTags } from "@/components/contexts/tagcontext";
import ReactMarkDown from "react-markdown";
import Image from "next/image";

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
    const programmaticScroll = useRef(false);
    const { tags, oldNew } = useTags();

    const sortedList = useMemo(() => {
        return [...list]
            .filter(item => tags.size === 0 || [...tags].every(tag => item.tags.includes(tag)))
            .sort((a, b) => oldNew
                ? a.date.getTime() - b.date.getTime()
                : b.date.getTime() - a.date.getTime()
            );
    }, [list, tags.size, oldNew]);

    // Reposition (instant) when filter/sort changes, smooth when id changes via leftside click
    const scrollToId = useCallback((targetId: number, behavior: ScrollBehavior) => {
        const idx = sortedList.findIndex(item => (item.index ?? 0) === targetId);
        const ref = idx !== -1 ? itemRefs.current[idx] : null;
        if (!ref) return false;
        const container = containerRef.current!;
        if (Math.abs(ref.offsetTop - container.scrollTop) < 4) return true; // already there
        programmaticScroll.current = true;
        ref.scrollIntoView({ behavior, block: 'start' });
        // Reset flag once scroll settles — fall back to timeout if scrollend doesn't fire
        const reset = () => { programmaticScroll.current = false; };
        container.addEventListener('scrollend', reset, { once: true });
        setTimeout(reset, 900);
        return true;
    }, [sortedList]);

    // When id changes from a leftside click → smooth scroll
    useEffect(() => {
        scrollToId(id, 'smooth');
    }, [id]); // intentionally omit scrollToId to avoid firing on sortedList changes here

    // When sortedList changes (tag/sort toggle) → instant reposition to keep current item in view
    useEffect(() => {
        const inList = sortedList.some(item => (item.index ?? 0) === id);
        if (!inList && sortedList.length > 0) {
            // Current item filtered out — jump to first
            setId(sortedList[0].index ?? 0);
        } else {
            requestAnimationFrame(() => scrollToId(id, 'instant'));
        }
    }, [sortedList]); // eslint-disable-line react-hooks/exhaustive-deps

    // Track active item during user scroll
    const updateActiveItem = useCallback(() => {
        if (programmaticScroll.current) return;
        const container = containerRef.current;
        if (!container || sortedList.length === 0) return;
        const scrollTop = container.scrollTop;
        let closest = 0;
        let minDist = Infinity;
        itemRefs.current.forEach((ref, i) => {
            if (!ref) return;
            const dist = Math.abs(ref.offsetTop - scrollTop);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        const newId = sortedList[closest]?.index ?? closest;
        setId(newId);
    }, [sortedList, setId]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        let debounceTimer: ReturnType<typeof setTimeout>;
        const onScroll = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateActiveItem, 50);
        };
        container.addEventListener('scrollend', updateActiveItem);
        container.addEventListener('scroll', onScroll);
        return () => {
            container.removeEventListener('scrollend', updateActiveItem);
            container.removeEventListener('scroll', onScroll);
            clearTimeout(debounceTimer);
        };
    }, [updateActiveItem]);

    return (
        <div ref={containerRef} className="rightside-scroll-container">
            {sortedList.map((item, i) => (
                <div
                    key={item.id}
                    ref={el => { itemRefs.current[i] = el; }}
                    className="rightside-item-snap"
                >
                    <RightsideInner item={item} />
                </div>
            ))}
            {sortedList.length === 0 && <div
                className="rightside-item-snap"
            >
                no items to display
            </div>}
        </div>
    );
}

function RightsideInner({ item }: { item: PortfolioItem }) {
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
            }}
        >
            <div className="media-wrapper">
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
            <div className="description">
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
        </motion.div>
    );
}