import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Award,
  ArrowLeft
} from "lucide-react";

interface Facilitator {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  specialties?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FacilitatorFormData {
  name: string;
  email: string;
  bio: string;
  specialties: string[];
}

export default function AdminFacilitators() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFacilitator, setEditingFacilitator] = useState<Facilitator | null>(null);
  const [formData, setFormData] = useState<FacilitatorFormData>({
    name: "",
    email: "",
    bio: "",
    specialties: []
  });
  const [specialtyInput, setSpecialtyInput] = useState("");

  // Get all facilitators
  const { data: facilitators = [], isLoading } = useQuery({
    queryKey: ['/api/admin/facilitators'],
  });

  // Create facilitator mutation
  const createFacilitatorMutation = useMutation({
    mutationFn: async (data: FacilitatorFormData) => {
      const response = await apiRequest('POST', '/api/admin/facilitators', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Facilitator Created",
        description: "New facilitator has been added successfully.",
      });
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/facilitators'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create facilitator. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update facilitator mutation
  const updateFacilitatorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FacilitatorFormData> }) => {
      const response = await apiRequest('PATCH', `/api/admin/facilitators/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Facilitator Updated",
        description: "Facilitator information has been updated successfully.",
      });
      setEditingFacilitator(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/facilitators'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update facilitator. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete facilitator mutation
  const deleteFacilitatorMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/facilitators/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Facilitator Removed",
        description: "Facilitator has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/facilitators'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove facilitator. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      bio: "",
      specialties: []
    });
    setSpecialtyInput("");
  };

  const handleEdit = (facilitator: Facilitator) => {
    setEditingFacilitator(facilitator);
    setFormData({
      name: facilitator.name,
      email: facilitator.email || "",
      bio: facilitator.bio || "",
      specialties: facilitator.specialties || []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFacilitator) {
      updateFacilitatorMutation.mutate({ id: editingFacilitator.id, data: formData });
    } else {
      createFacilitatorMutation.mutate(formData);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && formData.specialties && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialtyInput.trim()]
      });
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: (formData.specialties || []).filter(s => s !== specialty)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Facilitator Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage facilitators for group sessions
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facilitator
          </Button>
        </div>

        {/* Facilitators List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : facilitators && facilitators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilitators.map((facilitator: Facilitator) => (
              <Card key={facilitator.id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{facilitator.name}</CardTitle>
                      {facilitator.email && (
                        <div className="flex items-center gap-2 mt-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-muted-foreground">{facilitator.email}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={facilitator.isActive ? 'default' : 'secondary'}>
                      {facilitator.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {facilitator.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {facilitator.bio}
                    </p>
                  )}
                  
                  {facilitator.specialties && Array.isArray(facilitator.specialties) && facilitator.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Specialties</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {facilitator.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {facilitator.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{facilitator.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Added {new Date(facilitator.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(facilitator)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFacilitatorMutation.mutate(facilitator.id)}
                        disabled={deleteFacilitatorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Facilitators Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first facilitator to start managing group sessions.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Facilitator
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Facilitator Dialog */}
        <Dialog open={showCreateDialog || editingFacilitator !== null} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingFacilitator(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFacilitator ? "Edit Facilitator" : "Add New Facilitator"}
              </DialogTitle>
              <DialogDescription>
                {editingFacilitator ? "Update the facilitator information below." : "Add a new facilitator to manage group sessions."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dr. Sarah Johnson"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="facilitator@forgiveness.world"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe the facilitator's background, credentials, and approach..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <div className="flex gap-2">
                  <Input
                    id="specialties"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Trauma-Informed Care, Meditation, etc."
                  />
                  <Button type="button" onClick={addSpecialty} disabled={!specialtyInput.trim()}>
                    Add
                  </Button>
                </div>
                {formData.specialties && formData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:bg-gray-500 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingFacilitator(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFacilitatorMutation.isPending || updateFacilitatorMutation.isPending}
                >
                  {createFacilitatorMutation.isPending || updateFacilitatorMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : null}
                  {editingFacilitator ? "Update Facilitator" : "Add Facilitator"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}