import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const NetworkStatusBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowRestored(true);
            // Auto reconnect websocket if disconnected
            if (socket && !socket.connected) {
                socket.connect();
            }
            const timer = setTimeout(() => {
                setShowRestored(false);
            }, 3500);
            return () => clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowRestored(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [socket]);

    if (isOnline && !showRestored) return null;

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92vw] sm:w-auto animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
            {!isOnline ? (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-600/95 text-white shadow-2xl backdrop-blur-md border border-rose-400/40 text-xs font-semibold">
                    <WifiOff className="w-4 h-4 text-rose-200 animate-pulse shrink-0" />
                    <span>Connection lost. Working offline...</span>
                </div>
            ) : showRestored ? (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600/95 text-white shadow-2xl backdrop-blur-md border border-emerald-400/40 text-xs font-semibold">
                    <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Back online! Reconnected.</span>
                </div>
            ) : null}
        </div>
    );
};

export default NetworkStatusBanner;
