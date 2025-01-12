import { Link } from "react-router-dom"

export function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/lovable-uploads/800dc37c-395b-470c-814b-1014271e967e.png" 
        alt="SightX Logo" 
        className="h-10 w-10 hover:opacity-80 transition-opacity"
      />
    </Link>
  )
}