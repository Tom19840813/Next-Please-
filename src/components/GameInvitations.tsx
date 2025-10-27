import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Gamepad2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Invitation {
  id: string;
  sender_id: string;
  sender_username: string;
  created_at: string;
}

const GameInvitations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      const { data, error } = await supabase
        .from('game_invitations' as any)
        .select(`
          id,
          sender_id,
          created_at,
          profiles!game_invitations_sender_id_fkey(username)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      const formattedInvitations = data.map((inv: any) => ({
        id: inv.id,
        sender_id: inv.sender_id,
        sender_username: inv.profiles?.username || 'Unknown Player',
        created_at: inv.created_at,
      }));

      setInvitations(formattedInvitations);
    };

    fetchInvitations();

    // Subscribe to new invitations
    const channel = supabase
      .channel('game_invitations_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invitations',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          fetchInvitations();
          toast({
            title: "New Game Challenge!",
            description: "Someone wants to play with you!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessing(invitationId);
      
      const { error } = await supabase
        .from('game_invitations' as any)
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Challenge Accepted!",
        description: "Starting multiplayer game...",
      });

      // Navigate to game
      navigate('/play');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessing(invitationId);
      
      const { error } = await supabase
        .from('game_invitations' as any)
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Challenge Declined",
        description: "Invitation declined",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (!user || invitations.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <Card className="shadow-xl border-2 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Game Challenges
          </CardTitle>
          <CardDescription>
            {invitations.length} pending {invitations.length === 1 ? 'challenge' : 'challenges'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
            >
              <div>
                <p className="font-medium text-sm">{invitation.sender_username}</p>
                <p className="text-xs text-muted-foreground">wants to play</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="default"
                  className="h-8 w-8"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processing === invitation.id}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={processing === invitation.id}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameInvitations;
