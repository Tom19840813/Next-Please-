import React, { useState } from 'react';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Gamepad2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OnlineUsersProps {
  onClose?: () => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ onClose }) => {
  const { onlineUsers } = useOnlineUsers();
  const { user } = useAuth();
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const sendGameInvite = async (recipientId: string, recipientUsername: string) => {
    if (!user) return;

    try {
      setSendingInvite(recipientId);
      
      const { error } = await supabase
        .from('game_invitations' as any)
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent!",
        description: `Challenge sent to ${recipientUsername}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingInvite(null);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-80 shadow-xl border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Online Players
          <Badge variant="secondary" className="ml-1">
            {onlineUsers.length}
          </Badge>
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other players online</p>
            <p className="text-xs mt-1">Invite friends to play!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-sm">
                      {onlineUser.username}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendGameInvite(onlineUser.user_id, onlineUser.username)}
                    disabled={sendingInvite === onlineUser.user_id}
                    className="h-8"
                  >
                    <Gamepad2 className="h-3 w-3 mr-1" />
                    {sendingInvite === onlineUser.user_id ? 'Sending...' : 'Challenge'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsers;
