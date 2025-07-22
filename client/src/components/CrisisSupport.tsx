import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, ExternalLink, Heart } from "lucide-react";

export default function CrisisSupport() {
  const crisisResources = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 crisis support"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "24/7 text support"
    },
    {
      name: "National Domestic Violence Hotline",
      phone: "1-800-799-7233",
      description: "24/7 support for domestic violence"
    }
  ];

  const handleCallCrisis = (phone: string) => {
    if (phone.startsWith("Text")) {
      // Open SMS app
      window.open(`sms:741741?body=HOME`, '_blank');
    } else {
      // Make phone call
      window.open(`tel:${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <section className="px-6 mb-8">
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Need Immediate Support?</h3>
              <p className="text-sm text-red-700">
                If you're experiencing a crisis, please reach out for help immediately.
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {crisisResources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{resource.name}</h4>
                  <p className="text-xs text-gray-600">{resource.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleCallCrisis(resource.phone)}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  {resource.phone}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
            <Heart className="w-4 h-4 text-red-600" />
            <span>
              Remember: You are not alone. Your life has value and meaning.
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
