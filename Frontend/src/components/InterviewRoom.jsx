import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Share2,
    Copy,
    Users,
    Shield,
    Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const InterviewRoom = () => {
    const { roomName } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((store) => store.auth);
    const jitsiContainerRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const safeRoomName = (roomName || "general-interview").replace(/[^a-zA-Z0-9-_]/g, "");
    const userName = user?.fullname || (user?.role === "recruiter" ? "Recruiter" : "Candidate");
    const userEmail = user?.email || "";

    useEffect(() => {
        // Load Jitsi Meet External API Script
        const loadJitsiScript = () => {
            if (window.JitsiMeetExternalAPI) {
                initJitsi();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            script.onload = () => initJitsi();
            script.onerror = () => {
                toast.error("Failed to load secure video interview engine.");
            };
            document.body.appendChild(script);
        };

        let api = null;

        const initJitsi = () => {
            if (!jitsiContainerRef.current) return;
            jitsiContainerRef.current.innerHTML = "";

            const domain = "meet.jit.si";
            const options = {
                roomName: `JobHive-${safeRoomName}`,
                width: "100%",
                height: "100%",
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userName,
                    email: userEmail,
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    TOOLBAR_BUTTONS: [
                        "microphone",
                        "camera",
                        "closedcaptions",
                        "desktop",
                        "fullscreen",
                        "fodeviceselection",
                        "hangup",
                        "profile",
                        "chat",
                        "recording",
                        "livestreaming",
                        "etherpad",
                        "sharedvideo",
                        "settings",
                        "raisehand",
                        "videoquality",
                        "filmstrip",
                        "feedback",
                        "stats",
                        "shortcuts",
                        "tileview",
                        "videobackgroundblur",
                        "download",
                        "help",
                        "mute-everyone",
                    ],
                },
            };

            try {
                api = new window.JitsiMeetExternalAPI(domain, options);
                api.addEventListeners({
                    readyToClose: () => {
                        toast.info("Interview session ended.");
                        navigate(-1);
                    },
                });
            } catch (err) {
                console.error("Jitsi Init Error:", err);
            }
        };

        loadJitsiScript();

        return () => {
            if (api) {
                api.dispose();
            }
        };
    }, [safeRoomName, userName, userEmail, navigate]);

    const copyInviteLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("🔗 Interview room link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Top Control Bar */}
            <div className="h-16 border-b border-gray-800 px-4 sm:px-6 flex items-center justify-between bg-gray-900/90 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            JobHive 1-Click Video Interview
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                Live & Encrypted
                            </span>
                        </h2>
                        <p className="text-[11px] text-gray-400">Room: {safeRoomName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={copyInviteLink}
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-xs font-semibold rounded-xl text-gray-200"
                    >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        {copied ? "Copied!" : "Copy Invite Link"}
                    </Button>

                    <Button
                        onClick={() => navigate(-1)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                    >
                        <PhoneOff className="w-3.5 h-3.5 mr-1.5" /> Leave Room
                    </Button>
                </div>
            </div>

            {/* Video Call Workspace */}
            <div className="flex-1 relative w-full h-[calc(100vh-64px)] bg-black">
                <div ref={jitsiContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
};

export default InterviewRoom;
