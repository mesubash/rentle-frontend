import type { ChangeEvent, InputHTMLAttributes } from "react";
import { NEPAL_COUNTRY_CODE, toNepalLocalPhone } from "@/lib/phone";

type NepalPhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "maxLength">;

export function NepalPhoneInput({ onChange, defaultValue, ...props }: NepalPhoneInputProps) {
  function sanitize(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = toNepalLocalPhone(event.currentTarget.value);
    onChange?.(event);
  }

  return (
    <div className="phone-input">
      <span aria-label="Nepal country code">{NEPAL_COUNTRY_CODE}</span>
      <input
        {...props}
        type="tel"
        inputMode="numeric"
        maxLength={14}
        defaultValue={defaultValue == null ? undefined : toNepalLocalPhone(String(defaultValue))}
        onChange={sanitize}
      />
    </div>
  );
}
