import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Crown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProBadge from '@/components/ProBadge';

interface UserWithSubscription {
  id: string;
  email: string;
  subscription_type: string | null;
  subscription_status: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');

      if (profilesError) throw profilesError;

      // Get subscriptions separately - use any to bypass TypeScript checking
      const { data: subscriptions } = await supabase
        .from('user_subscriptions' as any)
        .select('user_id, subscription_type, subscription_status');

      const subscriptionMap = new Map(
        ((subscriptions as any[]) || []).map((sub: any) => [sub.user_id, sub])
      );

      const usersWithData = (profiles || []).map((profile: any) => {
        const sub = subscriptionMap.get(profile.id);
        return {
          id: profile.id,
          email: profile.username || 'Unknown User',
          subscription_type: sub?.subscription_type || null,
          subscription_status: sub?.subscription_status || null,
        };
      });

      setUsers(usersWithData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProStatus = async (userId: string, currentType: string | null) => {
    try {
      const newType = currentType === 'pro' ? 'free' : 'pro';
      
      // Use any to bypass TypeScript checking for tables not in generated types
      const { error } = await supabase
        .from('user_subscriptions' as any)
        .upsert({
          user_id: userId,
          subscription_type: newType,
          subscription_status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${newType === 'pro' ? 'upgraded to' : 'downgraded from'} Pro`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background arcade-grid p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Management</CardTitle>
            <CardDescription>
              Manage user subscriptions and Pro status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.subscription_type === 'pro' && user.subscription_status === 'active' ? (
                          <ProBadge size="sm" />
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleProStatus(user.id, user.subscription_type)}
                    variant={user.subscription_type === 'pro' ? 'outline' : 'default'}
                    size="sm"
                    className={user.subscription_type === 'pro' 
                      ? 'border-primary text-foreground hover:bg-primary hover:text-primary-foreground' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {user.subscription_type === 'pro' ? 'Remove Pro' : 'Make Pro'}
                  </Button>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
