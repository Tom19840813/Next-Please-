import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Zap, Shield, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import ProBadge from '@/components/ProBadge';

const UpgradeToPro: React.FC = () => {
  const { isPro } = useSubscription();

  if (isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ProBadge size="lg" />
            </div>
            <CardTitle>You're Already Pro!</CardTitle>
            <CardDescription>
              You're enjoying all the premium benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Upgrade to Pro
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Unlock the ultimate gaming experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-yellow-500/20">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Ad-Free Experience</CardTitle>
              <CardDescription>
                Enjoy uninterrupted gameplay with zero advertisements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-yellow-500/20">
            <CardHeader>
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Exclusive Badge</CardTitle>
              <CardDescription>
                Show off your Pro status with a premium badge
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-yellow-500/20">
            <CardHeader>
              <Shield className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Priority Support</CardTitle>
              <CardDescription>
                Get faster responses and dedicated assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-yellow-500/20">
            <CardHeader>
              <Crown className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Support Development</CardTitle>
              <CardDescription>
                Help us create more amazing games and features
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Contact Admin</CardTitle>
            <CardDescription className="text-lg">
              Pro membership is currently managed by our team
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              Please contact our administrator to upgrade your account to Pro.
              Payment integration is coming soon!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Button>
              </Link>
              <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700">
                Contact Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpgradeToPro;
