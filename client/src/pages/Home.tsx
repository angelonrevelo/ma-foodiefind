import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, User } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>\n          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Foodie Find</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover niche restaurants with your friends. Find the perfect food together.
          </p>
          <Button
            asChild
            className="btn-pastel w-full text-lg py-6"
          >
              <a href={getLoginUrl()}>Sign in to Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl font-bold text-foreground">Foodie Find</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, {user?.name || "Friend"}!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
            How would you like to discover food?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Choose to search solo or collaborate with friends in a room
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo Mode */}
            <Link href="/search/solo">
              <Card className="card-pastel p-8 h-full cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <div>
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Search Solo
                    </h3>
                    <p className="text-muted-foreground">
                      Find amazing restaurants based on your cravings and location
                    </p>
                  </div>
                  <div className="mt-6 w-full">
                    <Button asChild className="btn-pastel w-full">
                      <a href="#" className="flex items-center justify-center">
                        <User className="mr-2 h-4 w-4" />
                        Start Solo Search
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Room Mode */}
            <div className="space-y-4">
              {/* Create Room */}
              <Link href="/room/create">
                <Card className="card-pastel p-8 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Create a Room
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start a collaborative search with friends
                    </p>
                    <Button asChild className="btn-pastel w-full">
                      <a href="#" className="flex items-center justify-center">
                        <Users className="mr-2 h-4 w-4" />
                        Create Room
                      </a>
                    </Button>
                  </div>
                </Card>
              </Link>

              {/* Join Room */}
              <Link href="/room/join">
                <Card className="card-pastel p-8 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">🔗</div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Join a Room
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter a room code to join friends
                    </p>
                    <Button asChild className="btn-pastel w-full">
                      <a href="#" className="flex items-center justify-center">
                        <Users className="mr-2 h-4 w-4" />
                        Join Room
                      </a>
                    </Button>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-pastel p-6">
              <div className="text-3xl mb-2">🗺️</div>
              <h4 className="font-semibold text-foreground mb-1">Location Based</h4>
              <p className="text-sm text-muted-foreground">
                Uses your location to find restaurants near you
              </p>
            </Card>
            <Card className="card-pastel p-6">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-semibold text-foreground mb-1">Delivery Options</h4>
              <p className="text-sm text-muted-foreground">
                Filter by Grab, Foodpanda, or dine-in
              </p>
            </Card>
            <Card className="card-pastel p-6">
              <div className="text-3xl mb-2">⭐</div>
              <h4 className="font-semibold text-foreground mb-1">Niche Finds</h4>
              <p className="text-sm text-muted-foreground">
                Discover unique restaurants beyond mainstream
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
