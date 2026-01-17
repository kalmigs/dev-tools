import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
      <div className="text-center space-y-2">
        <h1 className="text-8xl font-bold text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <ArrowLeftIcon />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
