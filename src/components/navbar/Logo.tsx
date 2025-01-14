import { Link } from "react-router-dom"

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/800dc37c-395b-470c-814b-1014271e967e.png" 
        alt="SightX Logo" 
        className="h-10 w-10 hover:opacity-80 transition-opacity"
      />
      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30">
        beta
      </span>
    </Link>
  )
}