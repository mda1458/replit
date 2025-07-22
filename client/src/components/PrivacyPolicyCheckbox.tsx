import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PrivacyPolicyCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}

export default function PrivacyPolicyCheckbox({ checked, onCheckedChange, required = true }: PrivacyPolicyCheckboxProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="privacy-policy"
        checked={checked}
        onCheckedChange={onCheckedChange}
        required={required}
        className="mt-1"
      />
      <Label htmlFor="privacy-policy" className="text-sm leading-5 cursor-pointer">
        I have read and agree to the{" "}
        <a
          href="https://www.termsfeed.com/live/2e6baffd-c346-4d4f-a654-e9271b052577"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Privacy Policy
        </a>
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    </div>
  );
}