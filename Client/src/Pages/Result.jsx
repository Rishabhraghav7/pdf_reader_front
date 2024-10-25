import React, { useEffect, useRef, useState } from 'react';
import './Result.css';
import axios from 'axios';

const Result = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userId, setUserId] = useState(Date.now());
    const [numRecords, setNumRecords] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:5000/ws/${userId}`);

        const handleMessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', content: event.data }]);
        };

        ws.current.onmessage = handleMessage;
        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.current.onmessage = null; // Clean up the message listener
            ws.current.close();
        };
    }, [userId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            ws.current.send(input);
            setMessages((prevMessages) => [...prevMessages, { sender: 'user', content: input }]);
            setInput('');
        }
    };

    const getPreviousConversation = () => {
        ws.current.send(`get_previous_conversation ${userId} ${numRecords}`);
    };

    const getAllConversations = () => {
        ws.current.send(`get_all_conversations ${userId}`);
    };

    return (
        <div className="container mt-3">
            <h1>FastAI ChatBot</h1>
            <form onSubmit={getPreviousConversation}>
                {/* Additional inputs for conversation retrieval can go here */}
            </form>
            <div id="conversation-history" style={{ background: "black", color: "white", padding: "10px", borderRadius: "5px" }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ margin: "5px 0", textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                        <strong>{msg.sender === 'user' ? 'You' : 'PDF_QA'}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <h2>Chat</h2>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="btn btn-outline-primary mt-2">Send</button>
            </form>
        </div>
    );
};

export default Result;
