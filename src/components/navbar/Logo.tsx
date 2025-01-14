import { Link } from "react-router-dom"

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/800dc37c-395b-470c-814b-1014271e967e.png" 
        alt="SightX Logo" 
        className="h-10 w-10 hover:opacity-80 transition-opacity"
      />
      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-600 rounded-full border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30">
        beta
      </span>
    </Link>
  )
}