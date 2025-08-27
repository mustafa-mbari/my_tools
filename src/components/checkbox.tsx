export const Checkbox = ({ checked, onChange, id, className = '' }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  className?: string;
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className={`h-5 w-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
  />
);