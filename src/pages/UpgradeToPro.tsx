import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Zap, Shield, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import ProBadge from '@/components/ProBadge';

const UpgradeToPro: React.FC = () => {
  const { isPro } = useSubscription();

  if (isPro) {
    return (
      <div className="min-h-screen bg-background arcade-grid flex items-center justify-center p-4">
        <Card className="max-w-md bg-card/90 backdrop-blur-sm border-primary">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ProBadge size="lg" />
            </div>
            <CardTitle className="text-foreground">You're Already Pro!</CardTitle>
            <CardDescription>
              You're enjoying all the premium benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
    <div className="min-h-screen bg-background arcade-grid p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <Crown className="h-12 w-12 text-accent" />
            <h1 className="text-4xl font-bold text-foreground neon-text">
              Upgrade to Pro
            </h1>
            <Crown className="h-12 w-12 text-accent" />
            <Sparkles className="h-8 w-8 text-secondary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">
            Unlock the ultimate gaming experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Ad-Free Experience</CardTitle>
              <CardDescription>
                Enjoy uninterrupted gameplay with zero advertisements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-secondary/30 hover:border-secondary transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-foreground">Exclusive Badge</CardTitle>
              <CardDescription>
                Show off your Pro status with a premium badge
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-accent/30 hover:border-accent transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">Priority Support</CardTitle>
              <CardDescription>
                Get faster responses and dedicated assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Support Development</CardTitle>
              <CardDescription>
                Help us create more amazing games and features
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary neon-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-foreground">Contact Admin</CardTitle>
            <CardDescription className="text-lg">
              Pro membership is currently managed by our team
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              Please contact our administrator to upgrade your account to Pro.
              Payment integration is coming soon!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/">
                <Button variant="outline" className="border-primary text-foreground hover:bg-primary hover:text-primary-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Button>
              </Link>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
                <Crown className="mr-2 h-4 w-4" />
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
