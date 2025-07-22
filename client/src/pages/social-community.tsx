import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Plus,
  Trophy,
  Calendar,
  Sparkles,
  Users,
  TrendingUp,
  Hash,
  Smile,
  Send,
  Filter,
  BookOpen,
  Star
} from "lucide-react";

interface CommunityPost {
  id: number;
  content: string;
  milestone?: string;
  isAnonymous: boolean;
  authorName?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
}

interface Comment {
  id: number;
  content: string;
  authorName?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function SocialCommunity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newComment, setNewComment] = useState('');

  // Get community posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/community/posts', filterTag],
  });

  // Get trending tags
  const { data: trendingTags = [] } = useQuery({
    queryKey: ['/api/community/trending-tags'],
  });

  // Get comments for selected post
  const { data: comments = [] } = useQuery({
    queryKey: ['/api/community/posts', selectedPost?.id, 'comments'],
    enabled: !!selectedPost,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/community/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your story has been shared with the community!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      setNewPostContent('');
      setSelectedTags([]);
      setSelectedMilestone('');
      setShowCreatePost(false);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/comments`, {
        content,
        isAnonymous
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your support has been shared!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      setNewComment('');
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    createPostMutation.mutate({
      content: newPostContent,
      milestone: selectedMilestone || null,
      isAnonymous,
      tags: selectedTags
    });
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;
    
    addCommentMutation.mutate({
      postId: selectedPost.id,
      content: newComment
    });
  };

  const milestoneOptions = [
    { value: 'step_completed', label: 'Completed a RELEASE step', emoji: '🎯' },
    { value: 'breakthrough', label: 'Had a breakthrough moment', emoji: '💡' },
    { value: 'anniversary', label: 'Journey anniversary', emoji: '🎊' },
    { value: 'first_session', label: 'Attended first group session', emoji: '👥' },
    { value: 'forgiveness_moment', label: 'Moment of forgiveness', emoji: '💝' },
    { value: 'self_compassion', label: 'Practiced self-compassion', emoji: '🌱' }
  ];

  const popularTags = [
    '#forgiveness', '#healing', '#breakthrough', '#gratitude', 
    '#selfcompassion', '#release', '#growth', '#community', 
    '#hope', '#transformation', '#journey', '#strength'
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community Stories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your journey and support others on their path to healing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Button */}
            <Card>
              <CardContent className="p-4">
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Share Your Story
                </Button>
              </CardContent>
            </Card>

            {/* Filter Tabs */}
            <Tabs value={filterTag} onValueChange={setFilterTag}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Stories</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
              </TabsList>

              <TabsContent value={filterTag} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post: CommunityPost) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {post.isAnonymous ? 'Anonymous Traveler' : post.authorName}
                              </p>
                              <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          {post.milestone && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Milestone
                            </Badge>
                          )}
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={`gap-2 ${post.isLiked ? 'text-red-600' : ''}`}
                            >
                              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likesCount}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPost(post)}
                              className="gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {post.commentsCount}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        No Stories Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Be the first to share your forgiveness journey story!
                      </p>
                      <Button onClick={() => setShowCreatePost(true)}>
                        Share Your Story
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stories Shared</span>
                  <span className="font-bold text-blue-600">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hearts Given</span>
                  <span className="font-bold text-red-600">1,389</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Support Comments</span>
                  <span className="font-bold text-green-600">856</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Members</span>
                  <span className="font-bold text-purple-600">124</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setFilterTag(tag)}
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">
                      Gratitude Week
                    </h4>
                    <p className="text-sm text-purple-600">
                      Share one thing you're grateful for in your forgiveness journey
                    </p>
                  </div>
                  <Button size="sm" className="w-full">
                    Join Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Your Story</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Milestone Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Celebrating a milestone?</label>
                <select 
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a milestone (optional)</option>
                  {milestoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your story</label>
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts, breakthrough moments, or words of encouragement..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Add tags (optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {popularTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <label htmlFor="anonymous" className="text-sm">
                  Share anonymously
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending || !newPostContent.trim()}
                >
                  {createPostMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Share Story
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comments & Support</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                {/* Original Post */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{selectedPost.content}</p>
                </div>

                {/* Comments */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.isAnonymous ? 'Anonymous Supporter' : comment.authorName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add words of support..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="commentAnonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <label htmlFor="commentAnonymous" className="text-xs text-gray-600">
                      Comment anonymously
                    </label>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}