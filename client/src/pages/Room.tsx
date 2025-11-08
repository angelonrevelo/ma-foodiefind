import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check, MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function Room() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/room/:id");
  const roomId = params?.id ? parseInt(params.id) : null;
  
  const [craving, setCraving] = useState("");
  const [copied, setCopied] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000);

  const roomQuery = trpc.rooms.get.useQuery(
    { roomId: roomId! },
    { enabled: !!roomId }
  );

  const membersQuery = trpc.rooms.getMembers.useQuery(
    { roomId: roomId! },
    { enabled: !!roomId }
  );

  const cravingsQuery = trpc.rooms.getCravings.useQuery(
    { roomId: roomId! },
    { enabled: !!roomId }
  );

  const addCravingMutation = trpc.rooms.addCraving.useMutation({
    onSuccess: () => {
      setCraving("");
      cravingsQuery.refetch();
      toast.success("Craving added!");
    },
    onError: () => {
      toast.error("Failed to add craving");
    },
  });

  const removeCravingMutation = trpc.rooms.removeCraving.useMutation({
    onSuccess: () => {
      cravingsQuery.refetch();
      toast.success("Craving removed");
    },
  });

  const updateLocationMutation = trpc.rooms.updateLocation.useMutation({
    onSuccess: () => {
      setLocationGranted(true);
      toast.success("Location shared!");
    },
    onError: () => {
      toast.error("Failed to share location");
    },
  });

  const searchMutation = trpc.search.searchRestaurants.useMutation({
    onSuccess: () => {
      setLocation(`/room/${roomId}/results`);
      toast.success("Search completed!");
    },
    onError: () => {
      toast.error("Search failed. Please try again.");
    },
  });

  const handleAddCraving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!craving.trim() || !roomId) return;
    addCravingMutation.mutate({ roomId, craving });
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationMutation.mutate({
          roomId: roomId!,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
      },
      (error) => {
        toast.error("Failed to get location");
      }
    );
  };

  const handleSearch = () => {
    if (!roomId) return;
    searchMutation.mutate({
      roomId,
      searchRadius,
      maxResults: 20,
    });
  };

  const handleCopyCode = () => {
    if (roomQuery.data?.code) {
      navigator.clipboard.writeText(roomQuery.data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!match || !roomId) {
    return <div>Invalid room</div>;
  }

  if (roomQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {roomQuery.data?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {membersQuery.data?.length || 0} member(s)
              </p>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            size="sm"
          >
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Room Info & Cravings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Code Card */}
            <Card className="card-pastel p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Share Room Code
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg p-4">
                  <p className="text-3xl font-bold text-foreground tracking-widest text-center">
                    {roomQuery.data?.code}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>

            {/* Location Card */}
            <Card className="card-pastel p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Share Your Location
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {locationGranted
                  ? "Location shared! Your position will be used to find restaurants."
                  : "Share your location so we can find restaurants near the center of your group."}
              </p>
              <Button
                onClick={handleShareLocation}
                disabled={updateLocationMutation.isPending || locationGranted}
                className="btn-pastel w-full"
              >
                {updateLocationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {locationGranted ? "Location Shared" : "Share Location"}
              </Button>
            </Card>

            {/* Cravings Card */}
            <Card className="card-pastel p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Food Cravings
              </h3>
              <form onSubmit={handleAddCraving} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., Pizza, Sushi, Pasta..."
                    value={craving}
                    onChange={(e) => setCraving(e.target.value)}
                    disabled={addCravingMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!craving.trim() || addCravingMutation.isPending}
                    size="sm"
                    className="btn-pastel"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {cravingsQuery.data && cravingsQuery.data.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {cravingsQuery.data.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-muted rounded-lg p-3"
                    >
                      <span className="text-foreground">{c.craving}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCravingMutation.mutate({ cravingId: c.id })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">
                  No cravings added yet. Add one to get started!
                </p>
              )}
            </Card>
          </div>

          {/* Right Column - Search */}
          <div>
            <Card className="card-pastel p-6 sticky top-4">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Search Restaurants
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Radius (meters)
                  </label>
                  <Input
                    type="number"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    disabled={searchMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(searchRadius / 1000).toFixed(1)} km
                  </p>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={
                    !locationGranted ||
                    !cravingsQuery.data?.length ||
                    searchMutation.isPending
                  }
                  className="btn-pastel w-full"
                >
                  {searchMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Search Restaurants
                </Button>

                {!locationGranted && (
                  <p className="text-xs text-destructive">
                    Share your location to search
                  </p>
                )}
                {!cravingsQuery.data?.length && (
                  <p className="text-xs text-destructive">
                    Add cravings to search
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
