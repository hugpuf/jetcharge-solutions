import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SiteType } from "@/lib/assumptions";
import { Estimate } from "@/lib/estimate";

interface ContactData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface CalculatorState {
  siteType: SiteType | null;
  acCount: number;
  dcCount: number;
  isUnderground: boolean;
  runFactor: number;
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  calculatorState: CalculatorState;
  estimate: Estimate;
}

const STORAGE_KEY = "ev-calculator-contact";

export default function ContactModal({ open, onClose, calculatorState, estimate }: ContactModalProps) {
  const [formData, setFormData] = useState<ContactData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: ""
  });
  
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved contact data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
      } catch (e) {
        console.warn("Failed to parse saved contact data");
      }
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 20;
  };

  const validateField = (name: keyof ContactData, value: string): string | null => {
    if (!value.trim()) {
      return "This field is required";
    }

    if (name === "email" && !validateEmail(value)) {
      return "Please enter a valid email address";
    }

    if (name === "phone" && !validatePhone(value)) {
      return "Please enter a valid phone number (7-20 digits)";
    }

    return null;
  };

  const handleInputChange = (name: keyof ContactData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInputBlur = (name: keyof ContactData, value: string) => {
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid = (): boolean => {
    const requiredFields: (keyof ContactData)[] = ['first_name', 'last_name', 'phone', 'email'];
    
    // Check if all fields are filled
    const allFieldsFilled = requiredFields.every(field => formData[field].trim());
    
    // Check if there are no validation errors
    const noErrors = Object.keys(errors).length === 0;
    
    // Validate all fields to ensure they pass validation
    const allValid = requiredFields.every(field => !validateField(field, formData[field]));
    
    return allFieldsFilled && noErrors && allValid;
  };

  const handleSubmit = async () => {
    // Validate all fields before submit
    const newErrors: Partial<ContactData> = {};
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof ContactData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!calculatorState.siteType) {
      toast({
        title: "Configuration Required",
        description: "Please select a site type before requesting a price breakdown.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user: formData,
      calculator: {
        siteType: calculatorState.siteType,
        acCount: calculatorState.acCount,
        dcCount: calculatorState.dcCount,
        isUnderground: calculatorState.isUnderground,
        runFactor: calculatorState.runFactor
      },
      estimate,
      meta: {
        currency: 'AUD',
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    };

    try {
      // TODO: This requires backend integration with Supabase
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save contact data to localStorage for future prefill
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      
      // Close modal and show success toast
      onClose();
      toast({
        title: "Estimate sent!",
        description: `Price breakdown has been sent to ${formData.email}`,
      });
      
      console.log("Lead submission payload:", payload);
      
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
      console.error("Lead submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-chrome-white border-steel-200 shadow-large p-0"
        aria-describedby="contact-modal-description"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-medium text-steel-600 text-center">
            Get Your Price Breakdown
          </DialogTitle>
          <p id="contact-modal-description" className="text-sm text-steel-400 text-center mt-2">
            Enter your details to receive a detailed estimate
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium text-steel-600">
              First Name *
            </Label>
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              className="input-pill h-11"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              onBlur={(e) => handleInputBlur('first_name', e.target.value)}
              placeholder="Enter your first name"
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-steel-600">
              Last Name *
            </Label>
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              className="input-pill h-11"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              onBlur={(e) => handleInputBlur('last_name', e.target.value)}
              placeholder="Enter your last name"
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-steel-600">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="input-pill h-11"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={(e) => handleInputBlur('phone', e.target.value)}
              placeholder="+61 XXX XXX XXX"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-steel-600">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="input-pill h-11"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={(e) => handleInputBlur('email', e.target.value)}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-chrome-white border-t border-steel-200 p-6 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-warm-orange to-warm-amber text-chrome-white font-medium text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending estimate...
              </>
            ) : (
              "Send price estimate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}