import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Star, Globe } from "lucide-react";

export default function SearchResults() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/room/:id/results");
  const roomId = params?.id ? parseInt(params.id) : null;

  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "delivery" | "dineIn">("all");

  const searchResultsQuery = trpc.search.getSearchResults.useQuery(
    { roomId: roomId! },
    { enabled: !!roomId }
  );

  const filteredResultsQuery = trpc.search.filterByDelivery.useQuery(
    { roomId: roomId!, deliveryType: deliveryFilter },
    { enabled: !!roomId }
  );

  if (!match || !roomId) {
    return <div>Invalid room</div>;
  }

  if (searchResultsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const results = filteredResultsQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
          </div>
          <Button
            onClick={() => setLocation(`/room/${roomId}`)}
            variant="outline"
            size="sm"
          >
            Back to Room
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={deliveryFilter === "all" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("all")}
            className={deliveryFilter === "all" ? "btn-pastel" : ""}
          >
            All Options
          </Button>
          <Button
            variant={deliveryFilter === "delivery" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("delivery")}
            className={deliveryFilter === "delivery" ? "btn-pastel" : ""}
          >
            Delivery Only
          </Button>
          <Button
            variant={deliveryFilter === "dineIn" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("dineIn")}
            className={deliveryFilter === "dineIn" ? "btn-pastel" : ""}
          >
            Dine-In Only
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="card-pastel overflow-hidden hover:shadow-lg transition-shadow">
                {result.photoUrl && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={result.photoUrl}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {result.name}
                  </h3>

                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      {result.address}
                    </p>
                  </div>

                  {result.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-foreground">
                        {result.rating}
                      </span>
                      {result.userRatingCount && (
                        <span className="text-sm text-muted-foreground">
                          ({result.userRatingCount})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {result.hasDineIn === 1 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Dine-In
                      </span>
                    )}
                    {result.hasDelivery === 1 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Delivery
                      </span>
                    )}
                  </div>

                  {result.websiteUrl && (
                    <Button
                      onClick={() => {
                        if (result.websiteUrl) {
                          window.open(result.websiteUrl, "_blank");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-pastel p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Results Found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search radius or cravings
            </p>
            <Button
              onClick={() => setLocation(`/room/${roomId}`)}
              className="btn-pastel"
            >
              Back to Room
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
