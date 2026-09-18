"use client"

import { AnimatePresence, motion } from "framer-motion"
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
  footerContent,
  children,
}: MultiStepFormProps) {
  const progressValue = (currentStep / totalSteps) * 100

  return (
    <Card className="w-full max-w-[700px] border-border p-0 shadow-md">
      <CardHeader className="flex w-full flex-col space-y-0 bg-secondary/50 pb-0 pt-6 text-center">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <CardTitle className={cn(titleVariants())}>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <div className="mt-2 w-full">
          <Progress value={progressValue} className="h-1.5 rounded-full bg-border" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack} disabled={!onBack || currentStep === 1}>
          {backButtonText}
        </Button>
        {footerContent}
        <Button onClick={onNext} disabled={!onNext}>{currentStep === totalSteps ? nextButtonText : "NEXT"}</Button>
      </CardFooter>
    </Card>
  )
}