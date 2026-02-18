import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackMessage {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  message: string;
  timestamp: number;
}

const STORAGE_KEY = 'next-please-feedback';

const loadMessages = (): FeedbackMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultMessages();
  } catch {
    return getDefaultMessages();
  }
};

const getDefaultMessages = (): FeedbackMessage[] => [
  {
    id: '1',
    author: 'GameFan99',
    message: 'Love the Tetris game! The controls are super smooth. Would be cool to add a ghost piece preview though.',
    timestamp: Date.now() - 86400000 * 2,
    upvotes: 43,
    downvotes: 2,
    replies: [
      { id: 'r1', author: 'RetroGamer', message: 'Agreed! Ghost piece would be a great addition.', timestamp: Date.now() - 86400000 },
    ],
  },
  {
    id: '2',
    author: 'PuzzleMaster',
    message: 'The Sudoku difficulty levels are perfect. Medium is actually challenging without being frustrating. Great job!',
    timestamp: Date.now() - 86400000 * 5,
    upvotes: 27,
    downvotes: 1,
    replies: [],
  },
  {
    id: '3',
    author: 'SpeedRunner',
    message: 'Can we get a global timer for speed challenges? Would love to compete with friends in real time.',
    timestamp: Date.now() - 86400000,
    upvotes: 18,
    downvotes: 3,
    replies: [
      { id: 'r2', author: 'DevTeam', message: 'Great idea! We\'re looking into multiplayer features.', timestamp: Date.now() - 3600000 },
    ],
  },
];

const saveMessages = (msgs: FeedbackMessage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
};

const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const FeedbackSection: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<FeedbackMessage[]>(loadMessages);
  const [newMessage, setNewMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [votedPosts, setVotedPosts] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    try {
      const votes = localStorage.getItem('next-please-votes');
      if (votes) setVotedPosts(JSON.parse(votes));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('next-please-votes', JSON.stringify(votedPosts));
  }, [votedPosts]);

  const handleVote = (id: string, direction: 'up' | 'down') => {
    const currentVote = votedPosts[id];

    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      let { upvotes, downvotes } = msg;

      // Undo previous vote
      if (currentVote === 'up') upvotes--;
      if (currentVote === 'down') downvotes--;

      // Apply new vote (or toggle off)
      if (currentVote !== direction) {
        if (direction === 'up') upvotes++;
        else downvotes++;
      }

      return { ...msg, upvotes, downvotes };
    }));

    setVotedPosts(prev => {
      const next = { ...prev };
      if (currentVote === direction) {
        delete next[id];
      } else {
        next[id] = direction;
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const name = user?.email?.split('@')[0] || displayName.trim();
    if (!name || !newMessage.trim()) {
      toast({ title: 'Missing info', description: 'Please enter your name and message.', variant: 'destructive' });
      return;
    }
    if (newMessage.trim().length > 500) {
      toast({ title: 'Too long', description: 'Message must be under 500 characters.', variant: 'destructive' });
      return;
    }

    const msg: FeedbackMessage = {
      id: crypto.randomUUID(),
      author: name.slice(0, 30),
      message: newMessage.trim().slice(0, 500),
      timestamp: Date.now(),
      upvotes: 1,
      downvotes: 0,
      replies: [],
    };
    setMessages(prev => [msg, ...prev]);
    setNewMessage('');
    toast({ title: 'Posted!', description: 'Your feedback has been shared.' });
  };

  const handleReply = (parentId: string) => {
    const name = user?.email?.split('@')[0] || displayName.trim();
    if (!name || !replyText.trim()) return;

    const reply: Reply = {
      id: crypto.randomUUID(),
      author: name.slice(0, 30),
      message: replyText.trim().slice(0, 300),
      timestamp: Date.now(),
    };
    setMessages(prev => prev.map(msg =>
      msg.id === parentId ? { ...msg, replies: [...msg.replies, reply] } : msg
    ));
    setReplyText('');
    setReplyingTo(null);
  };

  const handleShare = (msg: FeedbackMessage) => {
    const text = `"${msg.message}" — ${msg.author} on Next Please!`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Message copied to clipboard.' });
    }
  };

  const score = (msg: FeedbackMessage) => msg.upvotes - msg.downvotes;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-5 w-5 text-foreground" />
        <h3 className="text-xl font-bold text-foreground">Community Feedback</h3>
      </div>

      {/* Post form */}
      <Card className="p-4 bg-card border-border space-y-3">
        {!user && (
          <Input
            placeholder="Your display name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={30}
            className="bg-muted border-border text-foreground"
          />
        )}
        <Textarea
          placeholder="Share your thoughts, feedback, or game ideas..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          maxLength={500}
          className="bg-muted border-border text-foreground resize-none min-h-[80px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{newMessage.length}/500</span>
          <Button onClick={handleSubmit} size="sm" className="bg-primary text-primary-foreground">
            <Send className="h-4 w-4 mr-1" />
            Post
          </Button>
        </div>
      </Card>

      {/* Messages */}
      <div className="space-y-3">
        {messages.sort((a, b) => score(b) - score(a)).map(msg => (
          <Card key={msg.id} className="bg-card border-border overflow-hidden">
            <div className="flex">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-0.5 p-3 bg-muted/30">
                <button
                  onClick={() => handleVote(msg.id, 'up')}
                  className={`p-0.5 rounded transition-colors ${votedPosts[msg.id] === 'up' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ArrowBigUp className="h-6 w-6" fill={votedPosts[msg.id] === 'up' ? 'currentColor' : 'none'} />
                </button>
                <span className={`text-sm font-bold ${score(msg) > 0 ? 'text-foreground' : score(msg) < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {score(msg)}
                </span>
                <button
                  onClick={() => handleVote(msg.id, 'down')}
                  className={`p-0.5 rounded transition-colors ${votedPosts[msg.id] === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ArrowBigDown className="h-6 w-6" fill={votedPosts[msg.id] === 'down' ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{msg.author}</span>
                  <span className="text-xs text-muted-foreground">• {timeAgo(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-foreground/90 mb-3 leading-relaxed">{msg.message}</p>

                {/* Action bar */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {msg.replies.length}
                  </button>
                  <button
                    onClick={() => handleShare(msg)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>

                {/* Replies */}
                {msg.replies.length > 0 && (
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-border">
                    {msg.replies.map(reply => (
                      <div key={reply.id} className="text-sm">
                        <span className="font-semibold text-foreground">{reply.author}</span>
                        <span className="text-xs text-muted-foreground ml-2">• {timeAgo(reply.timestamp)}</span>
                        <p className="text-foreground/80 mt-0.5">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {replyingTo === msg.id && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      maxLength={300}
                      className="bg-muted border-border text-foreground text-sm h-8"
                      onKeyDown={e => e.key === 'Enter' && handleReply(msg.id)}
                    />
                    <Button size="sm" onClick={() => handleReply(msg.id)} className="h-8 bg-primary text-primary-foreground">
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;
