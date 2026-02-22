import { useState, useEffect, useRef } from 'react';
import { listenToChatMessages, sendMessage } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatWindow({ chatId, currentUserId, otherUserId }) {
    const { userData } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen to messages in real-time
    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToChatMessages(chatId, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) {
            return;
        }

        if (newMessage.length > 1000) {
            toast.error('Message too long (max 1000 characters)');
            return;
        }

        try {
            setSending(true);
            await sendMessage(
                chatId,
                currentUserId,
                userData?.displayName || userData?.name || 'User',
                newMessage.trim(),
                otherUserId
            );
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-primary text-white p-4 font-bold rounded-t-lg">
                Chat
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                        }`}
                                >
                                    {!isOwn && (
                                        <p className="text-xs font-semibold mb-1 opacity-75">
                                            {message.senderName}
                                        </p>
                                    )}
                                    <p className="break-words">{message.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={sending}
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    {newMessage.length}/1000 characters
                </p>
            </form>
        </div>
    );
}
