"use client"

import { useCallback } from "react"
import { Receipt, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { withErrorBoundary } from "./error-boundary"

interface UserShare {
  userId: string
  percentage: number
}

interface Product {
  id: string
  name: string
  price: string
  image: string
  shares: UserShare[]
}

interface User {
  id: string
  name: string
  color: string
}

interface TaxInfo {
  rate: number
  amount: string
}

interface BillSummaryProps {
  products: Product[]
  users: User[]
  taxInfo: TaxInfo
  subtotal: string
  total: string
  discount?: string
  tip?: string
  serviceCharge?: string
  payer: string | null
}

function BillSummaryComponent({
  products,
  users,
  taxInfo,
  subtotal,
  total,
  discount = "0.00",
  tip = "0.00",
  serviceCharge = "0.00",
  payer,
}: BillSummaryProps) {
  // Safely get user by ID
  const getUserById = useCallback(
    (userId: string) => {
      return users.find((user) => user.id === userId) || null
    },
    [users],
  )

  // Get user's subtotal (without tax or discount)
  const getUserSubtotal = useCallback(
    (userId: string) => {
      try {
        return Number(
          products
            .reduce((total, product) => {
              // Find user's share for this product
              const userShare = product.shares.find((share) => share.userId === userId)

              // Skip if user is not assigned to this product
              if (!userShare) return total

              // Remove $ and convert to number
              const price = Number.parseFloat(product.price.replace("$", "")) || 0

              // Calculate user's portion based on percentage
              const userPortion = price * ((userShare.percentage || 0) / 100)

              return total + userPortion
            }, 0)
            .toFixed(2),
        )
      } catch (error) {
        console.error("Error calculating user subtotal:", error)
        return 0
      }
    },
    [products],
  )

  // Calculate user's share of tax based on their proportion of the subtotal
  const getUserTaxShare = useCallback(
    (userId: string) => {
      try {
        if (!taxInfo) return 0

        const userSubtotal = getUserSubtotal(userId)
        const totalSubtotal = Number(
          products
            .reduce((sum, product) => {
              return sum + (Number.parseFloat(product.price.replace("$", "")) || 0)
            }, 0)
            .toFixed(2),
        )

        // If no items are assigned, return 0
        if (totalSubtotal === 0) return 0

        // Calculate user's proportion of the total bill
        const proportion = userSubtotal / totalSubtotal

        // Calculate user's share of the tax
        return Number((proportion * (Number.parseFloat(taxInfo.amount) || 0)).toFixed(2))
      } catch (error) {
        console.error("Error calculating user tax share:", error)
        return 0
      }
    },
    [getUserSubtotal, products, taxInfo],
  )

  // Calculate user's share of discount based on their proportion of the subtotal
  const getUserDiscountShare = useCallback(
    (userId: string) => {
      try {
        const discountAmount = Number.parseFloat(discount) || 0
        if (discountAmount === 0) return 0

        const userSubtotal = getUserSubtotal(userId)
        const totalSubtotal = Number(
          products
            .reduce((sum, product) => {
              return sum + (Number.parseFloat(product.price.replace("$", "")) || 0)
            }, 0)
            .toFixed(2),
        )

        // If no items are assigned, return 0
        if (totalSubtotal === 0) return 0

        // Calculate user's proportion of the total bill
        const proportion = userSubtotal / totalSubtotal

        // Calculate user's share of the discount
        return Number((proportion * discountAmount).toFixed(2))
      } catch (error) {
        console.error("Error calculating user discount share:", error)
        return 0
      }
    },
    [getUserSubtotal, products, discount],
  )

  // Calculate user's share of tip based on their proportion of the subtotal
  const getUserTipShare = useCallback(
    (userId: string) => {
      try {
        const tipAmount = Number.parseFloat(tip) || 0
        if (tipAmount === 0) return 0

        // Tip is split equally among all users who have items assigned
        const usersWithItems = users.filter((user) =>
          products.some((product) => product.shares.some((share) => share.userId === user.id)),
        )

        if (usersWithItems.length === 0) return 0

        // Check if this user has items assigned
        const userHasItems = products.some((product) => product.shares.some((share) => share.userId === userId))

        return userHasItems ? Number((tipAmount / usersWithItems.length).toFixed(2)) : 0
      } catch (error) {
        console.error("Error calculating user tip share:", error)
        return 0
      }
    },
    [tip, users, products],
  )

  // Calculate user's share of service charge based on their proportion of the subtotal
  const getUserServiceChargeShare = useCallback(
    (userId: string) => {
      try {
        const serviceChargeAmount = Number.parseFloat(serviceCharge) || 0
        if (serviceChargeAmount === 0) return 0

        // Service charge is split equally among all users who have items assigned
        const usersWithItems = users.filter((user) =>
          products.some((product) => product.shares.some((share) => share.userId === user.id)),
        )

        if (usersWithItems.length === 0) return 0

        // Check if this user has items assigned
        const userHasItems = products.some((product) => product.shares.some((share) => share.userId === userId))

        return userHasItems ? Number((serviceChargeAmount / usersWithItems.length).toFixed(2)) : 0
      } catch (error) {
        console.error("Error calculating user service charge share:", error)
        return 0
      }
    },
    [serviceCharge, users, products],
  )

  // Get user's total including their share of tax, discount, tip, and service charge
  const getUserTotal = useCallback(
    (userId: string) => {
      try {
        const subtotal = getUserSubtotal(userId)
        const taxShare = getUserTaxShare(userId)
        const discountShare = getUserDiscountShare(userId)
        const tipShare = getUserTipShare(userId)
        const serviceChargeShare = getUserServiceChargeShare(userId)
        return Number((subtotal + taxShare - discountShare + tipShare + serviceChargeShare).toFixed(2))
      } catch (error) {
        console.error("Error calculating user total:", error)
        return 0
      }
    },
    [getUserSubtotal, getUserTaxShare, getUserDiscountShare, getUserTipShare, getUserServiceChargeShare],
  )

  // Count items assigned to a user
  const getItemCount = useCallback(
    (userId: string) => {
      try {
        return products.filter((p) => p.shares.some((share) => share.userId === userId)).length
      } catch (error) {
        console.error("Error counting user items:", error)
        return 0
      }
    },
    [products],
  )

  // Get unassigned items
  const getUnassignedItems = useCallback(() => {
    try {
      return products.filter((p) => p.shares.length === 0)
    } catch (error) {
      console.error("Error getting unassigned items:", error)
      return []
    }
  }, [products])

  // Calculate total for unassigned items
  const getUnassignedTotal = useCallback(() => {
    try {
      return products
        .filter((p) => p.shares.length === 0)
        .reduce((total, p) => total + (Number.parseFloat(p.price.replace("$", "")) || 0), 0)
        .toFixed(2)
    } catch (error) {
      console.error("Error calculating unassigned total:", error)
      return "0.00"
    }
  }, [products])

  const unassignedItems = getUnassignedItems()
  const discountAmount = Number.parseFloat(discount) || 0
  const tipAmount = Number.parseFloat(tip) || 0
  const serviceChargeAmount = Number.parseFloat(serviceCharge) || 0

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center">
          <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Bill Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bill Details - Mobile optimized */}
        <div className="mb-3 p-3 bg-muted/10 rounded-lg">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${subtotal || "0.00"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({taxInfo ? (taxInfo.rate * 100).toFixed(1) : "0"}%):</span>
              <span className="font-medium">${taxInfo ? taxInfo.amount : "0.00"}</span>
            </div>

            {tipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip:</span>
                <span className="font-medium">${tip}</span>
              </div>
            )}

            {serviceChargeAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Charge:</span>
                <span className="font-medium">${serviceCharge}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-green-600">-${discount}</span>
              </div>
            )}

            <div className="flex justify-between pt-1 border-t">
              <span className="text-muted-foreground font-medium">Total:</span>
              <span className="font-bold">${total || "0.00"}</span>
            </div>

            {payer && (
              <div className="pt-1 border-t mt-1">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Payer: {getUserById(payer)?.name || "Unknown User"}
                </span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-medium mb-2">Individual Shares</h3>

        {/* Responsive grid for user shares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {users.map((user) => {
            const subtotalAmount = getUserSubtotal(user.id)
            const taxShare = getUserTaxShare(user.id)
            const discountShare = getUserDiscountShare(user.id)
            const tipShare = getUserTipShare(user.id)
            const serviceChargeShare = getUserServiceChargeShare(user.id)
            const totalAmount = getUserTotal(user.id)
            const itemCount = getItemCount(user.id)

            if (itemCount === 0) return null

            return (
              <div
                key={user.id}
                className={`p-2 sm:p-3 rounded-lg ${
                  payer === user.id ? "bg-primary/10 border border-primary/30" : "bg-muted/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: user.color }} />
                  <span className="font-medium text-sm truncate flex-1">{user.name}</span>
                  {payer === user.id && (
                    <Badge variant="default" className="text-xs">
                      Payer
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm">
                  <div className="text-muted-foreground">Items:</div>
                  <div className="text-right">
                    {itemCount} {itemCount !== 1 ? "items" : "item"}
                  </div>

                  <div className="text-muted-foreground">Subtotal:</div>
                  <div className="text-right">${subtotalAmount.toFixed(2)}</div>

                  <div className="text-muted-foreground">Tax share:</div>
                  <div className="text-right">${taxShare.toFixed(2)}</div>

                  {discountShare > 0 && (
                    <>
                      <div className="text-muted-foreground">Discount:</div>
                      <div className="text-right text-green-600">-${discountShare.toFixed(2)}</div>
                    </>
                  )}

                  {tipShare > 0 && (
                    <>
                      <div className="text-muted-foreground">Tip share:</div>
                      <div className="text-right">${tipShare.toFixed(2)}</div>
                    </>
                  )}

                  {serviceChargeShare > 0 && (
                    <>
                      <div className="text-muted-foreground">Service charge:</div>
                      <div className="text-right">${serviceChargeShare.toFixed(2)}</div>
                    </>
                  )}

                  <div className="text-muted-foreground font-medium pt-1 border-t">Total:</div>
                  <div className="text-right font-bold pt-1 border-t">${totalAmount.toFixed(2)}</div>
                </div>
              </div>
            )
          })}

          {/* Show unassigned items if any */}
          {unassignedItems.length > 0 && (
            <div className="p-2 sm:p-3 bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-lg border border-amber-300 dark:border-amber-700 col-span-full sm:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-sm">Unassigned Items</span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm">
                <div>Items:</div>
                <div className="text-right">
                  {unassignedItems.length} item{unassignedItems.length !== 1 ? "s" : ""}
                </div>

                <div>Total:</div>
                <div className="text-right font-bold">${getUnassignedTotal()}</div>
              </div>
              <div className="mt-2 text-xs">These items need to be assigned before creating the expense.</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const BillSummary = withErrorBoundary(BillSummaryComponent)
