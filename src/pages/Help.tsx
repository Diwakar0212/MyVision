import { ArrowLeft, HelpCircle, Book, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import VoiceAssistant from "@/components/VoiceAssistant";

const Help = () => {
  const faqs = [
    {
      question: "How do I use Live Detection?",
      answer: "Navigate to the Dashboard and click on 'Live Detection'. Grant camera permissions when prompted. The AI will analyze your camera feed in real-time and provide audio descriptions of what it detects.",
    },
    {
      question: "What file formats are supported for upload?",
      answer: "MyVision supports common image formats (JPEG, PNG, GIF, WebP) and video formats (MP4, MOV, AVI). Maximum file size is 50MB.",
    },
    {
      question: "How do I activate voice mode?",
      answer: "Say 'Hey Vision' to activate voice mode. You can then use voice commands like 'What do you see?', 'Read this text', or 'Describe the scene'.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all data is encrypted and processed securely. We don't store your images or videos unless you explicitly save them to your history. Read our Privacy Policy for more details.",
    },
    {
      question: "Can I use MyVision offline?",
      answer: "Some basic features work offline, but most AI analysis requires an internet connection for optimal performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Help Center. Get answers to frequently asked questions about using Live Detection, uploading files, and voice mode. Contact support for assistance." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Help Center</h1>
            <p className="text-xl text-muted-foreground">Get answers and support</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:border-primary smooth-transition cursor-pointer">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center mx-auto">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold">Documentation</h3>
              <p className="text-sm text-muted-foreground">Detailed guides and tutorials</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:border-primary smooth-transition cursor-pointer">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center mx-auto">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:border-primary smooth-transition cursor-pointer">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@myvision.ai</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
                    <AccordionTrigger className="text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Still need help?</h3>
            <p className="text-muted-foreground">Our support team is here to assist you</p>
            <Button className="bg-primary hover:bg-primary/90">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
