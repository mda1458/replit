import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";
import PrivacyPolicyCheckbox from "@/components/PrivacyPolicyCheckbox";
import AIConsentModal from "@/components/AIConsentModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Star, 
  Brain, 
  BookOpen, 
  Headphones, 
  Users, 
  ArrowLeft 
} from "lucide-react";

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [aiConsentOpen, setAiConsentOpen] = useState(false);
  const [aiConsentAccepted, setAiConsentAccepted] = useState(false);

  const handleSubscribe = async (planType = 'monthly') => {
    if (!privacyAccepted) {
      toast({
        title: "Privacy Policy Required",
        description: "Please accept the Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!aiConsentAccepted) {
      setAiConsentOpen(true);
      return;
    }

    proceedWithSubscription(planType);
  };

  const handleAIConsent = () => {
    setAiConsentAccepted(true);
  };

  const proceedWithSubscription = async (planType = 'monthly') => {
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }
      
      // Here you would typically redirect to Stripe Checkout
      // For now, show success message
      toast({
        title: "Subscription Created",
        description: "Your Guided Journey subscription is being processed!",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Forgiveness Therapist",
      description: "24/7 personalized guidance through RELEASE methodology",
      premium: true
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Weekly Group Sessions",
      description: "Professional-led forgiveness support groups",
      premium: true
    },
    {
      icon: <Check className="w-5 h-5" />,
      title: "Complete RELEASE Journey",
      description: "Access to all 7 steps with guided exercises"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "Audio Meditation Library",
      description: "Professional guided meditation sessions",
      premium: true
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Advanced Journaling",
      description: "Unlimited entries with AI insights",
      premium: true
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Priority Support",
      description: "Direct access to professional therapists",
      premium: true
    }
  ];

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
      <NavigationHeader />

      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2 hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Guided Journey</h1>
            <p className="text-gray-600">AI-assisted forgiveness with professional support</p>
          </div>
        </div>
      </section>

      {/* Current Plan */}
      {user?.subscriptionStatus === 'active' && (
        <section className="p-6">
          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">You're Premium!</h2>
              <p className="text-gray-600 mb-4">
                You have access to all features and content
              </p>
              <Badge className="bg-accent text-white">Active Subscription</Badge>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Guided Journey Info */}
      <section className="px-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-800 mb-1">AI-Assisted Healing</h3>
            <p className="text-sm text-gray-600">
              Scientifically based RELEASE method with chatbot support and weekly professional groups.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Premium Features */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Guided Journey Features</h2>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${feature.premium ? 'bg-blue-500' : 'bg-primary/10'} rounded-full flex items-center justify-center ${feature.premium ? 'text-white' : 'text-primary'} mt-1`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Choose Your Plan</h2>
        
        <div className="space-y-4">
          {/* Annual Plan */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-white">Most Popular</Badge>
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Annual</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-3xl font-bold text-primary">$69.99</span>
                  <span className="text-sm text-gray-600">/year</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Save 45% • Just $5.83/month
                </p>
              </div>
              
              {/* Privacy and Consent Section */}
              <div className="space-y-3 mb-4">
                <PrivacyPolicyCheckbox
                  checked={privacyAccepted}
                  onCheckedChange={setPrivacyAccepted}
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 mb-1 font-medium">
                    AI Chatbot Consent Required
                  </p>
                  <p className="text-xs text-blue-700">
                    Guided Journey includes AI support. Consent will be requested before subscription.
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 mb-4"
                onClick={handleSubscribe}
                disabled={!privacyAccepted}
              >
                Start Guided Journey
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  7-day free trial, then $69.99/year
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Monthly</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-3xl font-bold text-secondary">$12.99</span>
                  <span className="text-sm text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Flexible monthly billing
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-secondary text-secondary hover:bg-secondary/10 mb-4"
                onClick={handleSubscribe}
                disabled={!privacyAccepted}
              >
                Start Guided Journey
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  7-day free trial, then $12.99/month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lifetime Plan */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Lifetime</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-3xl font-bold text-accent">$99.99</span>
                  <span className="text-sm text-gray-600">once</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  One-time payment, forever access
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent/10 mb-4"
                onClick={() => handleSubscribe('lifetime')}
                disabled={!privacyAccepted}
              >
                Get Lifetime Access
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  No trial needed • Immediate access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Consent Modal */}
      <AIConsentModal
        open={aiConsentOpen}
        onOpenChange={setAiConsentOpen}
        onConsent={handleAIConsent}
      />

      {/* Testimonials */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">What Our Users Say</h2>
        
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="ml-2 text-sm text-gray-600">5.0 stars</span>
            </div>
            <p className="text-gray-700 italic mb-2">
              "The premium features transformed my healing journey. The AI guidance and community support made all the difference."
            </p>
            <p className="text-sm text-gray-600">- Maria, verified premium user</p>
          </CardContent>
        </Card>
      </section>

      {/* Money Back Guarantee */}
      <section className="px-6 mb-8">
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-sm text-gray-600">
              If you're not completely satisfied, get a full refund within 30 days.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Fine Print */}
      <section className="px-6 pb-8">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime from your account settings.
          </p>
        </div>
      </section>
    </div>
  );
}
