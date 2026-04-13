"use client";
import { useState, useRef, useMemo } from "react";
import { PortfolioItem } from "./types/portfolio";
import { motion, AnimatePresence } from "framer-motion";
import { useTags } from "@/components/contexts/tagcontext";
import ReactMarkDown from "react-markdown";
import Image from "next/image";

export default function Rightside({ id, item }: { id: number; item: PortfolioItem }) {
    return (
        <AnimatePresence mode="wait">
            <RightsideInner key={id} item={item}/>
        </AnimatePresence>
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
        if (playing) {
            setPlaying(false);
            videoRef.current?.pause();
        } else {
            setPlaying(true);
            videoRef.current?.play();
        }
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

        setRotation({
            x: softClamp(-(y / 10), 15),
            y: softClamp(x / 10, 15),
        });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!hasDragged.current && item.video_url) {
            const target = e.target as Element;
            if (target.closest(".media-wrapper")) {
                togglePlay();
            }
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
            <div className="tag" onMouseDown={()=> {
                if (tags.has(name)) {
                    setTagList(prevList => prevList.add(name));
                    setTags(prevList => {
                        const newList = new Set(prevList);
                        newList.delete(name);
                        return newList;
                    });
                } else { 
                    setTags(prevList => prevList.add(name));
                    setTagList(prevList => {
                        const newList = new Set(prevList);
                        newList.delete(name);
                        return newList;
                    });
                }
            }}> 
                <div className="tag-permanent">
                    {name}
                </div>
                
            </div>
        )
    }

    const TagMemo = useMemo(() => {
        return item.tags.map((tag, i) => <Tag key={i} name={tag} />);
    }, [tags]);

    return (
        <motion.div
            className="rightside"
            initial={{ opacity: 0}}
            animate={{ opacity: loaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
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
