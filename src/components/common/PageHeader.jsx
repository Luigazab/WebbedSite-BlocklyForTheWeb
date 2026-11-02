import { Button } from "@/components/ui/button"

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}