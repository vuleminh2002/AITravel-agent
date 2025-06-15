import { useEffect, useState } from "react";
import { getPlanById } from "../services/planService";
import { sendMessage } from "../services/chatService";


export function ChatBox({selectedPlanId}: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [openChatBox, setOpenChatBox] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            const plan = await getPlanById(selectedPlanId);
            setMessages([{ role: 'assistant', content: 'hey how are you' }]);
        };
        fetchPlan();    
    }, [selectedPlanId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessages([...messages, { role: 'user', content: input }]);
        setInput('');
        const response = await sendMessage(input, selectedPlanId);
        setMessages([...messages, { role: 'assistant', content: response.response.answer }]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <button onClick={() => setOpenChatBox(!openChatBox)}>Open ChatBox</button>
            <div className="flex flex-col gap-2">
            {openChatBox && (
                <>
                    <h1>ChatBox</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={handleInputChange} />
                <button type="submit">Send</button>
            </form>
            <div>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p>{message.role}: {message.content}</p>
                    </div>
                        ))}
                </div>
                </>
            )}
            </div>
        </div>
    )
}