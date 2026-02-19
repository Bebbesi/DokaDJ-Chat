import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, LogOut, MessageSquare, User, Loader2, ShieldCheck,
  Globe, Settings, X, Image as ImageIcon, Save,
  XCircle, Lock, UserPlus, Copy, ArrowRight,
  AlertCircle, AlertTriangle, ShieldAlert, Key, Menu,
  Users, Hash, Phone, PhoneIncoming, PhoneOff,
  Mic, MicOff, Volume2, VolumeX, ChevronDown,
  Maximize2, Plus, Users2, Fingerprint
} from 'lucide-react';

// --- Configuration ---
const API_URL = 'http://localhost:3000/api/sql'; // POINT THIS TO YOUR SQLITE BACKEND
const DB_FILE = 'storage.db';

// --- CSS Styles (Embedded) ---
const styles = `
  /* Reset & Variables */
  :root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --primary-light: #eff6ff;
    --bg-app: #f1f5f9;
    --bg-surface: #ffffff;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
    --radius: 12px;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg-app); color: var(--text-main); }
  
  /* Layout */
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  
  /* Loading Screen */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: var(--text-muted); }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Auth Screens */
  .auth-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .auth-box { background: white; width: 100%; max-width: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); animation: fadeIn 0.3s ease; }
  .auth-header { height: 8px; background: linear-gradient(to right, #3b82f6, #10b981); }
  .auth-content { padding: 32px; }
  .auth-title { text-align: center; margin-bottom: 24px; }
  .auth-title h1 { margin: 0; font-size: 24px; }
  .auth-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px; margin-bottom: 12px; background: white; border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
  .auth-btn:hover { background: var(--bg-app); transform: translateY(-1px); }
  .token-box { background: var(--bg-app); padding: 16px; border-radius: var(--radius); font-family: monospace; word-break: break-all; border: 1px solid var(--border); margin: 10px 0; }
  .primary-btn { width: 100%; background: var(--primary); color: white; border: none; padding: 12px; border-radius: var(--radius); font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
  .primary-btn:disabled { opacity: 0.5; }
  .input-field { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 16px; margin-bottom: 8px; }

  /* Sidebar */
  .sidebar { width: 280px; background: white; border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 20; }
  .sidebar-header { padding: 16px; border-bottom: 1px solid var(--border); height: 60px; display: flex; align-items: center; font-weight: bold; font-size: 18px; gap: 8px; }
  .sidebar-content { flex: 1; overflow-y: auto; padding: 12px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px; width: 100%; border: none; background: transparent; border-radius: var(--radius); cursor: pointer; color: var(--text-muted); transition: 0.2s; text-align: left; }
  .nav-item:hover { background: var(--bg-app); color: var(--text-main); }
  .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 500; }
  .nav-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #e2e8f0; font-size: 12px; font-weight: bold; }
  .nav-item.active .nav-icon { background: #dbeafe; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: bold; margin: 20px 0 8px 12px; display: flex; justify-content: space-between; align-items: center; }
  .user-footer { padding: 16px; border-top: 1px solid var(--border); background: #f8fafc; display: flex; align-items: center; gap: 12px; }

  /* Main Chat Area */
  .chat-area { flex: 1; display: flex; flex-direction: column; position: relative; background: #f8fafc; }
  .chat-header { height: 60px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
  .header-info { display: flex; align-items: center; gap: 12px; }
  .header-actions { display: flex; align-items: center; gap: 8px; }
  .icon-btn { padding: 8px; background: transparent; border: none; cursor: pointer; color: var(--text-muted); border-radius: 8px; }
  .icon-btn:hover { background: var(--bg-app); color: var(--primary); }

  /* Messages */
  .messages-list { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .msg-row { display: flex; flex-direction: column; max-width: 75%; }
  .msg-row.own { align-self: flex-end; align-items: flex-end; }
  .msg-row.other { align-self: flex-start; align-items: flex-start; }
  .msg-meta { font-size: 10px; color: #94a3b8; margin-bottom: 4px; padding: 0 4px; display: flex; gap: 6px; }
  .msg-bubble { padding: 10px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .msg-row.own .msg-bubble { background: var(--primary); color: white; border-top-right-radius: 2px; }
  .msg-row.other .msg-bubble { background: white; border: 1px solid var(--border); color: var(--text-main); border-top-left-radius: 2px; }
  .msg-img { max-width: 100%; border-radius: 12px; margin-bottom: 4px; border: 1px solid var(--border); }
  
  /* Footer / Input */
  .chat-footer { padding: 16px; background: white; border-top: 1px solid var(--border); }
  .input-container { max-width: 900px; margin: 0 auto; display: flex; gap: 8px; align-items: center; position: relative; }
  .msg-input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-app); outline: none; transition: 0.2s; }
  .msg-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235, 0.1); background: white; }
  .send-btn { background: var(--primary); color: white; border: none; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
  .send-btn:hover { background: var(--primary-dark); }
  .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Modals (Group, Settings, Security) */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal-box { background: white; width: 100%; max-width: 360px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; animation: zoomIn 0.2s; }
  .modal-header { padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
  .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .modal-footer { padding: 16px; background: var(--bg-app); display: flex; gap: 8px; }
  .secondary-btn { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: white; cursor: pointer; font-weight: 500; }
  
  /* Call UI */
  .call-overlay { position: absolute; inset: 0; z-index: 70; pointer-events: none; display: flex; align-items: center; justify-content: center; }
  .call-box { pointer-events: auto; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); padding: 24px; border-radius: 24px; width: 300px; display: flex; flex-direction: column; align-items: center; color: white; box-shadow: 0 20px 25px rgba(0,0,0,0.2); border: 1px solid #334155; }
  .call-avatar { width: 80px; height: 80px; background: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; position: relative; }
  .ping-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--success); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.5; }
  .call-actions { display: flex; gap: 16px; margin-top: 24px; }
  .call-btn { width: 50px; height: 50px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: transform 0.1s; }
  .call-btn:active { transform: scale(0.95); }
  .btn-green { background: #10b981; }
  .btn-red { background: #ef4444; }
  .btn-grey { background: #334155; }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
  
  /* Mobile Responsive */
  @media (max-width: 640px) {
    .sidebar { position: absolute; height: 100%; transform: translateX(-100%); transition: transform 0.3s; box-shadow: 2px 0 10px rgba(0,0,0,0.1); }
    .sidebar.open { transform: translateX(0); }
    .msg-row { max-width: 85%; }
  }
`;

// --- WebRTC Configuration ---
const rtcConfig = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
};

// --- Encryption Constants & Helpers ---
const SYSTEM_KEY = "NEXUS_DEFAULT_SECURE_PROTOCOL_V1"; 

const encryptText = (text, customKey) => {
  if (!text) return text;
  const keysToApply = customKey ? [SYSTEM_KEY, customKey] : [SYSTEM_KEY];
  let processedText = text;
  keysToApply.forEach(key => {
    try {
      const encoded = encodeURIComponent(processedText);
      let result = '';
      for (let i = 0; i < encoded.length; i++) {
        const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      processedText = btoa(result);
    } catch (e) {
      console.error("Encryption failed", e);
    }
  });
  return processedText;
};

const decryptText = (encryptedText, customKey) => {
  if (!encryptedText) return null;
  const keysToApply = customKey ? [customKey, SYSTEM_KEY] : [SYSTEM_KEY];
  let processedText = encryptedText;
  for (const key of keysToApply) {
    try {
      const decoded = atob(processedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      processedText = decodeURIComponent(result);
    } catch (e) {
      return processedText;
    }
  }
  return processedText;
};

const generateNumericId = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

// --- SQLite Database Helper ---
const db = {
  async execute(sql, params = []) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: DB_FILE, sql, params })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'SQL Error');
      return data.rows || []; 
    } catch (e) {
      console.error("DB Error:", e);
      return [];
    }
  }
};

export default function App() {
  // --- Auth & Identity State ---
  const [userToken, setUserToken] = useState(null); 
  const [appState, setAppState] = useState('auth'); 
  
  // --- Navigation State ---
  const [activeChat, setActiveChat] = useState({ type: 'public', id: 'public', name: 'Public Channel' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- Auth UI State ---
  const [authStep, setAuthStep] = useState('welcome'); 
  const [generatedToken, setGeneratedToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- App Data State ---
  const [messages, setMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [groupsList, setGroupsList] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // --- Settings & Profile ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [publicId, setPublicId] = useState('');
  const [tempName, setTempName] = useState('');
  const [encryptionKey, setEncryptionKey] = useState(''); 
  const [tempKey, setTempKey] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Group Creation State ---
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTarget, setNewGroupTarget] = useState('');
  const [createGroupError, setCreateGroupError] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // --- Upload State ---
  const [uploadingImage, setUploadingImage] = useState(null); 
  
  // --- Security Popup State ---
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [canProceed, setCanProceed] = useState(false);

  // --- WebRTC / Call State ---
  const [callStatus, setCallStatus] = useState('idle');
  const [activeCallId, setActiveCallId] = useState(null); 
  const [callPartnerName, setCallPartnerName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pc = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringtoneInterval = useRef(null);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadTimeoutRef = useRef(null);
  const callDurationInterval = useRef(null);
  const pollIntervalRef = useRef(null);
  const callPollIntervalRef = useRef(null);

  // --- Step 1: Initialize & Persistence ---
  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_token');
    if (savedToken) {
      checkSession(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSession = async (token) => {
    setIsLoading(true);
    const rows = await db.execute("SELECT * FROM users WHERE id = ?", [token]);
    if (rows.length > 0) {
      const user = rows[0];
      setUserToken(token);
      setDisplayName(user.username);
      setPublicId(user.public_id || 'N/A');
      setTempName(user.username);
      setAppState('chat');
    } else {
      localStorage.removeItem('nexus_token');
      setAuthStep('login');
      setLoginError('Session expired.');
    }
    setIsLoading(false);
  };

  // --- Step 2: Data Polling ---
  useEffect(() => {
    if (appState !== 'chat') return;

    fetchUsersAndGroups();
    fetchMessages();

    pollIntervalRef.current = setInterval(() => {
      fetchUsersAndGroups();
      fetchMessages();
    }, 2000);

    return () => clearInterval(pollIntervalRef.current);
  }, [appState, activeChat, userToken]);

  const fetchUsersAndGroups = async () => {
    const users = await db.execute("SELECT id, username, public_id as publicId FROM users WHERE id != ?", [userToken]);
    setUsersList(users);

    const groups = await db.execute(`
      SELECT g.id, g.name 
      FROM groups g 
      JOIN group_members gm ON g.id = gm.group_id 
      WHERE gm.user_id = ?
    `, [userToken]);
    setGroupsList(groups);
  };

  const fetchMessages = async () => {
    let chatId = 'public';
    if (activeChat.type === 'private') {
      const ids = [userToken, activeChat.id].sort();
      chatId = `dm_${ids[0]}_${ids[1]}`;
    } else if (activeChat.type === 'group') {
      chatId = `group_${activeChat.id}`;
    }

    const rows = await db.execute(`
      SELECT * FROM messages 
      WHERE chat_id = ? 
      ORDER BY created_at ASC 
      LIMIT 50
    `, [chatId]);
    
    const formatted = rows.map(r => ({
      id: r.id,
      text: r.text,
      imageUrl: r.image_url,
      senderId: r.sender_id,
      senderName: r.sender_name,
      timestamp: { seconds: new Date(r.created_at).getTime() / 1000 }
    }));
    
    setMessages(prev => {
      if (prev.length !== formatted.length || (formatted.length > 0 && prev.length > 0 && formatted[formatted.length-1].id !== prev[prev.length-1].id)) {
        return formatted;
      }
      return prev;
    });
  };

  // --- Call Signaling Polling ---
  useEffect(() => {
    if (!userToken) return;

    const pollCalls = async () => {
      const activeCalls = await db.execute(`
        SELECT * FROM calls 
        WHERE (receiver_id = ? OR caller_id = ?) 
      `, [userToken, userToken]);

      activeCalls.forEach(async (data) => {
        const isMyCall = data.receiver_id === userToken || data.caller_id === userToken;
        if (!isMyCall) return;

        if (data.receiver_id === userToken && !data.answer && callStatus === 'idle') {
          setActiveCallId(data.id);
          setCallPartnerName(data.caller_name || 'Unknown Caller');
          setCallStatus('incoming');
          setIsCallMinimized(false);
        }

        if (data.caller_id === userToken && data.answer && callStatus === 'calling' && pc.current) {
           if (pc.current.signalingState !== 'stable') { 
             setCallStatus('connected');
             const answerObj = JSON.parse(data.answer);
             await pc.current.setRemoteDescription(new RTCSessionDescription(answerObj));
           }
        }

        if (pc.current && (callStatus === 'connected' || callStatus === 'calling' || callStatus === 'incoming')) {
          const candidatesRaw = data.caller_id === userToken ? data.answer_candidates : data.offer_candidates;
          if (candidatesRaw) {
            const candidates = JSON.parse(candidatesRaw || '[]');
            candidates.forEach((c) => {
               try { pc.current.addIceCandidate(new RTCIceCandidate(c)); } catch(e){}
            });
          }
        }
      });
      
      if (activeCallId) {
        const stillExists = activeCalls.find(c => c.id === activeCallId);
        if (!stillExists) hangupCall(false);
      }
    };

    callPollIntervalRef.current = setInterval(pollCalls, 2000);
    return () => clearInterval(callPollIntervalRef.current);
  }, [userToken, callStatus, activeCallId]);

  // --- Call Timer ---
  useEffect(() => {
    if (callStatus === 'connected') {
      callDurationInterval.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      stopRingtone();
    } else if (callStatus === 'incoming') {
      playRingtone();
    } else {
      clearInterval(callDurationInterval.current);
      setCallDuration(0);
      stopRingtone();
    }
    return () => {
      clearInterval(callDurationInterval.current);
      stopRingtone();
    };
  }, [callStatus]);

  const playRingtone = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (ringtoneInterval.current) clearInterval(ringtoneInterval.current);
    const playBeep = () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    };
    playBeep();
    ringtoneInterval.current = setInterval(playBeep, 2000);
  };

  const stopRingtone = () => {
    if (ringtoneInterval.current) {
      clearInterval(ringtoneInterval.current);
      ringtoneInterval.current = null;
    }
  };

  // --- Call Logic (WebRTC) ---
  const setupPC = () => {
    const peer = new RTCPeerConnection(rtcConfig);
    localStream.current.getTracks().forEach(track => peer.addTrack(track, localStream.current));
    peer.ontrack = (event) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
    };
    return peer;
  }

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      pc.current = setupPC();
      
      const participants = [userToken, activeChat.id].sort();
      const callId = `call_${participants[0]}_${participants[1]}`;
      setActiveCallId(callId);
      setCallPartnerName(activeChat.name);
      setIsCallMinimized(false);

      const localCandidates = [];
      pc.current.onicecandidate = (event) => {
        if (event.candidate) localCandidates.push(event.candidate.toJSON());
      };

      const offerDescription = await pc.current.createOffer();
      await pc.current.setLocalDescription(offerDescription);
      
      await new Promise(r => setTimeout(r, 500));

      await db.execute(`
        INSERT INTO calls (id, caller_id, caller_name, receiver_id, offer, offer_candidates, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        callId, userToken, displayName || 'Unknown', activeChat.id, 
        JSON.stringify(offerDescription), JSON.stringify(localCandidates), 'offering'
      ]);

      setCallStatus('calling');
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  const answerCall = async () => {
    if (!activeCallId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      pc.current = setupPC();
      
      const rows = await db.execute("SELECT * FROM calls WHERE id = ?", [activeCallId]);
      if (rows.length === 0) return;
      const callData = rows[0];

      setCallPartnerName(callData.caller_name || 'Unknown');
      
      const offerObj = JSON.parse(callData.offer);
      await pc.current.setRemoteDescription(new RTCSessionDescription(offerObj));

      const localCandidates = [];
      pc.current.onicecandidate = (event) => {
         if (event.candidate) localCandidates.push(event.candidate.toJSON());
      };

      const answerDescription = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answerDescription);

      await new Promise(r => setTimeout(r, 500));

      await db.execute(`
        UPDATE calls SET answer = ?, answer_candidates = ?, status = 'connected' WHERE id = ?
      `, [JSON.stringify(answerDescription), JSON.stringify(localCandidates), activeCallId]);

      setCallStatus('connected');
      stopRingtone();
    } catch (err) { console.error(err); }
  };

  const hangupCall = async (shouldDeleteDoc = true) => {
    stopRingtone();
    if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
    if (pc.current) pc.current.close();
    pc.current = null; localStream.current = null;
    setCallStatus('idle'); setCallDuration(0); setCallPartnerName(''); setIsCallMinimized(false);
    
    if (shouldDeleteDoc && activeCallId) {
       await db.execute("DELETE FROM calls WHERE id = ?", [activeCallId]);
    }
    setActiveCallId(null);
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleRemoteMute = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsRemoteMuted(!isRemoteMuted);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Auth Handlers ---
  const generateNewUser = () => {
    const newToken = crypto.randomUUID();
    setGeneratedToken(newToken);
    setAuthStep('new-user');
  };

  const completeNewUserSetup = async () => {
    setIsVerifying(true);
    const defaultName = `User-${generatedToken.slice(0, 4)}`;
    const pid = generateNumericId();
    try {
      await db.execute("INSERT INTO users (id, username, public_id) VALUES (?, ?, ?)", [generatedToken, defaultName, pid]);
      localStorage.setItem('nexus_token', generatedToken);
      setUserToken(generatedToken);
      setDisplayName(defaultName);
      setPublicId(pid);
      setTempName(defaultName);
      setAppState('chat');
    } catch (e) { console.error(e); } finally { setIsVerifying(false); }
  };

  const handleLoginSubmit = async () => {
    if (!inputToken.trim()) return;
    setIsVerifying(true);
    setLoginError('');
    try {
      const rows = await db.execute("SELECT * FROM users WHERE id = ?", [inputToken.trim()]);
      if (rows.length > 0) {
        const data = rows[0];
        localStorage.setItem('nexus_token', inputToken.trim());
        setUserToken(inputToken.trim());
        setDisplayName(data.username);
        setPublicId(data.public_id || 'N/A');
        setTempName(data.username);
        setAppState('chat');
      } else {
        setLoginError('Token not found.');
      }
    } catch (e) { setLoginError('Connection error.'); } finally { setIsVerifying(false); }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setUserToken(null);
    setAppState('auth');
    setAuthStep('welcome');
    setEncryptionKey('');
    hangupCall();
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveSettings = async () => {
    if (!userToken) return;
    setIsSavingProfile(true);
    setEncryptionKey(tempKey.trim());
    try {
      if (tempName.trim()) {
        await db.execute("UPDATE users SET username = ? WHERE id = ?", [tempName.trim(), userToken]);
        setDisplayName(tempName.trim());
      }
      setIsSettingsOpen(false);
    } catch (err) { console.error(err); } finally { setIsSavingProfile(false); }
  };

  // --- Group Creation Logic ---
  const handleCreateGroup = async () => {
    setCreateGroupError('');
    if (!newGroupName.trim() || !newGroupTarget.trim()) {
      setCreateGroupError('Please fill in all fields.');
      return;
    }
    
    const searchTerm = newGroupTarget.trim().toLowerCase();
    const rows = await db.execute("SELECT * FROM users WHERE lower(username) = ? OR public_id = ?", [searchTerm, searchTerm]);
    const targetUser = rows[0];
    
    if (!targetUser) {
      setCreateGroupError('User not found. Check username or ID.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      const groupId = crypto.randomUUID();
      await db.execute("INSERT INTO groups (id, name, created_by) VALUES (?, ?, ?)", [groupId, newGroupName.trim(), userToken]);
      await db.execute("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [groupId, userToken]);
      await db.execute("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [groupId, targetUser.id]);

      setIsGroupModalOpen(false);
      setNewGroupName('');
      setNewGroupTarget('');
      fetchUsersAndGroups();
    } catch (e) {
      console.error("Group creation failed", e);
      setCreateGroupError('Failed to create group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // --- Message Logic ---
  const performSend = async (text, imageUrl) => {
    setIsSending(true);
    try {
      let finalText = text;
      if (text) finalText = encryptText(text, encryptionKey);

      let chatId = 'public';
      if (activeChat.type === 'private') {
        const participants = [userToken, activeChat.id].sort();
        chatId = `dm_${participants[0]}_${participants[1]}`;
      } else if (activeChat.type === 'group') {
        chatId = `group_${activeChat.id}`;
      }

      await db.execute(`
        INSERT INTO messages (chat_id, text, image_url, sender_id, sender_name, is_encrypted) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [chatId, finalText, imageUrl, userToken, displayName || 'Anonymous', true]);

      setNewMessage('');
      setUploadingImage(null);
      fetchMessages();
    } catch (error) { console.error(error); } finally { setIsSending(false); }
  };

  const handleSendMessage = async (e, imageUrl = null) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !imageUrl) || !userToken || isSending) return;

    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (!imageUrl && (uuidRegex.test(newMessage) || (userToken && newMessage.includes(userToken)))) {
      setPendingMessage(newMessage);
      setShowTokenWarning(true);
      setCanProceed(false);
      setTimeout(() => setCanProceed(true), 2000);
      return;
    }
    await performSend(newMessage.trim(), imageUrl);
  };

  const handleSecurityProceed = () => {
    setShowTokenWarning(false);
    performSend(pendingMessage, null);
    setPendingMessage('');
  };

  const handleSecurityCancel = () => {
    setShowTokenWarning(false);
    setPendingMessage('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("Please select an image smaller than 1MB."); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setUploadingImage({ dataUrl, progress: 0 });
      let progress = 0;
      uploadTimeoutRef.current = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          clearInterval(uploadTimeoutRef.current);
          setUploadingImage(prev => ({ ...prev, progress: 100 }));
          performSend(null, dataUrl); 
        } else {
          setUploadingImage(prev => ({ ...prev, progress: Math.floor(progress) }));
        }
      }, 400);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };
  
  const abortUpload = () => {
    if (uploadTimeoutRef.current) clearInterval(uploadTimeoutRef.current);
    setUploadingImage(null);
    setIsSending(false);
  };

  // --- Render ---
  return (
    <>
      <style>{styles}</style>
      <audio ref={remoteAudioRef} autoPlay />

      {isLoading && (
        <div className="loading-screen">
          <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: 16 }} />
          <p>Connecting to Local Database...</p>
        </div>
      )}

      {!isLoading && appState === 'auth' && (
        <div className="auth-overlay">
          <div className="auth-box">
            <div className="auth-header" />
            <div className="auth-content">
              <div className="auth-title">
                <div style={{ background: '#dbeafe', color: '#2563eb', width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={32} />
                </div>
                <h1>Welcome to DOKA DJ</h1>
                <p style={{ color: '#64748b', fontSize: 14 }}>Secure, Local SQLite Chat.</p>
              </div>

              {authStep === 'welcome' && (
                <>
                  <button onClick={generateNewUser} className="auth-btn">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ background: '#2563eb', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={20} /></div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold' }}>New User</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Create a new identity</div>
                      </div>
                    </div>
                    <ArrowRight size={20} color="#94a3b8" />
                  </button>
                  <button onClick={() => setAuthStep('login')} className="auth-btn">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ background: '#e2e8f0', color: '#475569', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} /></div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold' }}>Log Back In</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>I have a token</div>
                      </div>
                    </div>
                    <ArrowRight size={20} color="#94a3b8" />
                  </button>
                </>
              )}

              {authStep === 'new-user' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: 12, display: 'flex', gap: 8, marginBottom: 16 }}>
                    <AlertCircle size={20} color="#d97706" />
                    <div style={{ fontSize: 12, color: '#92400e' }}><strong>SAVE THIS TOKEN!</strong> It is your only key.</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Your Secret Token</div>
                  <div className="token-box">
                    {generatedToken}
                    <button onClick={copyToken} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}><Copy size={16} /></button>
                  </div>
                  <button onClick={completeNewUserSetup} disabled={isVerifying} className="primary-btn">
                    {isVerifying ? <Loader2 className="spin" /> : 'Done'}
                  </button>
                </div>
              )}

              {authStep === 'login' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Enter your Token</label>
                    <input type="text" value={inputToken} onChange={(e) => setInputToken(e.target.value)} placeholder="Paste token..." className="input-field" />
                    {loginError && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'flex', gap: 4 }}><XCircle size={14} />{loginError}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAuthStep('welcome')} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, background: 'white', cursor: 'pointer' }}>Back</button>
                    <button onClick={handleLoginSubmit} disabled={!inputToken.trim() || isVerifying} className="primary-btn">
                      {isVerifying ? <Loader2 className="spin" /> : 'Unlock'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && appState === 'chat' && (
        <div className="app-layout">
          {/* Call Overlay */}
          {callStatus !== 'idle' && !isCallMinimized && (
            <div className="call-overlay">
              <div className="call-box" style={{ animation: 'zoomIn 0.3s' }}>
                 <button onClick={() => setIsCallMinimized(true)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronDown size={20} /></button>
                 <div className="call-avatar">
                    <User size={40} color="#94a3b8" style={{ zIndex: 10, position: 'relative' }} />
                    {(callStatus === 'connected' || callStatus === 'incoming') && <div className="ping-ring" />}
                 </div>
                 <h3>{callPartnerName}</h3>
                 <p style={{ color: '#94a3b8', fontSize: 14, margin: '4px 0 0' }}>
                   {callStatus === 'calling' && 'Calling...'}
                   {callStatus === 'incoming' && 'Incoming Call...'}
                   {callStatus === 'connected' && `Connected • ${formatTime(callDuration)}`}
                 </p>
                 <div className="call-actions">
                    {callStatus === 'incoming' ? (
                      <>
                        <button onClick={() => hangupCall()} className="call-btn btn-red"><PhoneOff size={24} /></button>
                        <button onClick={answerCall} className="call-btn btn-green"><PhoneIncoming size={24} /></button>
                      </>
                    ) : (
                      <>
                        {callStatus === 'connected' && (
                          <>
                            <button onClick={toggleMute} className={`call-btn ${isMuted ? 'btn-red' : 'btn-grey'}`}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button>
                            <button onClick={toggleRemoteMute} className={`call-btn ${isRemoteMuted ? 'btn-red' : 'btn-grey'}`}>{isRemoteMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
                          </>
                        )}
                        <button onClick={() => hangupCall()} className="call-btn btn-red"><PhoneOff size={24} /></button>
                      </>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <Users size={20} color="var(--primary)" /> DOKA DJ
              <button className="icon-btn" style={{ marginLeft: 'auto', display: 'sm-none' }} onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="sidebar-content">
              <button onClick={() => { setActiveChat({ type: 'public', id: 'public', name: 'Public Channel' }); setIsSidebarOpen(false); }} className={`nav-item ${activeChat.type === 'public' ? 'active' : ''}`}>
                <div className="nav-icon"><Hash size={16} /></div>
                <span>Public Channel</span>
              </button>

              <div className="section-label">
                Groups 
                <button onClick={() => setIsGroupModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Plus size={14} /></button>
              </div>
              {groupsList.map(g => (
                <button key={g.id} onClick={() => { setActiveChat({ type: 'group', id: g.id, name: g.name }); setIsSidebarOpen(false); }} className={`nav-item ${activeChat.type === 'group' && activeChat.id === g.id ? 'active' : ''}`}>
                  <div className="nav-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}><Users2 size={16} /></div>
                  <span>{g.name}</span>
                </button>
              ))}

              <div className="section-label">Direct Messages</div>
              {usersList.length === 0 && <div style={{ textAlign: 'center', fontSize: 12, color: '#cbd5e1', padding: 20 }}>No users online</div>}
              {usersList.map(u => (
                <button key={u.id} onClick={() => { setActiveChat({ type: 'private', id: u.id, name: u.username }); setIsSidebarOpen(false); }} className={`nav-item ${activeChat.type === 'private' && activeChat.id === u.id ? 'active' : ''}`}>
                  <div className="nav-icon" style={{ background: '#d1fae5', color: '#059669' }}>{u.username.charAt(0).toUpperCase()}</div>
                  <span>{u.username}</span>
                </button>
              ))}
            </div>

            {/* Minimized Call UI */}
            {isCallMinimized && callStatus !== 'idle' && (
              <div style={{ background: '#0f172a', padding: 12, borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
                    <span style={{ fontSize: 12, fontWeight: 'bold' }}>{callPartnerName}</span>
                  </div>
                  <button onClick={() => setIsCallMinimized(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Maximize2 size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                   <button onClick={toggleMute} style={{ flex: 1, padding: 8, borderRadius: 8, background: isMuted ? '#ef4444' : '#1e293b', border: 'none', color: 'white', cursor: 'pointer' }}>{isMuted ? <MicOff size={16} /> : <Mic size={16} />}</button>
                   <button onClick={() => hangupCall()} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer' }}><PhoneOff size={16} /></button>
                </div>
              </div>
            )}

            <div className="user-footer">
              <div style={{ width: 40, height: 40, background: '#dbeafe', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{displayName.charAt(0).toUpperCase()}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>{displayName}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Fingerprint size={12} /> {publicId}</div>
              </div>
            </div>
          </aside>

          {/* Main Chat */}
          <main className="chat-area">
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <button onClick={() => setIsSidebarOpen(true)} className="icon-btn" style={{ display: 'none' }}><Menu size={24} /></button>
                <div style={{ padding: 8, background: activeChat.type === 'public' ? '#2563eb' : (activeChat.type === 'group' ? '#9333ea' : '#059669'), borderRadius: 8, color: 'white' }}><MessageSquare size={20} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16 }}>{activeChat.name}</h2>
                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{activeChat.type === 'public' ? 'Public Feed' : (activeChat.type === 'group' ? 'Private Group' : 'Private Chat')}</div>
                </div>
              </div>
              <div className="header-actions">
                 {activeChat.type === 'private' && callStatus === 'idle' && (
                    <button onClick={startCall} className="icon-btn" title="Voice Call"><Phone size={20} /></button>
                 )}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: '#ecfdf5', color: '#047857', borderRadius: 4, fontSize: 10, fontWeight: 'bold' }}><ShieldCheck size={12} /> Secured</div>
                 <button onClick={() => { setTempKey(encryptionKey); setTempName(displayName); setIsSettingsOpen(true); }} className="icon-btn"><Settings size={20} /></button>
                 <button onClick={logout} className="icon-btn" style={{ color: '#ef4444' }}><LogOut size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-list" ref={scrollRef}>
              {messages.length === 0 && !uploadingImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                  <Globe size={48} color="#94a3b8" />
                  <p>Start your secured conversation.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.senderId === userToken;
                    let displayText = msg.text;
                    const decrypted = decryptText(msg.text, encryptionKey);
                    if (decrypted) displayText = decrypted;

                    return (
                      <div key={msg.id} className={`msg-row ${isMe ? 'own' : 'other'}`}>
                         <div className="msg-meta">
                           <span>{isMe ? 'You' : msg.senderName}</span>
                           <span>{msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                         </div>
                         {msg.imageUrl && <img src={msg.imageUrl} className="msg-img" alt="shared" />}
                         {displayText && (
                           <div className="msg-bubble">
                             {encryptionKey && <Lock size={12} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle', opacity: 0.7 }} />}
                             {displayText}
                           </div>
                         )}
                      </div>
                    );
                  })}
                  {uploadingImage && (
                    <div className="msg-row own">
                      <div className="msg-meta">Uploading...</div>
                      <div style={{ position: 'relative', opacity: 0.7 }}>
                        <img src={uploadingImage.dataUrl} className="msg-img" alt="uploading" />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 'bold' }}>
                          {uploadingImage.progress}%
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="chat-footer">
              <form onSubmit={handleSendMessage} className="input-container">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn"><ImageIcon size={20} /></button>
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder={encryptionKey ? `Secured message...` : `Message...`} 
                  className="msg-input"
                  disabled={isSending} 
                />
                <button type="submit" disabled={(!newMessage.trim()) || isSending} className="send-btn">
                  {isSending && !uploadingImage ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </main>
        </div>
      )}

      {/* Security Warning Modal */}
      {showTokenWarning && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '4px solid #ef4444' }}>
            <div className="modal-body" style={{ textAlign: 'center' }}>
               <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto' }} />
               <h3 style={{ margin: 0, color: '#991b1b' }}>Security Alert</h3>
               <p style={{ fontSize: 14, color: '#b91c1c' }}>Do not share your token. If you send this message, others can access your account.</p>
            </div>
            <div className="modal-footer">
               <button onClick={handleSecurityCancel} className="secondary-btn">Cancel</button>
               <button onClick={handleSecurityProceed} disabled={!canProceed} className="primary-btn" style={{ background: canProceed ? '#ef4444' : '#fca5a5' }}>
                 {canProceed ? 'Send Anyway' : 'Wait...'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay">
           <div className="modal-box">
             <div className="modal-header">
               <span>Settings</span>
               <button onClick={() => setIsSettingsOpen(false)} className="icon-btn"><X size={20} /></button>
             </div>
             <div className="modal-body">
               <div>
                 <label style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Display Name</label>
                 <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="input-field" maxLength={20} />
               </div>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb' }}>Extra Encryption Key</label>
                 <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} className="input-field" placeholder="Optional secret key..." />
                 <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Messages are always encrypted. Add this key for extra privacy.</p>
               </div>
               <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: 10, fontWeight: 'bold', color: '#ef4444', marginBottom: 4 }}>SECRET LOGIN KEY</div>
                 <div style={{ fontFamily: 'monospace', fontSize: 10, wordBreak: 'break-all', userSelect: 'all' }}>{userToken}</div>
               </div>
             </div>
             <div className="modal-footer">
               <button onClick={handleSaveSettings} className="primary-btn">{isSavingProfile ? <Loader2 className="spin" /> : 'Save'}</button>
             </div>
           </div>
        </div>
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="modal-overlay">
           <div className="modal-box">
             <div className="modal-header">
               <span>Create Group</span>
               <button onClick={() => setIsGroupModalOpen(false)} className="icon-btn"><X size={20} /></button>
             </div>
             <div className="modal-body">
               <div>
                 <label style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Group Name</label>
                 <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="input-field" placeholder="e.g. Project Alpha" />
               </div>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Invite User (Username or ID)</label>
                 <input type="text" value={newGroupTarget} onChange={(e) => setNewGroupTarget(e.target.value)} className="input-field" placeholder="e.g. 123456789012" />
               </div>
               {createGroupError && <div style={{ color: '#ef4444', fontSize: 12 }}>{createGroupError}</div>}
             </div>
             <div className="modal-footer">
               <button onClick={handleCreateGroup} className="primary-btn" disabled={isCreatingGroup}>
                  {isCreatingGroup ? <Loader2 className="spin" /> : 'Create'}
               </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
}