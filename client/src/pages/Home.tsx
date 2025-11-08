import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="card-pastel p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Foodie Find</h1>
          <p className="text-muted-foreground mb-6">
            Discover amazing food with your friends
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="btn-pastel w-full"
          >
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl font-bold text-foreground">Foodie Find</h1>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            How would you like to discover food?
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose to search solo or collaborate with friends in a room
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <Card className="card-pastel p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Search Solo</h3>
            <p className="text-muted-foreground mb-6 flex-grow">
              Find amazing restaurants based on your cravings and location
            </p>
            <Button
              onClick={() => setLocation("/search/solo")}
              className="btn-pastel w-full"
            >
              Start Solo Search
            </Button>
          </Card>

          <div className="space-y-4">
            <Card className="card-pastel p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Create a Room</h3>
              <p className="text-muted-foreground mb-4 flex-grow">
                Start a collaborative search with friends
              </p>
              <Button
                onClick={() => setLocation("/room/create")}
                className="btn-pastel w-full"
              >
                Create Room
              </Button>
            </Card>

            <Card className="card-pastel p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Join a Room</h3>
              <p className="text-muted-foreground mb-4 flex-grow">
                Enter a room code to join friends
              </p>
              <Button
                onClick={() => setLocation("/room/join")}
                className="btn-pastel w-full"
              >
                Join Room
              </Button>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="card-pastel p-6 text-center">
            <div className="text-4xl mb-3">📍</div>
            <h4 className="font-bold text-foreground mb-2">Location Based</h4>
            <p className="text-sm text-muted-foreground">
              Uses your location to find restaurants near you
            </p>
          </Card>
          <Card className="card-pastel p-6 text-center">
            <div className="text-4xl mb-3">🚗</div>
            <h4 className="font-bold text-foreground mb-2">Delivery Options</h4>
            <p className="text-sm text-muted-foreground">
              Filter by Grab, Foodpanda, or dine-in
            </p>
          </Card>
          <Card className="card-pastel p-6 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h4 className="font-bold text-foreground mb-2">Niche Finds</h4>
            <p className="text-sm text-muted-foreground">
              Discover unique restaurants beyond mainstream
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
