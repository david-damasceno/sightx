
import { Check, FileUp, Grid, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessStep {
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
}

interface ProcessStepsProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function ProcessSteps({ currentStep, onStepClick }: ProcessStepsProps) {
  const steps: ProcessStep[] = [
    {
      title: "Upload de Dados",
      description: "Faça upload do seu arquivo",
      icon: <FileUp className="h-6 w-6" />,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      title: "Mapeamento",
      description: "Configure suas colunas",
      icon: <Grid className="h-6 w-6" />,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      title: "Análise",
      description: "Visualize insights",
      icon: <Microscope className="h-6 w-6" />,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    }
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.title}
            className={cn(
              "flex flex-col items-center space-y-2 relative cursor-pointer transition-all",
              "w-1/3 px-4",
              step.status === 'completed' && "text-green-500",
              step.status === 'active' && "text-primary",
              step.status === 'pending' && "text-muted-foreground"
            )}
            onClick={() => onStepClick?.(index + 1)}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "transition-colors duration-200",
              step.status === 'completed' && "bg-green-100 dark:bg-green-900",
              step.status === 'active' && "bg-primary/20",
              step.status === 'pending' && "bg-muted"
            )}>
              {step.status === 'completed' ? <Check className="h-6 w-6" /> : step.icon}
            </div>
            
            <div className="text-center">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>

            {index < steps.length - 1 && (
              <div className={cn(
                "absolute top-6 left-[60%] w-[calc(100%-60%)] h-[2px]",
                step.status === 'completed' ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
