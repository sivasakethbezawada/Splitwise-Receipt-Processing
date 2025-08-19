"use client"

import { useState } from "react"
import { Edit3, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TaxInfo {
  rate: number
  amount: string
}

interface EditableTotalProps {
  subtotal: string
  taxInfo: TaxInfo
  total: string
  discount?: string
  tip?: string
  serviceCharge?: string
  onUpdateTotal: (
    newSubtotal: string,
    newTax: string,
    newTotal: string,
    newDiscount?: string,
    newTip?: string,
    newServiceCharge?: string,
  ) => void
}

export function EditableTotal({
  subtotal,
  taxInfo,
  total,
  discount = "0.00",
  tip = "0.00",
  serviceCharge = "0.00",
  onUpdateTotal,
}: EditableTotalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempSubtotal, setTempSubtotal] = useState(subtotal)
  const [tempTaxRate, setTempTaxRate] = useState((taxInfo.rate * 100).toFixed(1))
  const [tempDiscount, setTempDiscount] = useState(discount)
  const [tempTip, setTempTip] = useState(tip)
  const [tempServiceCharge, setTempServiceCharge] = useState(serviceCharge)
  const [tempTotal, setTempTotal] = useState(total)

  const handleSave = () => {
    try {
      const newSubtotal = Number.parseFloat(tempSubtotal)
      const newTaxRate = Number.parseFloat(tempTaxRate) / 100
      const newDiscount = Number.parseFloat(tempDiscount)
      const newTip = Number.parseFloat(tempTip)
      const newServiceCharge = Number.parseFloat(tempServiceCharge)
      const newTotal = Number.parseFloat(tempTotal)

      if (
        isNaN(newSubtotal) ||
        isNaN(newTaxRate) ||
        isNaN(newDiscount) ||
        isNaN(newTip) ||
        isNaN(newServiceCharge) ||
        isNaN(newTotal)
      ) {
        return
      }

      const calculatedTax = newSubtotal * newTaxRate
      const calculatedTotal = newSubtotal + calculatedTax - newDiscount + newTip + newServiceCharge

      onUpdateTotal(
        newSubtotal.toFixed(2),
        calculatedTax.toFixed(2),
        calculatedTotal.toFixed(2),
        newDiscount.toFixed(2),
        newTip.toFixed(2),
        newServiceCharge.toFixed(2),
      )

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating total:", error)
    }
  }

  const handleCancel = () => {
    setTempSubtotal(subtotal)
    setTempTaxRate((taxInfo.rate * 100).toFixed(1))
    setTempDiscount(discount)
    setTempTip(tip)
    setTempServiceCharge(serviceCharge)
    setTempTotal(total)
    setIsEditing(false)
  }

  const recalculateFromSubtotalTaxAndCharges = () => {
    const sub = Number.parseFloat(tempSubtotal) || 0
    const rate = Number.parseFloat(tempTaxRate) / 100 || 0
    const disc = Number.parseFloat(tempDiscount) || 0
    const tipAmount = Number.parseFloat(tempTip) || 0
    const serviceAmount = Number.parseFloat(tempServiceCharge) || 0
    const calculatedTotal = sub + sub * rate - disc + tipAmount + serviceAmount
    setTempTotal(calculatedTotal.toFixed(2))
  }

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="edit-subtotal" className="text-sm font-medium">
              Subtotal ($)
            </Label>
            <Input
              id="edit-subtotal"
              type="number"
              min="0"
              step="0.01"
              value={tempSubtotal}
              onChange={(e) => {
                setTempSubtotal(e.target.value)
                setTimeout(recalculateFromSubtotalTaxAndCharges, 0)
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-tax-rate" className="text-sm font-medium">
              Tax Rate (%)
            </Label>
            <Input
              id="edit-tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={tempTaxRate}
              onChange={(e) => {
                setTempTaxRate(e.target.value)
                setTimeout(recalculateFromSubtotalTaxAndCharges, 0)
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-discount" className="text-sm font-medium">
              Discount ($)
            </Label>
            <Input
              id="edit-discount"
              type="number"
              min="0"
              step="0.01"
              value={tempDiscount}
              onChange={(e) => {
                setTempDiscount(e.target.value)
                setTimeout(recalculateFromSubtotalTaxAndCharges, 0)
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-tip" className="text-sm font-medium">
              Tip ($)
            </Label>
            <Input
              id="edit-tip"
              type="number"
              min="0"
              step="0.01"
              value={tempTip}
              onChange={(e) => {
                setTempTip(e.target.value)
                setTimeout(recalculateFromSubtotalTaxAndCharges, 0)
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-service-charge" className="text-sm font-medium">
              Service Charge ($)
            </Label>
            <Input
              id="edit-service-charge"
              type="number"
              min="0"
              step="0.01"
              value={tempServiceCharge}
              onChange={(e) => {
                setTempServiceCharge(e.target.value)
                setTimeout(recalculateFromSubtotalTaxAndCharges, 0)
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-total" className="text-sm font-medium">
              Total ($)
            </Label>
            <Input
              id="edit-total"
              type="number"
              min="0"
              step="0.01"
              value={tempTotal}
              onChange={(e) => setTempTotal(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  const discountAmount = Number.parseFloat(discount) || 0
  const tipAmount = Number.parseFloat(tip) || 0
  const serviceChargeAmount = Number.parseFloat(serviceCharge) || 0

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
      <div className="space-y-1">
        <div className="flex justify-between items-center min-w-[200px]">
          <span className="text-sm text-muted-foreground">Subtotal:</span>
          <span className="font-medium">${subtotal}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tax ({(taxInfo.rate * 100).toFixed(1)}%):</span>
          <span className="font-medium">${taxInfo.amount}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Discount:</span>
            <span className="font-medium text-green-600">-${discount}</span>
          </div>
        )}
        {tipAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tip:</span>
            <span className="font-medium">${tip}</span>
          </div>
        )}
        {serviceChargeAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Charge:</span>
            <span className="font-medium">${serviceCharge}</span>
          </div>
        )}
        <div className="flex justify-between items-center border-t pt-1">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-lg">${total}</span>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="ml-4">
        <Edit3 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
    </div>
  )
}
