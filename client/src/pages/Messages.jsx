// File: Messages.jsx
// Description: Real-time Chat Page: Secure inbox holding conversations, real-time message streams, return arrangements, and user block toggles.

import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI, blockAPI, userAPI } from '../services/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { MessageCircle, Send, ArrowLeft, Search, Clock, Loader2, Paperclip, Image as ImageIcon, Mic, X, Smile, MoreVertical, Flag, Download, FileText, Play, Pause, Trash2, ShieldBan, ShieldCheck, Ban } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { useTranslation } from 'react-i18next';

// React Component: Renders the Messages user interface elements dynamically
export default function Messages() {
    const { currentUser, userData } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'requests'

    const [searchParams] = useSearchParams();
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    // Enhanced Messaging States
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image', 'video', or 'file'
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Reporting States
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [reportPhotos, setReportPhotos] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);

    // Block States
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    // Delete message states
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [messageIdToDelete, setMessageIdToDelete] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const lastMessageCountRef = useRef(0);
    const lastMessageIdRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const hasAutoSelectedRef = useRef(false);

    const openChatId = searchParams.get('chatId');

    // Side Effect: This code block executes automatically when this page mounts on the user screen
    useEffect(() => {
        if (!currentUser) return;
        const fetchChats = async () => {
            try {
                const response = await chatAPI.getChats();
                setChats(response.data);
                setLoadingChats(false);
                if (openChatId && !hasAutoSelectedRef.current) {
                    const chatToSelect = response.data.find(c => c.id === openChatId);
                    if (chatToSelect) {
                        setSelectedChat(chatToSelect);
                        hasAutoSelectedRef.current = true;
                    }
                }
            } catch (err) {
                console.error(err);
                setLoadingChats(false);
            }
        };
        fetchChats();
        const interval = setInterval(fetchChats, 5000); // Poll every 5 seconds for sync
        return () => clearInterval(interval);
    }, [currentUser, openChatId]);

    // Refresh selectedChat's details and automatically mark active chat as read
    useEffect(() => {
        if (selectedChat && chats.length > 0) {
            const updatedChat = chats.find(c => c.id === selectedChat.id);
            if (updatedChat) {
                // If the active chat has unread messages, mark them as read immediately
                const unreadCount = updatedChat.unreadCount?.[currentUser.uid] || 0;
                if (unreadCount > 0) {
                    chatAPI.markRead(selectedChat.id).catch(console.error);
                    // Reset unread count locally in chats list
                    setChats(prev => prev.map(c =>
                        c.id === selectedChat.id
                            ? { ...c, unreadCount: { ...c.unreadCount, [currentUser.uid]: 0 } }
                            : c
                    ));
                }

                // Sync block status and other details
                setSelectedChat(prev => ({
                    ...prev,
                    blockedByMe: updatedChat.blockedByMe,
                    blockedByOther: updatedChat.blockedByOther,
                    participantDetails: updatedChat.participantDetails,
                    unreadCount: { ...updatedChat.unreadCount, [currentUser.uid]: 0 }
                }));
            }
        }
    }, [chats, selectedChat?.id]);

    const fetchMessages = async (showLoading = false) => {
        if (!selectedChat) return;
        if (showLoading) setLoadingMessages(true);
        try {
            const response = await chatAPI.getMessages(selectedChat.id);
            setMessages(response.data);
            if (showLoading) setLoadingMessages(false);
        } catch (err) {
            console.error(err);
            if (showLoading) setLoadingMessages(false);
        }
    };

    // Reset message tracking refs on chat switch so it always scrolls to bottom cleanly
    useEffect(() => {
        if (!selectedChat) return;
        lastMessageCountRef.current = 0;
        lastMessageIdRef.current = null;
        isInitialLoadRef.current = true;
        setMessages([]);
    }, [selectedChat?.id]);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
    useEffect(() => {
        if (!selectedChat) return;
        fetchMessages(true);
        const interval = setInterval(() => fetchMessages(false), 3000); // Polling for messages
        return () => clearInterval(interval);
    }, [selectedChat?.id]);

    const scrollToBottom = (behavior = 'smooth') => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
            }
        }, 80);
    };

    // Scroll to bottom when messages array length or the last message changes (avoids scrolling on every poll)
    useEffect(() => {
        if (!loadingMessages && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (messages.length !== lastMessageCountRef.current || lastMsg?.id !== lastMessageIdRef.current) {
                const behavior = isInitialLoadRef.current ? 'auto' : 'smooth';
                scrollToBottom(behavior);
                isInitialLoadRef.current = false;
                lastMessageCountRef.current = messages.length;
                lastMessageIdRef.current = lastMsg?.id;
            }
        }
    }, [messages, loadingMessages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() && !selectedFile) return;

        try {
            setSending(true);
            const formData = new FormData();
            formData.append('chatId', selectedChat.id);
            formData.append('text', messageText.trim());

            if (selectedFile) {
                formData.append(fileType, selectedFile);
            }

            await chatAPI.sendMessage(formData);
            await fetchMessages(false);

            setMessageText('');
            setSelectedFile(null);
            setFileType(null);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 403) {
                toast.error('Unable to send message. User unavailable.');
            } else {
                toast.error('Failed to send message');
            }
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const limit = (type === 'video') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > limit) {
            toast.error(`File size exceeds ${type === 'video' ? '50MB' : '5MB'} limit`);
            return;
        }

        setSelectedFile(file);
        setFileType(type);
    };

    const handleDeleteClick = (messageId) => {
        setMessageIdToDelete(messageId);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteMessage = async () => {
        if (!messageIdToDelete) return;
        try {
            setDeletingMessageId(messageIdToDelete);
            setShowDeleteConfirm(false);
            await chatAPI.deleteMessage(selectedChat.id, messageIdToDelete);
            // Optimistic update: mark as deleted locally
            setMessages(prev => prev.map(m =>
                m.id === messageIdToDelete ? { ...m, deleted: true, text: '', attachment: null } : m
            ));
            toast.success("Message deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete message");
        } finally {
            setDeletingMessageId(null);
            setMessageIdToDelete(null);
        }
    };

    const handleBlockUser = async () => {
        const otherUserId = selectedChat.participants.find(id => id !== currentUser.uid);
        if (!otherUserId) return;

        try {
            await blockAPI.block(otherUserId);
            toast.success("User blocked");
            setShowBlockConfirm(false);
            // Optimistic update
            setSelectedChat(prev => ({ ...prev, blockedByMe: true }));
            setChats(prev => prev.map(c =>
                c.id === selectedChat.id ? { ...c, blockedByMe: true } : c
            ));
        } catch (error) {
            console.error(error);
            toast.error("Failed to block user");
        }
    };

    const handleUnblockUser = async () => {
        const otherUserId = selectedChat.participants.find(id => id !== currentUser.uid);
        if (!otherUserId) return;

        try {
            await blockAPI.unblock(otherUserId);
            toast.success("User unblocked");
            // Optimistic update
            setSelectedChat(prev => ({ ...prev, blockedByMe: false }));
            setChats(prev => prev.map(c =>
                c.id === selectedChat.id ? { ...c, blockedByMe: false } : c
            ));
        } catch (error) {
            console.error(error);
            toast.error("Failed to unblock user");
        }
    };

    const handleReportUser = async () => {
        if (!reportReason.trim() || !reportDetails.trim()) return;
        try {
            setIsReporting(true);
            const reportedUserId = selectedChat.participants.find(id => id !== currentUser.uid);
            
            let formData = new FormData();
            formData.append('reason', reportReason);
            formData.append('details', reportDetails);
            
            if (reportPhotos && reportPhotos.length > 0) {
                reportPhotos.forEach(photo => {
                    formData.append('photos', photo);
                });
            }

            await userAPI.report(reportedUserId, formData);
            toast.success("User reported to admin");
            setShowReportModal(false);
            setReportReason('');
            setReportDetails('');
            setReportPhotos([]);
        } catch (err) {
            toast.error("Failed to submit report");
        } finally {
            setIsReporting(false);
        }
    };

    const getOtherParticipant = (chat) => {
        if (!chat || !chat.participants) return null;
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        return chat.participantDetails?.[otherUserId] || { name: 'Unknown User', photo: null };
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, 'MMM d, h:mm a');
        } catch { return ''; }
    };

    const handleAcceptChat = async (e, chatId) => {
        e.stopPropagation();
        try {
            await chatAPI.acceptChat(chatId);
            toast.success("Request accepted");
            // Optimistic update
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: 'active' } : c));
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept request");
        }
    };

    const handleRejectChat = async (e, chatId) => {
        e.stopPropagation();
        if (!window.confirm("Reject this message request?")) return;
        try {
            await chatAPI.rejectChat(chatId);
            toast.success("Request rejected");
            setChats(prev => prev.filter(c => c.id !== chatId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject request");
        }
    };

    const filteredChats = chats.filter(chat => {
        const otherUser = getOtherParticipant(chat);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = otherUser?.name?.toLowerCase().includes(searchLower) || chat.postTitle?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        const isPending = chat.status === 'pending';
        const isMyRequest = chat.requesterId === currentUser.uid;

        if (activeTab === 'requests') {
            // Show pending chats where I am NOT the requester (incoming requests)
            return isPending && !isMyRequest;
        } else {
            // Show active chats OR pending chats where I AM the requester (waiting)
            return !isPending || isMyRequest;
        }
    });

    // Check if chat is blocked
    const isChatBlocked = selectedChat?.blockedByMe || selectedChat?.blockedByOther;

    if (!currentUser) return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><p>Please log in to view messages.</p></div>;

    return (
        <div className="h-[calc(100dvh-8rem)] min-h-[500px] flex flex-col md:flex-row gap-4 text-gray-800 dark:text-gray-200">
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex-col`}>
                <div className="p-4 border-b bg-gradient-to-r from-primary to-primary-dark text-white">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><MessageCircle className="h-6 w-6" />{t('messages', 'Messages')}</h2>

                    {/* Tabs */}
                    <div className="flex bg-white/20 p-1 rounded-lg mb-4">
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'messages' ? 'bg-white text-primary shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                            {t('chats', 'Chats')}
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'requests' ? 'bg-white text-primary shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                            {t('requests', 'Requests')}
                            {chats.filter(c => c.status === 'pending' && c.requesterId !== currentUser.uid).length > 0 &&
                                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                    {chats.filter(c => c.status === 'pending' && c.requesterId !== currentUser.uid).length}
                                </span>
                            }
                        </button>
                    </div>

                    <div className="relative">
                        <input type="text" placeholder={t('searchChats', 'Search chats...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm" />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-blue-100" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingChats ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : filteredChats.length > 0 ? (
                        filteredChats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            const unreadCount = chat.unreadCount?.[currentUser.uid] || 0;
                            const isPendingIncoming = chat.status === 'pending' && chat.requesterId !== currentUser.uid;

                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left ${selectedChat?.id === chat.id ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="relative">
                                            <img src={otherUser?.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt={otherUser?.name} className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-700 object-cover shadow-sm" />
                                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <h3 className={`font-black text-gray-900 dark:text-white truncate text-sm uppercase tracking-tight ${unreadCount > 0 ? 'text-primary' : ''}`}>
                                                        {otherUser?.name || 'Unknown User'}
                                                    </h3>
                                                    {otherUser?.isVerified && <VerifiedBadge verified={true} size="h-3.5 w-3.5" />}
                                                    {chat.blockedByMe && <ShieldBan className="h-3.5 w-3.5 text-red-400 flex-shrink-0" title="Blocked" />}
                                                </div>
                                                {chat.lastMessageTime && (
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest flex-shrink-0">
                                                        {formatTime(chat.lastMessageTime)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-primary dark:text-blue-400 mb-1 truncate font-black uppercase tracking-widest">{chat.postTitle}</p>

                                            {isPendingIncoming ? (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={(e) => handleAcceptChat(e, chat.id)} className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary-dark shadow-md shadow-primary/20">Accept</button>
                                                    <button onClick={(e) => handleRejectChat(e, chat.id)} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Decline</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 font-medium'}`}>
                                                        {chat.status === 'pending' ? t('requestSent', 'Request Sent') : (chat.lastMessage || t('noMessagesYet', 'No messages yet'))}
                                                    </p>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg shadow-primary/20">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : <div className="p-8 text-center text-gray-500"><MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm">{t('noItemsFound', 'No {{item}} found', { item: activeTab === 'messages' ? t('chats', 'Chats') : t('requests', 'Requests') })}</p></div>}
                </div>
            </div>
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex-col`}>
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex items-center gap-3 shadow-sm z-10">
                            <button onClick={() => setSelectedChat(null)} className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"><ArrowLeft className="h-6 w-6" /></button>
                            <img src={getOtherParticipant(selectedChat)?.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt={getOtherParticipant(selectedChat)?.name} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{getOtherParticipant(selectedChat)?.name || 'Unknown User'}</h3>
                                    {getOtherParticipant(selectedChat)?.isVerified && <VerifiedBadge verified={true} />}
                                </div>
                                <Link to={`/post/${selectedChat.postId}`} className="text-xs text-primary dark:text-blue-400 hover:underline font-black uppercase tracking-tight">Regarding: {selectedChat.postTitle}</Link>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Block/Unblock Button */}
                                {selectedChat.blockedByMe ? (
                                    <button
                                        onClick={handleUnblockUser}
                                        className="p-2 text-green-500 hover:text-green-600 transition rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                        title="Unblock User"
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowBlockConfirm(true)}
                                        className="p-2 text-gray-400 hover:text-orange-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Block User"
                                    >
                                        <ShieldBan className="h-5 w-5" />
                                    </button>
                                )}
                                <button onClick={() => setShowReportModal(true)} className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Report User">
                                    <Flag className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/20">
                            {loadingMessages ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : messages.length > 0 ? (
                                messages.map(msg => {
                                    const isMe = msg.senderId === currentUser.uid;
                                    const sender = isMe ? userData : getOtherParticipant(selectedChat);
                                    const isDeleted = msg.deleted === true;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group max-w-full`}>
                                            <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <img src={isMe ? (userData?.photoURL) : (sender?.photo)} onError={(e) => e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="User" className="w-8 h-8 rounded-full flex-shrink-0 border border-white dark:border-gray-700 shadow-sm mt-auto" />
                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`rounded-2xl px-4 py-2.5 shadow-sm relative ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'}`}>
                                                        {/* Delete button for own messages */}
                                                        {isMe && !isDeleted && (
                                                            <button
                                                                onClick={() => handleDeleteClick(msg.id)}
                                                                disabled={deletingMessageId === msg.id}
                                                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                                                                title="Delete message"
                                                            >
                                                                {deletingMessageId === msg.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {isDeleted ? (
                                                            <p className="text-sm italic opacity-60">This message was deleted</p>
                                                        ) : (
                                                            <>
                                                                {msg.attachment && (
                                                                    <div className="mb-2">
                                                                        {msg.attachment.type === 'image' ? (
                                                                            <img src={msg.attachment.url} alt="Attachment" className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition lg:max-w-xs" onClick={() => window.open(msg.attachment.url, '_blank')} />
                                                                        ) : msg.attachment.type === 'video' ? (
                                                                            <video controls src={msg.attachment.url} className="max-w-full rounded-lg lg:max-w-xs" />
                                                                        ) : msg.attachment.type === 'audio' ? (
                                                                            <audio controls src={msg.attachment.url} className={`h-8 w-48 ${isMe ? 'filter invert' : ''}`} />
                                                                        ) : (
                                                                            <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition">
                                                                                <FileText className="h-5 w-5" />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-xs font-bold truncate">{msg.attachment.name || 'document.pdf'}</p>
                                                                                    <p className="text-[10px] opacity-70">Download File</p>
                                                                                </div>
                                                                                <Download className="h-4 w-4" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] mt-1.5 px-1 font-bold tracking-tight text-gray-400 dark:text-gray-500`}>
                                                        {formatTime(msg.timestamp || msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600"><MessageCircle className="h-12 w-12 mb-3 opacity-20" /><p className="font-bold">No messages yet. Say hello!</p></div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input or Blocked State */}
                        {selectedChat.blockedByOther ? (
                            /* The OTHER user blocked YOU */
                            <div className="p-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col items-center justify-center text-center gap-3">
                                    <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded-full">
                                        <Ban className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">User Unavailable</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You can no longer send messages to this conversation.</p>
                                    </div>
                                </div>
                            </div>
                        ) : selectedChat.blockedByMe ? (
                            /* YOU blocked the other user */
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShieldBan className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-bold text-orange-700 dark:text-orange-300">You blocked this user</p>
                                            <p className="text-xs text-orange-500 dark:text-orange-400">Unblock to continue chatting</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUnblockUser}
                                        className="px-4 py-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-orange-600 transition shadow-md"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Normal message input */
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                {/* Attachment Previews */}
                                {selectedFile && (
                                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                        {fileType === 'image' ? (
                                            <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                                        ) : fileType === 'video' ? (
                                            <video src={URL.createObjectURL(selectedFile)} className="h-12 w-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate text-gray-900 dark:text-white">{selectedFile.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Ready to send</p>
                                        </div>
                                        <button onClick={() => { setSelectedFile(null); setFileType(null); }} className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 transition">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 relative flex items-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`p-2 transition h-10 w-10 flex items-center justify-center ${showEmojiPicker ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <Smile className="h-6 w-6" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => setMessageText(prev => prev + emojiData.emoji)}
                                                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                                    width={320}
                                                    height={400}
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 mr-2 pr-1">
                                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-primary transition h-10 w-10 flex items-center justify-center">
                                                <Paperclip className="h-5 w-5" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    let type = 'file';
                                                    if (file.type.startsWith('image/')) type = 'image';
                                                    else if (file.type.startsWith('video/')) type = 'video';
                                                    handleFileSelect(e, type);
                                                }}
                                                className="hidden"
                                            />
                                        </div>

                                        <textarea
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none max-h-32 dark:text-white"
                                            rows="1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            disabled={sending}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendMessage}
                                        className="p-3.5 bg-primary text-white rounded-full hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                                        disabled={sending || (!messageText.trim() && !selectedFile)}
                                    >
                                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Block Confirmation Modal */}
                        {showBlockConfirm && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                                            <ShieldBan className="h-8 w-8 text-orange-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Block User?</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                <strong>{getOtherParticipant(selectedChat)?.name}</strong> won't be able to message you and will see "User Unavailable".
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => setShowBlockConfirm(false)}
                                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleBlockUser}
                                                className="flex-1 py-3 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                                            >
                                                Block
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Report Modal */}
                        {showReportModal && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3 text-red-500">
                                            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                <Flag className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">Report User</h3>
                                        </div>
                                        <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X className="h-6 w-6" /></button>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Why are you reporting this user? Our admins will review the conversation and take appropriate action.</p>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Select Reason</label>
                                            <select
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition dark:text-white mb-4"
                                            >
                                                <option value="">Choose a reason...</option>
                                                <option value="spam">Spam / Advertisements</option>
                                                <option value="harassment">Harassment / Bullying</option>
                                                <option value="fraud">Fraud / Scam Attempt</option>
                                                <option value="inappropriate">Inappropriate Content</option>
                                                <option value="other">Other</option>
                                            </select>

                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Additional Details</label>
                                            <textarea
                                                value={reportDetails}
                                                onChange={(e) => setReportDetails(e.target.value)}
                                                placeholder="Provide more context (optional)..."
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition dark:text-white min-h-[100px] resize-none"
                                            />
                                            
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 mt-4">Attach Photos (Optional)</label>
                                            <div className="flex gap-2 items-center flex-wrap mb-6">
                                                {reportPhotos.map((photo, index) => (
                                                    <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                                                        <img src={URL.createObjectURL(photo)} alt="Upload preview" className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={() => setReportPhotos(prev => prev.filter((_, i) => i !== index))}
                                                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                        ><X className="h-4 w-4" /></button>
                                                    </div>
                                                ))}
                                                {reportPhotos.length < 5 && (
                                                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-red-500 hover:text-red-500 text-gray-400 transition">
                                                        <ImageIcon className="h-6 w-6" />
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            multiple 
                                                            className="hidden" 
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files);
                                                                if (reportPhotos.length + files.length > 5) {
                                                                    toast.error("Maximum 5 photos allowed");
                                                                    return;
                                                                }
                                                                setReportPhotos(prev => [...prev, ...files]);
                                                            }} 
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReportUser}
                                            disabled={!reportReason || !reportDetails.trim() || isReporting}
                                            className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-600 transition disabled:opacity-50 shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                                        >
                                            {isReporting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Report'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Message Confirmation Modal */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                                            <Trash2 className="h-8 w-8 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Delete Message?</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                Are you sure you want to delete this message? It will show as "deleted" for both users.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setMessageIdToDelete(null);
                                                }}
                                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmDeleteMessage}
                                                className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-gray-50/50 dark:bg-gray-900/30"><div className="bg-white dark:bg-gray-800 p-8 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 mb-6"><MessageCircle className="h-16 w-16 text-primary" /></div><h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">{t('selectAConversation', 'Select a Conversation')}</h3><p className="max-w-xs text-center text-gray-500 dark:text-gray-400 font-medium">{t('chooseAChatDesc', 'Choose a chat from the sidebar to start messaging with other community members.')}</p></div>}
            </div>
        </div>
    );
}
