import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import CrisisSupport from "@/components/CrisisSupport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Crown, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell, 
  Moon, 
  Globe,
  Heart,
  LogOut
} from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleNotImplemented = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available in a future update.`,
    });
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
      <section className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        </div>
        <p className="text-gray-600">Manage your account and preferences</p>
      </section>

      {/* User Info */}
      <section className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'User'
                  }
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={user?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {user?.subscriptionStatus === 'active' ? 'Guided' : 'Free DIY'}
                  </Badge>
                  {user?.subscriptionStatus === 'active' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-accent" />
              <span>Member since {new Date(user?.createdAt || '').toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Subscription Status */}
      {user?.subscriptionStatus !== 'active' && (
        <section className="px-6 mb-6">
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Crown className="w-6 h-6 text-secondary" />
                <h3 className="font-semibold text-gray-800">Get Guided Journey</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Unlock all 7 RELEASE steps, AI guidance, and exclusive content
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.location.href = '/subscribe'}
              >
                Get Guided Journey
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Settings */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        
        <div className="space-y-3">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Account Settings</h3>
                  <p className="text-sm text-gray-600">Manage your personal information</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  <p className="text-sm text-gray-600">Daily reminders and progress updates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleNotImplemented('Dark mode')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Dark Mode</h3>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleNotImplemented('Language settings')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Language</h3>
                  <p className="text-sm text-gray-600">English (US)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Support</h2>
        
        <div className="space-y-3">
          <Card 
            className="hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleNotImplemented('Help center')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Help Center</h3>
                  <p className="text-sm text-gray-600">FAQs and guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleNotImplemented('Privacy policy')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Privacy Policy</h3>
                  <p className="text-sm text-gray-600">How we protect your data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Crisis Support */}
      <CrisisSupport />

      {/* Logout */}
      <section className="px-6 mb-6">
        <Button 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </section>

      <BottomNavigation />
    </div>
  );
}
