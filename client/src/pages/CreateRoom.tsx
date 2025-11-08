import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check } from "lucide-react";

export default function CreateRoom() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [roomName, setRoomName] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);

  const createRoomMutation = trpc.rooms.create.useMutation({
    onSuccess: (data) => {
      setCreatedRoom(data);
    },
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    createRoomMutation.mutate({ name: roomName });
  };

  const handleCopyCode = () => {
    if (createdRoom?.code) {
      navigator.clipboard.writeText(createdRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnterRoom = () => {
    if (createdRoom?.id) {
      setLocation(`/room/${createdRoom.id}`);
    }
  };

  if (createdRoom) {
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
            <Card className="card-pastel p-8 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Room Created!
              </h2>
              <p className="text-muted-foreground mb-6">
                Share this code with your friends to join the room
              </p>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Room Code</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-3xl font-bold text-foreground tracking-widest">
                    {createdRoom.code}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleEnterRoom}
                  className="btn-pastel w-full"
                >
                  Enter Room
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
              Create a Room
            </h2>
            <p className="text-muted-foreground mb-6">
              Start a collaborative food discovery with your friends
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Room Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Pizza Night, Friend Hangout"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={createRoomMutation.isPending}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={!roomName.trim() || createRoomMutation.isPending}
                className="btn-pastel w-full"
              >
                {createRoomMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Room
              </Button>
            </form>

            {createRoomMutation.isError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                Failed to create room. Please try again.
              </div>
            )}

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
