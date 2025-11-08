import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function JoinRoom() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const joinRoomMutation = trpc.rooms.join.useMutation({
    onSuccess: (data) => {
      setLocation(`/room/${data.id}`);
    },
    onError: (err) => {
      setError("Invalid room code. Please check and try again.");
    },
  });

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!roomCode.trim() || roomCode.length !== 6) {
      setError("Room code must be 6 characters");
      return;
    }

    joinRoomMutation.mutate({ code: roomCode.toUpperCase() });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center gap-2">
          <span className="text-3xl">🍽️</span>
          <h1 className="text-2xl font-bold text-foreground">Foodie Find</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="card-pastel p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Join a Room
            </h2>
            <p className="text-muted-foreground mb-6">
              Enter the room code shared by your friend
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Room Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g., ABC123"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  disabled={joinRoomMutation.isPending}
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-widest font-bold"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={roomCode.length !== 6 || joinRoomMutation.isPending}
                className="btn-pastel w-full"
              >
                {joinRoomMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Join Room
              </Button>
            </form>

            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full mt-4"
            >
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
