'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Am I qualified for DPTE with C (Plain)?',
  'What are the fees for Diploma programmes?',
  'How do I upgrade from P1 / ECDE Certificate?',
  'What documents do I need to upload?',
  'How to pay application fee via M-Pesa?',
];

export default function AiAdvisorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 **Hello! I am the BTTC Admissions & Academic AI Advisor.**\n\nHow can I assist you with your teacher training application, programme entry requirements, or fees today?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const idCounterRef = useRef(1);

  const getNextId = (prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}_${idCounterRef.current}`;
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: getNextId('usr'),
      role: 'user',
      content: query,
      timestamp: 'Sent',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyContent = data.reply || 'I could not retrieve an answer at the moment. Please consult the Admissions Office directly.';

      const assistantMsg: Message = {
        id: getNextId('asst'),
        role: 'assistant',
        content: replyContent,
        timestamp: 'Delivered',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: getNextId('err'),
        role: 'assistant',
        content: '⚠️ Network connection issue. You can also review our detailed [Frequently Asked Questions](/faqs) or contact the admissions desk at **0746 211 764**.',
        timestamp: 'Offline',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderFormattedText = (text: string) => {
    // Simple light parser for markdown bold and bullet points
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '8px' }} />;

      const isHeading = trimmed.startsWith('### ') || trimmed.startsWith('## ');
      if (isHeading) {
        const hText = trimmed.replace(/^#+\s*/, '');
        return (
          <h4
            key={idx}
            style={{
              fontWeight: '700',
              fontSize: '14px',
              color: 'var(--primary-navy, #0b2545)',
              margin: '8px 0 4px 0',
            }}
          >
            {hText}
          </h4>
        );
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      if (isBullet) {
        trimmed = trimmed.substring(2);
      }

      // Handle bold tags **text**
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ fontWeight: '600' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '6px',
              fontSize: '13px',
              lineHeight: '1.5',
              marginBottom: '4px',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: 'var(--accent-gold, #cda34f)', fontWeight: 'bold' }}>•</span>
            <span>{content}</span>
          </div>
        );
      }

      return (
        <p key={idx} style={{ fontSize: '13px', lineHeight: '1.5', margin: '4px 0' }}>
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontFamily: 'inherit',
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            id="btn-open-ai-advisor"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
              color: '#ffffff',
              border: '2px solid rgba(205, 163, 79, 0.4)',
              borderRadius: '30px',
              boxShadow: '0 8px 24px rgba(11, 37, 69, 0.25)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#cda34f',
                color: '#0b2545',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              ✦
            </span>
            <span>Ask Admissions AI</span>
          </button>
        )}

        {/* Chat Window Panel */}
        {isOpen && (
          <div
            id="ai-advisor-window"
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              height: '560px',
              maxHeight: 'calc(100vh - 100px)',
              background: 'var(--surface-color, #ffffff)',
              color: 'var(--text-color, #1e293b)',
              borderRadius: '16px',
              border: '1px solid rgba(11, 37, 69, 0.12)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Window Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #cda34f',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#cda34f',
                    color: '#0b2545',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  ✦
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    BTTC AI Advisor
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                      Online
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>
                    Instant Admissions & Academic Help
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href="/faqs"
                  onClick={() => setIsOpen(false)}
                  title="View Full FAQs"
                  style={{
                    color: '#ffffff',
                    opacity: 0.85,
                    fontSize: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  FAQs
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '20px',
                    cursor: 'pointer',
                    lineHeight: '1',
                    padding: '4px',
                  }}
                  aria-label="Close Advisor"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Question Chips */}
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(241, 245, 249, 0.8)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: '1px solid rgba(11, 37, 69, 0.15)',
                    color: '#0b2545',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontWeight: '500',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message History */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#fafbfd',
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: m.role === 'user' ? '#0b2545' : '#ffffff',
                      color: m.role === 'user' ? '#ffffff' : '#1e293b',
                      border: m.role === 'user' ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {renderFormattedText(m.content)}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      marginTop: '2px',
                      padding: '0 4px',
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '10px 16px',
                    borderRadius: '14px 14px 14px 2px',
                    background: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#cda34f',
                      animation: 'pulse 1s infinite alternate',
                    }}
                  />
                  <span>Consulting college admissions guidelines...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <div
              style={{
                padding: '12px',
                background: '#ffffff',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about entry requirements, fees, or courses..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: input.trim() && !loading ? '#0b2545' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  fontWeight: 'bold',
                  transition: 'background 0.2s ease',
                }}
                aria-label="Send Message"
              >
                ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
