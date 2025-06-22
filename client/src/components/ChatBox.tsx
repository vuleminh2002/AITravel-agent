import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { getPlanById } from "../services/planService";
import { sendMessage } from "../services/chatService";
import { AuthContext } from "../store/AuthContext";

export function ChatBox({ selectedPlanId }: { selectedPlanId: string | null }) {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = useCallback(async () => {
        if (!selectedPlanId) return;
        try {
            const plan = await getPlanById(selectedPlanId);
            setMessages(plan.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
        }
    }, [selectedPlanId]);

    useEffect(() => {
        if (selectedPlanId) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [selectedPlanId, fetchMessages]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedPlanId) return;

        const userMessage = { role: 'human', content: input };
        setMessages(currentMessages => [...currentMessages, userMessage]);
        
        const messageToSend = input;
        setInput('');
        setIsLoading(true);

        try {
            await sendMessage(messageToSend, selectedPlanId);
            await fetchMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(currentMessages => currentMessages.filter(msg => msg !== userMessage));
            setInput(messageToSend);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="mt-4 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col h-96 dark:bg-gray-800 dark:border-gray-700">
            <h1 className="text-xl font-bold p-4 flex-shrink-0 border-b dark:border-gray-600 dark:text-white">Travel Assistant</h1>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    const isUser = message.role === 'human';
                    return (
                        <div key={index} className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser && <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Assistant" className="rounded-full" style={{ width: '40px', height: '40px' }} />}
                            <div className={`max-w-xs p-3 rounded-lg ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                <p>{message.content}</p>
                            </div>
                            {isUser && user?.picture && <img src={user.picture} alt="You" className="rounded-full" style={{ width: '40px', height: '40px' }} />}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3 p-4 border-t flex-shrink-0 dark:border-gray-600">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    className="flex-grow border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Type a message..."
                    disabled={isLoading || !selectedPlanId}
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400" 
                    disabled={isLoading || !selectedPlanId}
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}