import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import LanguageSelector from "./LanguageSelector";
import logoImage from "@assets/Yellow Brick Road_1752853068713.jpeg";
import { 
  Menu, 
  Home,
  BookOpen,
  Users,
  Bot,
  Mic,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  HeadphonesIcon,
  Download,
  Star,
  Calendar,
  TrendingUp,
  Heart,
  MessageSquare
} from "lucide-react";

export default function NavigationHeader() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      section: "Journey",
      items: [
        { icon: Home, label: "Home", href: "/", premium: false },
        { icon: BookOpen, label: "Journal", href: "/journal", premium: false },
        { icon: BarChart3, label: "Progress", href: "/progress", premium: false },
        { icon: HeadphonesIcon, label: "Audio", href: "/audio", premium: false },
        { icon: Download, label: "Free Resources", href: "/free-resources", premium: false },
      ]
    },
    {
      section: "AI & Voice",
      items: [
        { icon: Bot, label: "AI Companion", href: "/ai-companion", premium: true },
        { icon: Mic, label: "Voice Journal", href: "/voice-journal", premium: false },
        { icon: MessageSquare, label: "AI Chat", href: "/ai-chat", premium: true },
      ]
    },
    {
      section: "Community",
      items: [
        { icon: Users, label: "Community", href: "/community", premium: false },
        { icon: Calendar, label: "Group Sessions", href: "/group-sessions", premium: true },
        { icon: TrendingUp, label: "Analytics", href: "/analytics", premium: false },
      ]
    },
    {
      section: "Account",
      items: [
        { icon: Bell, label: "Notifications", href: "/notifications", premium: false },
        { icon: Star, label: "Ratings", href: "/ratings", premium: false },
        { icon: User, label: "Profile", href: "/profile", premium: false },
      ]
    }
  ];

  const isCurrentPage = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-sm mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Yellow Brick Road" 
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                Forgiveness Journey
              </span>
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            
            {isAuthenticated && (
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {/* Notification badge would go here */}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <img 
                      src={logoImage} 
                      alt="Yellow Brick Road" 
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span>Navigation</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* User Info */}
                  {isAuthenticated && user && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName || 'User'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          {user.isPremium && (
                            <Badge className="text-xs mt-1">Premium</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Sections */}
                  {navigationItems.map((section) => (
                    <div key={section.section}>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                        {section.section}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const IconComponent = item.icon;
                          const isPremiumFeature = item.premium && !user?.isPremium;
                          
                          return (
                            <Link 
                              key={item.href} 
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                            >
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${
                                  isCurrentPage(item.href) 
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20' 
                                    : ''
                                } ${isPremiumFeature ? 'opacity-50' : ''}`}
                                disabled={isPremiumFeature}
                              >
                                <IconComponent className="h-4 w-4 mr-3" />
                                {item.label}
                                {isPremiumFeature && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Logout */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  )}

                  {/* Login */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Button
                        className="w-full"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        {t('nav.login')}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}