import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import type { Country } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { processQuestion } from '../../utils/chatEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  countries: Country[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ln_chatbot_messages';
const STORAGE_LANG_KEY = 'ln_chatbot_lang';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    // Keep last 100 messages max to avoid bloating storage
    const toSave = msgs.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore quota errors */ }
}

export default function ChatBot({ countries }: ChatBotProps) {
  const { lang } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const idCounter = useRef<number>(0);

  // Initialise with a welcome message whenever lang changes or on first open
  const hasInitialised = useRef<boolean>(false);

  const getWelcomeMessage = useCallback((): string => {
    if (lang === 'fr') {
      return [
        'Bienvenue ! Je suis l\u2019assistant robot du Leave Network Explorer.',
        '',
        'Vous pouvez me poser des questions comme :',
        '- Le nom d\u2019un pays (ex : \u00ab France \u00bb)',
        '- \u00ab Comparer Canada et Su\u00e8de \u00bb',
        '- \u00ab Meilleur cong\u00e9 maternit\u00e9 \u00bb',
        '- \u00ab G\u00e9n\u00e9rosit\u00e9 \u00bb ou \u00ab \u00c9galit\u00e9 \u00bb',
        '- \u00ab Qu\u00e9bec \u00bb ou \u00ab RQAP \u00bb',
        '',
        'Limitations : je suis un assistant \u00e0 base de mots-cl\u00e9s, pas une intelligence artificielle. Mes r\u00e9ponses se limitent aux donn\u00e9es disponibles dans la base (LPRN 2025). Je ne comprends pas les questions complexes ou ambigu\u00ebs et je ne peux pas fournir de conseils juridiques.',
      ].join('\n');
    }
    return [
      'Welcome! I am the Leave Network Explorer robot assistant.',
      '',
      'You can ask me things like:',
      '- A country name (e.g., "France")',
      '- "Compare Canada and Sweden"',
      '- "Best maternity leave"',
      '- "Generosity" or "Equality"',
      '- "Quebec" or "QPIP"',
      '',
      'Limitations: I am a keyword-based assistant, not an AI. My answers are limited to the data available in the database (LPRN 2025). I cannot understand complex or ambiguous questions and I do not provide legal advice.',
    ].join('\n');
  }, [lang]);

  useEffect(() => {
    if (!hasInitialised.current) {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY);
      const saved = loadMessages();
      if (saved.length > 0 && savedLang === lang) {
        setMessages(saved);
        idCounter.current = Math.max(...saved.map((m) => m.id), 0);
      } else {
        idCounter.current += 1;
        setMessages([
          { id: idCounter.current, sender: 'bot', text: getWelcomeMessage() },
        ]);
      }
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      hasInitialised.current = true;
    }
  }, [getWelcomeMessage, lang]);

  // Reset welcome when lang changes
  useEffect(() => {
    if (hasInitialised.current) {
      const prevLang = localStorage.getItem(STORAGE_LANG_KEY);
      if (prevLang !== lang) {
        idCounter.current += 1;
        setMessages([
          { id: idCounter.current, sender: 'bot', text: getWelcomeMessage() },
        ]);
        localStorage.setItem(STORAGE_LANG_KEY, lang);
      }
    }
  }, [lang, getWelcomeMessage]);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSend = (): void => {
    const trimmed = input.trim();
    if (!trimmed) return;

    idCounter.current += 1;
    const userMsg: ChatMessage = {
      id: idCounter.current,
      sender: 'user',
      text: trimmed,
    };

    const response = processQuestion(trimmed, countries, lang);

    idCounter.current += 1;
    const botMsg: ChatMessage = {
      id: idCounter.current,
      sender: 'bot',
      text: response,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string): void => {
    idCounter.current += 1;
    const userMsg: ChatMessage = {
      id: idCounter.current,
      sender: 'user',
      text,
    };

    const response = processQuestion(text, countries, lang);

    idCounter.current += 1;
    const botMsg: ChatMessage = {
      id: idCounter.current,
      sender: 'bot',
      text: response,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const suggestions =
    lang === 'fr'
      ? [
          'Cong\u00e9 maternit\u00e9 en France',
          'Comparer Su\u00e8de et Canada',
          'Meilleur cong\u00e9 paternit\u00e9',
          'Qu\u2019est-ce que le RQAP ?',
          'Score de g\u00e9n\u00e9rosit\u00e9',
        ]
      : [
          'Maternity leave in France',
          'Compare Sweden and Canada',
          'Best paternity leave',
          'What is QPIP?',
          'Generosity score',
        ];

  const headerTitle =
    lang === 'fr' ? 'Assistant robot' : 'Robot Assistant';

  const placeholderText =
    lang === 'fr' ? 'Posez votre question\u2026' : 'Ask your question...';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-2xl transition-transform hover:scale-110 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
          aria-label={lang === 'fr' ? 'Ouvrir le chatbot' : 'Open chatbot'}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-800 px-4 py-3 text-white">
            <span className="text-sm font-semibold">{headerTitle}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              aria-label={lang === 'fr' ? 'Fermer le chatbot' : 'Close chatbot'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full bg-teal-50 px-2.5 py-1.5 text-xs text-teal-700 transition-colors hover:bg-teal-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-100">
            <p className="text-[10px] text-amber-700 leading-tight">
              {lang === 'fr'
                ? 'Assistant \u00e0 base de mots-cl\u00e9s. R\u00e9ponses limit\u00e9es aux donn\u00e9es LPRN 2025. Ne constitue pas un avis juridique.'
                : 'Keyword-based assistant. Answers limited to LPRN 2025 data. Not legal advice.'}
            </p>
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              aria-label={placeholderText}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-400"
              aria-label={lang === 'fr' ? 'Envoyer' : 'Send'}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
