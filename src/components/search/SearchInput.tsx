import { CommandInput } from "@/components/ui/command";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <CommandInput
      value={value}
      onValueChange={onChange}
      placeholder={placeholder ?? "Search resources, pages, actions…"}
    />
  );
}
