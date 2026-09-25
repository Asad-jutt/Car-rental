"use client"

import * as React from "react"
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Globe,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import MultiStepForm from "./ui/multi-step-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { Alert, AlertDescription } from "./ui/alert"
import { Card, CardContent } from "./ui/card"
import { VEHICLES, HUBS } from "../data/fleetData"

const INSURANCE_TIERS = [
  { id: "essential", name: "ESSENTIAL", pricePer24h: 24, note: "BASIC LIABILITY // THEFT EXCESS $2,500" },
  { id: "shield", name: "SHIELD", pricePer24h: 49, note: "ZERO-DOLLAR EXCESS // 24/7 ROADSIDE" },
  { id: "vault", name: "VAULT", pricePer24h: 96, note: "UNLIMITED ON-ROAD COVER // PRIORITY SUPPORT" },
]

export default function BookingForm() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [vehicleId, setVehicleId] = React.useState("")
  const [hubId, setHubId] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [duration, setDuration] = React.useState("1")
  const [licenseNumber, setLicenseNumber] = React.useState("")
  const [confirmLicense, setConfirmLicense] = React.useState("")
  const [insuranceTier, setInsuranceTier] = React.useState("essential")
  const [renterName, setRenterName] = React.useState("")
  const [renterEmail, setRenterEmail] = React.useState("")
  const [renterPhone, setRenterPhone] = React.useState("")
  const [showHelp, setShowHelp] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  // Preselect the vehicle carried over from the fleet wheel (?vehicle=ID).
  // Runs on mount only — reading the URL during render would break SSR.
  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("vehicle")
    if (requested && VEHICLES.some((v) => v.id === requested)) {
      setVehicleId(requested)
    }
  }, [])

  const totalSteps = 3

  const selectedVehicle = VEHICLES.find((v) => v.id === vehicleId)
  const selectedHub = HUBS.find((h) => h.id === hubId)
  const days = Number(duration) || 1
  const insurance = INSURANCE_TIERS.find((t) => t.id === insuranceTier)
  const insuranceTotal = selectedVehicle && insurance ? insurance.pricePer24h * days : 0
  const estimatedTotal =
    (selectedVehicle ? selectedVehicle.pricePer24h * days : 0) + insuranceTotal
  const licenseMismatch = confirmLicense.length > 0 && confirmLicense !== licenseNumber

  const canProceed = () => {
    if (currentStep === 1) return !!(vehicleId && hubId && startDate && duration)
    if (currentStep === 2)
      return !!(licenseNumber && confirmLicense && !licenseMismatch)
    return true
  }

  const handleNext = () => {
    if (currentStep === totalSteps) {
      setSubmitted(true)
      return
    }
    if (canProceed()) setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const handleClose = () => {
    window.location.href = "/"
  }

  const footerContent = (
    <div className="flex justify-end flex-1">
      <a
        href="tel:+18005463842"
        className="font-mono text-[10px] uppercase tracking-wider text-[#929292] hover:text-[#e2e2e2] flex items-center gap-1"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        NEED HELP? [SUPPORT 24/7]
      </a>
    </div>
  )

  if (submitted) {
    return (
      <Card className="w-full max-w-[700px] border-border shadow-md">
        <CardContent className="pt-10 px-6 pb-8 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-[#ff5a00]" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-black tracking-tight text-[#e2e2e2]">
              BOOKING CONFIRMED
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-[#929292]">
              REF NO. {selectedVehicle?.id || "KC-XXXX"}-2026 // {selectedHub?.code || "NYC"}
            </p>
          </div>
          <Alert variant="success" className="max-w-md">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Your {selectedVehicle?.name} is reserved. A confirmation email with
              pickup instructions has been sent. Keys are ready at the{" "}
              {selectedHub?.name} branch.
            </AlertDescription>
          </Alert>
          <div className="grid grid-rows-2 gap-2 w-full max-w-md font-mono text-xs text-left">
            <div className="flex justify-between border border-border bg-secondary/50 px-3 py-2">
              <span className="text-[#929292]">VEHICLE</span>
              <span className="text-[#e2e2e2]">{selectedVehicle?.name}</span>
            </div>
            <div className="flex justify-between border border-border bg-secondary/50 px-3 py-2">
              <span className="text-[#929292]">ESTIMATED TOTAL</span>
              <span className="text-[#ff5a00]">${estimatedTotal.toLocaleString()}</span>
            </div>
          </div>
          <Button
            onClick={() => {
              setSubmitted(false)
              setCurrentStep(1)
              setVehicleId("")
              setHubId("")
              setStartDate("")
              setLicenseNumber("")
              setConfirmLicense("")
            }}
          >
            NEW BOOKING
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <MultiStepForm
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="KINETIC BOOKING"
      description="RESERVE YOUR RIDE // 3 STEPS"
      onBack={handleBack}
      onNext={handleNext}
      onClose={handleClose}
      nextButtonText={currentStep === totalSteps ? "CONFIRM BOOKING" : undefined}
      nextDisabled={!canProceed()}
      footerContent={footerContent}
    >
      {currentStep === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="grid gap-1.5 flex-1">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                PICKUP HUB
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
                <Select value={hubId} onValueChange={setHubId}>
                  <SelectTrigger className="pl-9 bg-background border-border text-[#e2e2e2]">
                    <SelectValue placeholder="SELECT BRANCH" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-[#161616] text-[#e2e2e2]">
                    {HUBS.map((hub) => (
                      <SelectItem key={hub.id} value={hub.id}>
                        {hub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5 flex-1">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                PICKUP DATE
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 bg-background border-border text-[#e2e2e2]"
                />
              </div>
            </div>
            <div className="grid gap-1.5 w-full sm:w-36">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                DURATION
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-background border-border text-[#e2e2e2]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-[#161616] text-[#e2e2e2]">
                  {[1, 2, 3, 5, 7, 14].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} DAY{d > 1 ? "S" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              SELECT VEHICLE
            </Label>
            <div className="grid sm:grid-cols-3 gap-3">
              {VEHICLES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={`border p-3 text-left transition-colors ${
                    vehicleId === v.id
                      ? "border-[#ff5a00] bg-[#ff5a00]/10"
                      : "border-border bg-secondary/40 hover:border-[#929292]"
                  }`}
                >
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full aspect-[16/9] object-cover mb-3"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#929292]">
                    {v.band} // ${v.pricePer24h}/DAY
                  </div>
                  <div className="font-headline text-sm font-bold tracking-tight text-[#e2e2e2]">
                    {v.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="grid gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              LICENSE COUNTRY
            </Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
              <Select>
                <SelectTrigger className="pl-9 bg-background border-border text-[#e2e2e2]">
                  <SelectValue placeholder="SELECT COUNTRY" />
                </SelectTrigger>
                <SelectContent className="border-border bg-[#161616] text-[#e2e2e2]">
                  <SelectItem value="us">UNITED STATES</SelectItem>
                  <SelectItem value="gb">UNITED KINGDOM</SelectItem>
                  <SelectItem value="ca">CANADA</SelectItem>
                  <SelectItem value="de">GERMANY</SelectItem>
                  <SelectItem value="ae">UAE</SelectItem>
                  <SelectItem value="au">AUSTRALIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                DRIVER&apos;S LICENSE NUMBER
              </Label>
              <TooltipProvider>
                <Tooltip open={showHelp} onOpenChange={setShowHelp}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#ff5a00] hover:text-white"
                    >
                      <HelpCircle className="h-3.5 w-3.5" /> VERIFY
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="border-border bg-[#161616] text-[#e2e2e2] font-mono text-[10px]">
                    WE CHECK YOUR LICENSE AGAINST {selectedHub?.code || "OUR"} BRANCH
                    RECORDS IN REAL TIME.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              placeholder="E.G. D123-4567-890"
              className="bg-background border-border text-[#e2e2e2] uppercase tracking-wider"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              CONFIRM LICENSE NUMBER
            </Label>
            <Input
              value={confirmLicense}
              onChange={(e) => setConfirmLicense(e.target.value.toUpperCase())}
              placeholder="RE-ENTER LICENSE NUMBER"
              className="bg-background border-border text-[#e2e2e2] uppercase tracking-wider"
            />
          </div>

          {licenseMismatch && (
            <Alert variant="error">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                LICENSE NUMBERS DO NOT MATCH. PLEASE CHECK YOUR ENTRY BEFORE
                CONTINUING.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 border border-border bg-secondary/40 p-4">
            <CarFront className="h-10 w-10 text-[#ff5a00]" />
            <div className="flex-1">
              <div className="font-headline text-lg font-bold tracking-tight text-[#e2e2e2]">
                {selectedVehicle?.name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                {selectedVehicle?.band} // {selectedVehicle?.drive} //{" "}
                {selectedVehicle?.power} {selectedVehicle?.powerUnit}
              </div>
            </div>
            <div className="font-headline text-2xl font-black text-[#ff5a00]">
              ${selectedVehicle?.pricePer24h}/24H
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
            <div className="flex justify-between border border-border bg-secondary/40 px-3 py-2">
              <span className="text-[#929292]">PICKUP</span>
              <span className="text-[#e2e2e2]">{selectedHub?.name}</span>
            </div>
            <div className="flex justify-between border border-border bg-secondary/40 px-3 py-2">
              <span className="text-[#929292]">START DATE</span>
              <span className="text-[#e2e2e2]">{startDate}</span>
            </div>
            <div className="flex justify-between border border-border bg-secondary/40 px-3 py-2">
              <span className="text-[#929292]">DURATION</span>
              <span className="text-[#e2e2e2]">{days} DAY{days > 1 ? "S" : ""}</span>
            </div>
            <div className="flex justify-between border border-border bg-secondary/40 px-3 py-2">
              <span className="text-[#929292]">LICENSE</span>
              <span className="text-[#e2e2e2]">{licenseNumber}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              ESTIMATED TOTAL // TAXES INCL.
            </div>
            <div className="font-headline text-3xl font-black text-[#ff5a00]">
              ${estimatedTotal.toLocaleString()}
            </div>
          </div>

          <Alert variant="info">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              FREE CANCELLATION UP TO 24H BEFORE PICKUP. COLLISION &amp; LIABILITY
              COVER INCLUDED. 100 MILES PER DAY INCLUDED.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </MultiStepForm>
  )
}