import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
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
        'Bienvenue ! Je suis l\u2019assistant du Leave Network Explorer.',
        '',
        'Vous pouvez me poser des questions comme :',
        '• Le nom d\u2019un pays (ex : \u00ab France \u00bb ou \u00ab Suède \u00bb)',
        '• \u00ab Comparer Canada et Suède \u00bb',
        '• \u00ab Meilleur congé maternité \u00bb',
        '• \u00ab Générosité \u00bb ou \u00ab Égalité \u00bb',
        '• \u00ab Québec \u00bb ou \u00ab RQAP \u00bb',
        '',
        'Source des données : LPRN 2025.',
      ].join('\n');
    }
    return [
      'Welcome! I am the Leave Network Explorer assistant.',
      '',
      'You can ask me things like:',
      '• A country name (e.g., "France" or "Sweden")',
      '• "Compare Canada and Sweden"',
      '• "Best maternity leave"',
      '• "Generosity" or "Equality"',
      '• "Quebec" or "QPIP"',
      '',
      'Data source: LPRN 2025.',
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
          'Congé maternité en France',
          'Comparer Suède et Canada',
          'Meilleur congé paternité',
          'Qu’est-ce que le RQAP ?',
          'Score de générosité',
        ]
      : [
          'Maternity leave in France',
          'Compare Sweden and Canada',
          'Best paternity leave',
          'What is QPIP?',
          'Generosity score',
        ];

  const headerTitle =
    lang === 'fr' ? 'Assistant Leave Network' : 'Leave Network Assistant';

  const placeholderText =
    lang === 'fr' ? 'Posez une question sur les données...' : 'Ask about leave policies...';

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
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 cursor-pointer"
          aria-label={lang === 'fr' ? 'Ouvrir le chatbot' : 'Open chatbot'}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-850 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 px-4 py-3.5 text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Bot size={16} />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold tracking-tight">{headerTitle}</span>
                <span className="block text-[10px] text-teal-400 font-medium">LPRN 2025</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={lang === 'fr' ? 'Fermer le chatbot' : 'Close chatbot'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 px-3 py-1.5 text-[11px] font-medium text-teal-700 dark:text-teal-300 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/80 cursor-pointer text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer banner */}
          <div className="px-3.5 py-1.5 bg-amber-50/90 dark:bg-amber-950/40 border-t border-amber-200/60 dark:border-amber-900/40">
            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-tight">
              {lang === 'fr'
                ? 'Assistant à base de mots-clés sur la base LPRN 2025. Ne constitue pas un avis juridique.'
                : 'Keyword-based assistant on LPRN 2025 data. Not legal advice.'}
            </p>
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              aria-label={placeholderText}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-400 shrink-0 cursor-pointer shadow-xs"
              aria-label={lang === 'fr' ? 'Envoyer' : 'Send'}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
