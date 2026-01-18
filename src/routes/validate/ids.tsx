import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/validate/ids')({
  component: ValidateIdsPage,
})

function ValidateIdsPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Validate IDs</h1>
        <p className="text-muted-foreground">
          Coming soon — validate UUIDs, CUIDs, and other ID formats
        </p>
      </div>
    </div>
  )
}
