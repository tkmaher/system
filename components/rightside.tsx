"use client";
import { useState, useRef, useEffect } from "react";
import { PortfolioItem } from "./types/portfolio";
import { motion, AnimatePresence } from "framer-motion";

export default function Rightside({ id, item }: { id: number, item: PortfolioItem }) {
    return (
        <AnimatePresence mode="wait">
            <RightsideInner key={id} item={item} />
        </AnimatePresence>
    );
}

function RightsideInner({ item }: { item: PortfolioItem }) {
    const [loaded, setLoaded] = useState(false);

    function Tag({ name }: { name: string }) {
        return (
            <div className="tag pointer-events-none">
                <div className="float-left">×</div>
                <div className="float-right">{name}</div>
            </div>
        );
    }

    function MediaViewer({ src, video }: { src: string; video?: string }) {
        const [playing, setPlaying] = useState(false);
        const videoRef = useRef<HTMLVideoElement>(null);

        function handlePlay() {
            setPlaying(true);
            videoRef.current?.play();
        }

        function handlePause() {
            setPlaying(false);
            videoRef.current?.pause();
        }

        return (
            <div className="media-wrapper">
                <img
                    src={src}
                    onLoad={() => setLoaded(true)}
                    style={{ opacity: playing ? "0" : "1" }}
                />
                {video && (
                    <video
                        loop
                        ref={videoRef}
                        src={video}
                        preload="auto"
                        playsInline
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: playing ? 1 : 0,
                            pointerEvents: playing ? "auto" : "none",
                        }}
                    />
                )}
                {video && (
                    <div className="play-button" onClick={playing ? handlePause : handlePlay}>
                        <a>{playing ? "⏸" : "▶"}</a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            className="rightside"
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
        >
            <MediaViewer src={item.images[0]} video={item.video_url ?? undefined} />
            <div className="description">
                <div className="bolded">{item.name}</div>
                <div>{item.client} • {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(item.date)}</div>
            </div>
            <div className="description">{item.body}</div>
            <div className="flex flex-row smaller mt-1.5">
                {item.tags.map((tag, i) => (
                    <Tag name={tag} key={i} />
                ))}
            </div>
        </motion.div>
    );
}