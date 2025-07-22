import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Shield, Database, Users } from "lucide-react";

interface AIConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

export default function AIConsentModal({ open, onOpenChange, onConsent }: AIConsentModalProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleAccept = () => {
    if (consentChecked) {
      onConsent();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Chatbot Consent Form
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Introduction
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Welcome to the Forgiveness Journey AI Chatbot. This intelligent assistant is designed to provide 
                personalized guidance and support throughout your forgiveness and emotional healing journey. 
                Before you begin interacting with our AI chatbot, please read and understand this consent form.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Collection
              </h3>
              <p className="text-gray-700 mb-2">We collect the following information during your AI chatbot interactions:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Text messages and questions you send to the chatbot</li>
                <li>Conversation history and interaction patterns</li>
                <li>Usage metadata including timestamps and session duration</li>
                <li>Emotional wellness indicators and progress tracking data</li>
                <li>Voice recordings if you use voice-to-text features</li>
                <li>Device and browser information for technical optimization</li>
              </ul>
            </section>

            {/* Use of Data */}
            <section>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Use of Data
              </h3>
              <p className="text-gray-700 mb-2">Your data is used to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Provide personalized AI-guided forgiveness and healing support</li>
                <li>Improve the accuracy and relevance of chatbot responses</li>
                <li>Track your progress through the RELEASE methodology</li>
                <li>Generate insights and recommendations for your journey</li>
                <li>Enhance the overall AI chatbot experience and functionality</li>
                <li>Comply with legal obligations and ensure platform safety</li>
              </ul>
            </section>

            {/* Data Storage and Protection */}
            <section>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Data Storage and Protection
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>All data is encrypted in transit and at rest using industry-standard protocols</li>
                <li>Data is stored on secure servers with restricted access controls</li>
                <li>We implement regular security audits and monitoring</li>
                <li>Data retention policies ensure information is not kept longer than necessary</li>
                <li>Third-party AI providers (OpenAI) may process your data according to their privacy policies</li>
                <li>We do not sell or share your personal data with unauthorized parties</li>
              </ul>
            </section>

            {/* User Rights */}
            <section>
              <h3 className="font-semibold text-base mb-2">Your Rights</h3>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Access your personal data and conversation history</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Opt-out of AI chatbot services at any time</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>File complaints with relevant data protection authorities</li>
              </ul>
            </section>

            {/* Limitations and Disclaimers */}
            <section>
              <h3 className="font-semibold text-base mb-2">Important Limitations</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-gray-700 font-medium mb-2">Please understand these important limitations:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Not Professional Medical Advice:</strong> The AI chatbot is not a licensed therapist or medical professional</li>
                  <li><strong>Crisis Support:</strong> For mental health emergencies, contact crisis hotlines or emergency services immediately</li>
                  <li><strong>AI Limitations:</strong> Responses are generated by AI and may not always be accurate or appropriate</li>
                  <li><strong>Human Judgment Required:</strong> Always use your own judgment when following AI recommendations</li>
                  <li><strong>Supplementary Tool:</strong> The chatbot supplements but does not replace professional mental health care</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h3 className="font-semibold text-base mb-2">Third-Party AI Services</h3>
              <p className="text-gray-700">
                Our AI chatbot is powered by OpenAI's GPT-4 technology. Your interactions may be processed 
                by OpenAI according to their privacy policy and terms of service. We ensure that our use 
                of third-party AI services complies with privacy protection standards.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="font-semibold text-base mb-2">Contact Us</h3>
              <p className="text-gray-700">
                For questions about this consent form, data handling, or to exercise your rights, 
                please contact us through the app's support system or refer to our main Privacy Policy.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="border-t pt-4">
          <div className="flex items-start space-x-2 mb-4">
            <Checkbox
              id="ai-consent"
              checked={consentChecked}
              onCheckedChange={setConsentChecked}
              className="mt-1"
            />
            <Label htmlFor="ai-consent" className="text-sm leading-5 cursor-pointer">
              I have read and understood this AI Chatbot Consent Form. I agree to the collection, 
              use, and processing of my data as described above. I understand the limitations of 
              AI guidance and that this service is not a substitute for professional mental health care.
              <span className="text-red-500 ml-1">*</span>
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!consentChecked}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}