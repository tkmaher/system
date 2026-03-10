"use client";
import { useEffect, useState } from "react";

export default function Clock() {
    const now = new Date(); // Creates a date object for the current time

    const [hours, setHours] = useState(now.getHours());
    const [minutes, setMinutes] = useState(now.getMinutes());
    const [seconds, setSeconds] = useState(now.getSeconds());
    
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => (prev + 1) % 60);
            if (seconds === 59) {
                setMinutes(prev => (prev + 1) % 60);
            }
            if (seconds === 59 && minutes === 59) {
                setHours(prev => (prev + 1) % 24);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
    );
}