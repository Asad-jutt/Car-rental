"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cva } from "class-variance-authority"

export interface MultiStepFormProps {
  currentStep: number
  totalSteps: number
  title: string
  description?: string
  onBack?: () => void
  onNext?: () => void
  onClose?: () => void
  backButtonText?: string
  nextButtonText?: string
  nextDisabled?: boolean
  footerContent?: React.ReactNode
  children: React.ReactNode
}

const titleVariants = cva("font-headline tracking-tight text-2xl")

export default function MultiStepForm({
  currentStep,
  totalSteps,
  title,
  description,
  onBack,
  onNext,
  onClose,
  backButtonText = "BACK",
  nextButtonText = "NEXT",
  nextDisabled = false,
  footerContent,
  children,
}: MultiStepFormProps) {
  const progressValue = (currentStep / totalSteps) * 100

  return (
    <Card className="w-full max-w-[700px] border-border p-0 shadow-md">
      <CardHeader className="relative flex w-full flex-col space-y-0 bg-secondary/50 pb-0 pt-6 text-center">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:text-foreground sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <CardTitle className={cn(titleVariants(), "px-6")}>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <div className="mt-2 w-full">
          <Progress value={progressValue} className="h-1.5 rounded-full bg-border" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-4 sm:p-6">
        <div key={currentStep} className="kinetic-step-in">
          {children}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-3 p-4 pt-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pt-0">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={onBack} disabled={!onBack || currentStep === 1} className="w-full sm:w-auto">
            {backButtonText}
          </Button>
          <Button onClick={onNext} disabled={!onNext || nextDisabled} className="w-full sm:w-auto">{currentStep === totalSteps ? nextButtonText : "NEXT"}</Button>
        </div>
        {footerContent}
      </CardFooter>
    </Card>
  )
}