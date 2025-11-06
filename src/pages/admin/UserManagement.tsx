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
      // Get all profiles with their subscriptions
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_subscriptions (
            subscription_type,
            subscription_status
          )
        `);

      if (error) throw error;

      // Get user emails from auth
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile: any) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
          return {
            id: profile.id,
            email: user?.email || 'Unknown',
            subscription_type: profile.user_subscriptions?.[0]?.subscription_type || null,
            subscription_status: profile.user_subscriptions?.[0]?.subscription_status || null,
          };
        })
      );

      setUsers(usersWithEmails);
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
      
      const { error } = await supabase
        .from('user_subscriptions')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
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
                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.email}</p>
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
