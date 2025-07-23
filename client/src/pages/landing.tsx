import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrivacyPolicyCheckbox from "@/components/PrivacyPolicyCheckbox";
import { Heart, ArrowRight, Star, Shield, Users, Download, Crown } from "lucide-react";
// Using SVG logo instead of image file for Docker compatibility
const logoImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23f59e0b'/%3E%3Cpath d='M30 60 Q50 30 70 60 Q50 50 30 60' fill='%23fbbf24'/%3E%3C/svg%3E";

export default function Landing() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleGetStarted = () => {
    if (!privacyAccepted) {
      alert("Please accept the Privacy Policy to continue.");
      return;
    }
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="responsive-container">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-secondary p-6 lg:p-8 text-white text-center lg:rounded-t-3xl">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={logoImage} 
              alt="Forgiveness Journey Logo" 
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded-lg bg-white/10 p-1"
            />
            <h1 className="text-2xl lg:text-4xl font-bold">Forgiveness Journey</h1>
          </div>
          <p className="text-white/90 text-base lg:text-lg">Heal your heart through guided forgiveness</p>
        </header>

        {/* Hero Section */}
        <section className="p-6 lg:p-8 text-center lg:col-span-2">
          <div className="relative h-48 lg:h-64 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src={logoImage} 
                  alt="Forgiveness Journey Logo" 
                  className="w-20 h-20 lg:w-32 lg:h-32 object-contain mx-auto rounded-2xl bg-white/80 p-2 shadow-lg"
                />
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-2">Two Paths to Emotional Freedom</h2>
              <p className="text-lg lg:text-xl text-gray-600">Choose Your Forgiveness Journey</p>
            </div>
          </div>
          
          <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-gray-800">
            Start Your Healing Today
          </h3>
          <p className="text-gray-600 lg:text-lg mb-6 max-w-3xl mx-auto">
            Free DIY resources from forgiveness.world or AI-assisted guidance with professional support
          </p>
        </section>

        {/* Tier Options */}
        <section className="px-6 lg:px-8 mb-8 lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            <Card className="border-l-4 border-l-green-500 bg-green-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-800 text-base lg:text-lg">Free Forgiveness Journey</h4>
                    <p className="text-sm lg:text-base text-green-700 mt-1">Abundant self-help resources for DIY healing</p>
                    <p className="text-xs lg:text-sm text-green-600 mt-2">Access professional resources from www.forgiveness.world</p>
                  </div>
                  <Badge className="bg-green-600 text-white text-xs lg:text-sm flex-shrink-0">FREE</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 bg-amber-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-amber-800 text-base lg:text-lg">Guided Forgiveness Journey</h4>
                    <p className="text-sm lg:text-base text-amber-700 mt-1">AI-assisted RELEASE method with chatbot support</p>
                    <p className="text-xs lg:text-sm text-amber-600 mt-2">Weekly professional groups & latest research</p>
                  </div>
                  <Badge className="bg-amber-600 text-white text-xs lg:text-sm flex-shrink-0">PREMIUM</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Code Name Privacy</h4>
                    <p className="text-sm text-gray-600">Complete confidentiality with code names</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">What Others Say</h3>
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
                "This app changed my life. The RELEASE method helped me let go of years of resentment."
              </p>
              <p className="text-sm text-gray-600">- Sarah, verified user</p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="px-6 mb-8">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Begin?</h3>
              <p className="text-white/90 mb-4">
                Start your forgiveness journey with our free introductory module
              </p>
              
              <div className="mb-4">
                <PrivacyPolicyCheckbox
                  checked={privacyAccepted}
                  onCheckedChange={setPrivacyAccepted}
                />
              </div>
              
              <Button 
                onClick={handleGetStarted}
                disabled={!privacyAccepted}
                className="w-full bg-white text-primary hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-white/80 mt-2">
                No credit card required
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="px-6 pb-8 text-center">
          <p className="text-sm text-gray-600">
            Join thousands on their healing journey
          </p>
        </footer>
      </div>
    </div>
  );
}
