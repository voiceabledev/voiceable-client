import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi, apiClient } from "@/lib/api";
// Lazy load Stripe to reduce initial bundle size
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = import("@stripe/stripe-js").then(({ loadStripe }) =>
      loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")
    );
  }
  return stripePromise;
};

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PaymentForm = ({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Validate postal code is provided and properly formatted (required by Stripe)
    const trimmedPostalCode = billingPostalCode.trim();
    if (!trimmedPostalCode || trimmedPostalCode.length === 0) {
      toast({
        title: "Postal code required",
        description: "Please enter your postal code to complete the payment.",
        variant: "destructive",
      });
      return;
    }

    // Validate postal code length (most postal codes are 3-10 characters)
    if (trimmedPostalCode.length < 3 || trimmedPostalCode.length > 10) {
      toast({
        title: "Invalid postal code",
        description: `Postal code must be between 3 and 10 characters. You entered ${trimmedPostalCode.length} character(s).`,
        variant: "destructive",
      });
      return;
    }

    // Log postal code validation
    console.log('Postal Code Validation:', {
      input: billingPostalCode,
      trimmed: trimmedPostalCode,
      length: trimmedPostalCode.length,
      country: billingCountry,
      isValidLength: trimmedPostalCode.length >= 3 && trimmedPostalCode.length <= 10,
    });

    setLoading(true);

    try {
      // Convert dollars to cents
      const amountCents = Math.round(amountNum * 100);

      // Create payment intent
      const intentResponse = await paymentsApi.createIntent({
        amount_cents: amountCents,
        currency: "usd",
      });

      if (!intentResponse.data) {
        throw new Error("Failed to create payment intent");
      }

      const { client_secret, payment_intent_id } = intentResponse.data;

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Prepare billing details - postal_code and country are required by Stripe
      // Ensure country is uppercase (ISO format) and postal code is trimmed
      const countryCode = (billingCountry || 'US').toUpperCase().trim();
      // For US, only send the 5-digit ZIP code (strip ZIP+4 extension)
      let postalCode = billingPostalCode.trim();
      if (countryCode === 'US' && postalCode.includes('-')) {
        postalCode = postalCode.split('-')[0]; // Only take the first 5 digits
      }

      // Validate postal code before sending
      if (!postalCode || postalCode.length === 0) {
        throw new Error("Postal code is required");
      }

      // Log postal code details for debugging
      console.log('Postal Code Debug:', {
        original: billingPostalCode,
        trimmed: postalCode,
        length: postalCode.length,
        country: countryCode,
        isValidFormat: postalCode.length >= 3 && postalCode.length <= 10,
      });

      // Basic postal code format validation by country
      if (countryCode === 'US') {
        const isZip5 = /^\d{5}$/.test(postalCode);
        const isZipPlus4 = /^\d{5}-\d{4}$/.test(postalCode);
        
        if (!isZip5 && !isZipPlus4) {
          console.warn('US ZIP code format warning:', postalCode, 'Expected: 5 digits (12345) or ZIP+4 format (12345-6789)');
        } else if (isZip5) {
          console.info('US ZIP code: 5-digit format detected. Some cards may require ZIP+4 format (9 digits).');
        }
      }

      // Build address object - only include postal_code and country (required by Stripe)
      // For test cards, sometimes including optional fields can cause validation issues
      type AddressType = {
        line1?: string;
        city?: string;
        state?: string;
        postal_code: string;
        country: string;
      };

      const address: AddressType = {
        postal_code: postalCode,
        country: countryCode,
      };

      // Only add optional fields if they're provided and not empty
      // Some card issuers are strict about address matching
      if (billingLine1 && billingLine1.trim()) {
        address.line1 = billingLine1.trim();
      }
      if (billingCity && billingCity.trim()) {
        address.city = billingCity.trim();
      }
      if (billingState && billingState.trim()) {
        address.state = billingState.trim();
      }

      // Build billing details object - minimal required fields
      type BillingDetailsType = {
        name?: string;
        address: AddressType;
      };

      const billingDetails: BillingDetailsType = {
        address: address,
      };

      if (billingName && billingName.trim()) {
        billingDetails.name = billingName.trim();
      }

      // Log what we're sending to Stripe for debugging
      console.log('Sending billing details to Stripe:', JSON.stringify(billingDetails, null, 2));
      console.log('Address being sent:', JSON.stringify(billingDetails.address, null, 2));

      // Confirm payment with Stripe - ensure billing_details with address is included
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails,
          },
        }
      );

      if (confirmError) {
        // Log full error details for debugging
        console.error('Stripe Payment Error:', {
          code: confirmError.code,
          type: confirmError.type,
          message: confirmError.message,
          decline_code: confirmError.decline_code,
          param: confirmError.param,
          payment_method: confirmError.payment_method,
          fullError: confirmError,
        });

        // Handle specific Stripe errors
        let errorMessage = confirmError.message || "Payment failed";
        
        // Check for postal code errors
        if (confirmError.code === 'incorrect_zip' || 
            confirmError.code === 'zip_code_invalid' ||
            confirmError.code === 'incomplete_zip' ||
            confirmError.param === 'payment_method[billing_details][address][postal_code]' ||
            (confirmError.type === 'card_error' || confirmError.type === 'validation_error') && 
             (errorMessage.toLowerCase().includes('zip') || 
              errorMessage.toLowerCase().includes('postal') ||
              errorMessage.toLowerCase().includes('postal code') ||
              errorMessage.toLowerCase().includes('incomplete') ||
              errorMessage.toLowerCase().includes('código postal'))) {
          
          console.error('Postal Code Error Details:', {
            postalCodeSent: postalCode,
            postalCodeLength: postalCode.length,
            countryCode: countryCode,
            errorCode: confirmError.code,
            errorType: confirmError.type,
            errorParam: confirmError.param,
            errorMessage: confirmError.message,
            isUSZip: countryCode === 'US' && /^\d{5}$/.test(postalCode),
            needsZipPlus4: countryCode === 'US' && postalCode.length === 5,
          });
          
          // Provide specific guidance based on error
          if (confirmError.code === 'incomplete_zip') {
            // This error means the card issuer requires more postal code information
            // It's a card-specific requirement, not necessarily a format issue
            errorMessage = `The postal code "${postalCode}" doesn't match your card's billing address. Please verify the exact postal code associated with your card, or try using a different payment method.`;
          } else {
            errorMessage = `The postal code "${postalCode}" is incorrect or incomplete. Please verify it exactly matches the postal code on your card's billing address.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!paymentIntent) {
        throw new Error("Payment intent not found");
      }

      // Get payment method ID - it can be a string or an object
      let paymentMethodId: string | undefined;
      if (paymentIntent.payment_method) {
        if (typeof paymentIntent.payment_method === 'string') {
          paymentMethodId = paymentIntent.payment_method;
        } else if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
          const pm = paymentIntent.payment_method as { id?: string };
          paymentMethodId = pm.id;
        }
      }

      // Confirm payment on backend
      const confirmResponse = await paymentsApi.confirm({
        payment_intent_id: payment_intent_id,
        payment_method_id: paymentMethodId,
        amount_cents: amountCents.toString(),
        save_payment_method: savingPaymentMethod,
      });

      if (confirmResponse.data) {
        toast({
          title: "Payment successful",
          description: `Payment of $${amountNum.toFixed(2)} processed successfully.`,
        });
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      
      // Check if it's an authentication error
      if (errorMessage.includes("401") || errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
        toast({
          title: "Authentication required",
          description: "Please sign in to process payments. If you're already signed in, please try signing out and back in.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("postal") || 
                 errorMessage.toLowerCase().includes("zip") ||
                 errorMessage.toLowerCase().includes("incomplete")) {
        // Postal code specific error
        console.error('Postal code error caught in catch block:', errorMessage);
        toast({
          title: "Postal Code Error",
          description: errorMessage,
          variant: "destructive",
        });
        // Focus on postal code field
        setTimeout(() => {
          const postalCodeInput = document.getElementById("billingPostalCode");
          if (postalCodeInput) {
            postalCodeInput.focus();
            postalCodeInput.scrollIntoView({ behavior: "smooth", block: "center" });
            // Highlight the field
            postalCodeInput.classList.add("border-destructive", "ring-2", "ring-destructive");
          }
        }, 100);
      } else {
        toast({
          title: "Payment failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 bg-secondary/50 border-border"
            placeholder="0.00"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <p className="text-xs text-muted-foreground">Enter your card number, expiration date, and CVC</p>
        <div className="p-3 bg-secondary/50 border border-border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "var(--foreground)",
                  "::placeholder": {
                    color: "var(--muted-foreground)",
                  },
                },
                invalid: {
                  color: "var(--destructive)",
                },
              },
              hidePostalCode: true, // We're handling postal code in billing_details
            }}
          />
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-border">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Billing Address</Label>
          <p className="text-xs text-muted-foreground">Required for payment processing</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingName">Full Name</Label>
          <Input
            id="billingName"
            type="text"
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            className="bg-secondary/50 border-border"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingLine1">Address Line 1</Label>
          <Input
            id="billingLine1"
            type="text"
            value={billingLine1}
            onChange={(e) => setBillingLine1(e.target.value)}
            className="bg-secondary/50 border-border"
            placeholder="123 Main Street"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="billingCity">City</Label>
            <Input
              id="billingCity"
              type="text"
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="New York"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingState">State</Label>
            <Input
              id="billingState"
              type="text"
              value={billingState}
              onChange={(e) => setBillingState(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="NY"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="billingPostalCode">Postal Code *</Label>
            <Input
              id="billingPostalCode"
              type="text"
              value={billingPostalCode}
              onChange={(e) => {
                let value = e.target.value;
                // For US, allow ZIP+4 format (12345-6789)
                if (billingCountry === "US") {
                  // Remove all non-digits first
                  value = value.replace(/\D/g, '');
                  // Add hyphen after 5 digits if more digits follow
                  if (value.length > 5) {
                    value = value.slice(0, 5) + '-' + value.slice(5, 9);
                  }
                } else {
                  // For other countries, remove spaces and convert to uppercase
                  value = value.replace(/\s/g, '').toUpperCase();
                }
                setBillingPostalCode(value);
              }}
              className="bg-secondary/50 border-border"
              placeholder={billingCountry === "US" ? "12345 or 12345-6789" : "SW1A 1AA"}
              required
              disabled={loading}
              maxLength={billingCountry === "US" ? 10 : 10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              type="text"
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="US"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="savePaymentMethod"
          checked={savingPaymentMethod}
          onChange={(e) => setSavingPaymentMethod(e.target.checked)}
          className="rounded border-border"
          disabled={loading}
        />
        <Label
          htmlFor="savePaymentMethod"
          className="text-sm font-normal cursor-pointer"
        >
          Save payment method for future use
        </Label>
      </div>
      </div>

      <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-background flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={loading || !stripe}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${amount || "0.00"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export function PaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: PaymentMethodModalProps) {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration Error</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>Stripe publishable key is not configured.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-xl">Add Payment Method</DialogTitle>
        </DialogHeader>

        <Elements stripe={getStripePromise()}>
          <PaymentForm
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
