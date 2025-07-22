import { Link, useLocation } from "wouter";
import { Home, BookOpen, Download, TrendingUp, User, Star, Bot, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Check subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isAuthenticated,
  });

  const isPremium = subscriptionStatus?.isPremium;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/free-resources", icon: Download, label: "Resources" },
    ...(isPremium ? [
      { path: "/ai-chat", icon: Bot, label: "AI Chat" },
      { path: "/group-sessions", icon: Users, label: "Groups" },
    ] : [
      { path: "/progress", icon: TrendingUp, label: "Progress" },
    ]),
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}