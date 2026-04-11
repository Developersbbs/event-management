import { IconUsers, IconSoup, IconSalad, IconCoffee, IconCurrencyRupee, IconClock, IconCheck, IconX } from "@tabler/icons-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  stats: {
    totalRegistrations: number
    totalGuests: number
    totalAmount: number
    pendingApprovals: number
    approvedRegistrations: number
    rejectedRegistrations: number
    cashPayments: number
    onlinePayments: number
    vegCount: number
    nonVegCount: number
    morningFoodCount: number
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Registrations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalRegistrations}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconUsers className="size-4 text-blue-500" /> Total Guests: {stats.totalGuests}
          </div>
          <div className="text-muted-foreground">
            Total Amount: ₹{stats.totalAmount}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Payment Methods</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.cashPayments + stats.onlinePayments}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCurrencyRupee className="size-4 text-green-500" /> Cash: {stats.cashPayments}
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconClock className="size-4 text-blue-500" /> Online: {stats.onlinePayments}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Approval Status</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingApprovals + stats.approvedRegistrations + stats.rejectedRegistrations}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconClock className="size-4 text-orange-500" /> Pending: {stats.pendingApprovals}
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCheck className="size-4 text-green-500" /> Approved: {stats.approvedRegistrations}
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconX className="size-4 text-red-500" /> Rejected: {stats.rejectedRegistrations}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Non-Veg Meals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.nonVegCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconSoup className="size-4 text-red-500" /> Non-Veg
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Veg Meals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.vegCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconSalad className="size-4 text-green-500" /> Pure Veg
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Morning Breakfast</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.morningFoodCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCoffee className="size-4 text-orange-500" /> Opted In
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
