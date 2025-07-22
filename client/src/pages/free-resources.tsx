import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Star,
  Clock,
  CheckCircle,
  Search,
  FileText,
  Quote,
  Brain,
  TreePine,
  Shield,
  Award,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FreeResource {
  name: string;
  description: string;
  category: string;
  url: string;
  accessed?: boolean;
  accessCount?: number;
  lastAccessed?: string | null;
}

// The 13 forgiveness.world resources
const FORGIVENESS_RESOURCES: FreeResource[] = [
  {
    name: "What is Forgiveness",
    description: "Fundamental understanding of forgiveness principles and concepts",
    category: "Foundation",
    url: "https://www.forgiveness.world/what-is-forgiveness"
  },
  {
    name: "Quotes about Forgiveness",
    description: "Inspiring quotes to motivate your forgiveness journey",
    category: "Inspiration",
    url: "https://www.forgiveness.world/quotes-about-forgiveness"
  },
  {
    name: "4 Forgiveness Techniques for Healing",
    description: "Practical techniques you can use immediately for emotional healing",
    category: "Techniques",
    url: "https://www.forgiveness.world/4-forgiveness-techniques"
  },
  {
    name: "The Grievance Story",
    description: "Understanding how grievances form and affect our wellbeing",
    category: "Understanding",
    url: "https://www.forgiveness.world/grievance-story"
  },
  {
    name: "Famous Forgiveness Quotes",
    description: "Wisdom from notable figures throughout history on forgiveness",
    category: "Inspiration",
    url: "https://www.forgiveness.world/famous-forgiveness-quotes"
  },
  {
    name: "Unenforceable Rules",
    description: "Learning to let go of expectations that create suffering",
    category: "Wisdom",
    url: "https://www.forgiveness.world/unenforceable-rules"
  },
  {
    name: "9 Steps to Forgiveness",
    description: "A comprehensive step-by-step guide to the forgiveness process",
    category: "Process",
    url: "https://www.forgiveness.world/9-steps-to-forgiveness"
  },
  {
    name: "Freedom From Bondage",
    description: "Breaking free from emotional chains that bind us",
    category: "Liberation",
    url: "https://www.forgiveness.world/freedom-from-bondage"
  },
  {
    name: "Drop The Rock",
    description: "Letting go of resentments that weigh us down",
    category: "Release",
    url: "https://www.forgiveness.world/drop-the-rock"
  },
  {
    name: "4 Phases of Forgiveness",
    description: "Understanding the natural progression of the forgiveness journey",
    category: "Process",
    url: "https://www.forgiveness.world/4-phases-of-forgiveness"
  },
  {
    name: "Acceptance Plaque",
    description: "A visual reminder of the power of acceptance in healing",
    category: "Tools",
    url: "https://www.forgiveness.world/acceptance-plaque"
  },
  {
    name: "Go not to the temple",
    description: "Finding the sacred space of forgiveness within yourself",
    category: "Spiritual",
    url: "https://www.forgiveness.world/go-not-to-temple"
  },
  {
    name: "The Choice To See",
    description: "Shifting perspective to see situations with compassion",
    category: "Perspective",
    url: "https://www.forgiveness.world/choice-to-see"
  }
];

export default function FreeResources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get user's access data for these resources
  const { data: accessData = [], isLoading } = useQuery({
    queryKey: ["/api/free-resources/access"],
    onError: (error: any) => {
      console.error("Error loading resource access data:", error);
    }
  });

  const trackAccessMutation = useMutation({
    mutationFn: async ({ resourceName, resourceUrl }: { resourceName: string; resourceUrl: string }) => {
      return apiRequest("POST", `/api/free-resources/access`, {
        resourceName,
        resourceUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/free-resources/access"] });
    },
  });

  const handleResourceAccess = async (resource: FreeResource) => {
    // Track the access
    trackAccessMutation.mutate({
      resourceName: resource.name,
      resourceUrl: resource.url
    });

    // Open the resource in a new tab
    window.open(resource.url, '_blank');
    
    toast({
      title: "Resource Accessed",
      description: `Opening ${resource.name} in a new tab`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Foundation': return <BookOpen className="w-4 h-4" />;
      case 'Inspiration': return <Quote className="w-4 h-4" />;
      case 'Techniques': return <Brain className="w-4 h-4" />;
      case 'Understanding': return <Eye className="w-4 h-4" />;
      case 'Wisdom': return <Star className="w-4 h-4" />;
      case 'Process': return <CheckCircle className="w-4 h-4" />;
      case 'Liberation': return <TreePine className="w-4 h-4" />;
      case 'Release': return <Heart className="w-4 h-4" />;
      case 'Tools': return <Shield className="w-4 h-4" />;
      case 'Spiritual': return <Award className="w-4 h-4" />;
      case 'Perspective': return <Clock className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  // Merge resources with access data
  const resourcesWithAccess = FORGIVENESS_RESOURCES.map(resource => {
    const access = accessData.find((a: any) => a.resourceName === resource.name);
    return {
      ...resource,
      accessed: !!access,
      accessCount: access?.accessCount || 0,
      lastAccessed: access?.lastAccessedAt || null
    };
  });

  // Filter resources
  const filteredResources = resourcesWithAccess.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...new Set(FORGIVENESS_RESOURCES.map(r => r.category))];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Journal': return 'bg-blue-100 text-blue-800';
      case 'Guide': return 'bg-purple-100 text-purple-800';
      case 'Affirmations': return 'bg-pink-100 text-pink-800';
      case 'Meditation': return 'bg-green-100 text-green-800';
      case 'Tracking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
        <NavigationHeader />
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
      <NavigationHeader />

      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="text-center">
          <TreePine className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Free Forgiveness Journey</h1>
          <p className="text-gray-600 mb-2">Abundant self-help resources from forgiveness.world</p>
          <Badge className="bg-green-600 text-white">13 Professional Resources</Badge>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="px-6 py-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Download className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-800">{FORGIVENESS_RESOURCES.length}</p>
              <p className="text-xs text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-800">
                {resourcesWithAccess.filter(r => r.accessed).length}
              </p>
              <p className="text-xs text-gray-600">Accessed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-gray-800">
                {resourcesWithAccess.reduce((sum, r) => sum + r.accessCount, 0)}
              </p>
              <p className="text-xs text-gray-600">Total Views</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources List */}
      <section className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Forgiveness Resources</h2>
          <Badge variant="outline">{filteredResources.length} resources</Badge>
        </div>
        
        {filteredResources.map((resource, index) => (
          <Card 
            key={index}
            className={`border transition-colors cursor-pointer hover:shadow-md ${
              resource.accessed ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
            onClick={() => handleResourceAccess(resource)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  resource.accessed ? 'bg-green-100' : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                }`}>
                  {getCategoryIcon(resource.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{resource.name}</h3>
                    {resource.accessed && (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {resource.accessed && resource.accessCount > 0 && (
                        <span>Views: {resource.accessCount}</span>
                      )}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredResources.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Matching Resources</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </section>

      <BottomNavigation />
    </div>
  );
}