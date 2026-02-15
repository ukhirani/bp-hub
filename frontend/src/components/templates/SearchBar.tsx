import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search by template name or username..." }: SearchBarProps) {
  return (
    <div className="relative w-full  rounded-lg  ">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent  outline-none pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm rounded-lg"
      />
    </div>
  );
}
