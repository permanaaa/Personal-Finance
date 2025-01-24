"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import {
  CardData,
  getDashboardData,
  MonthlyOverview,
  RecentTransactions,
} from "@/service/dashboardService";

// interface DashboardData {
//     title: string;
//     value: string;
//     icon: React.ReactNode;
// }

const chartConfig = {
  income: {
    label: "Income",
    color: "#2563eb",
  },
  expense: {
    label: "Expense",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function Page() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [monthlyOverview, setMonthlyOverview] = useState<MonthlyOverview[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransactions[]
  >([]);

  useEffect(() => {
    handleGetDashboardData();
  }, []);

  const handleGetDashboardData = async () => {
    try {
      const response = await getDashboardData();
      if (response) {
        setCardData(response.data.cardData);
        setMonthlyOverview(response.data.monthlyOverview);
        setRecentTransactions(response.data.recentTransactions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen px-6 my-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-row gap-4 justify-between">
          {cardData.map((item) => (
            <Card className="w-1/4" key={item.title}>
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                    <DollarSign width={16} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h1 className="text-xl font-bold">
                  {item.value.toLocaleString()}
                </h1>
                {item.percentage != null && (
                  <p className="text-sm">{item.percentage}% from last month</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-row gap-4">
          <Card className="w-[70%]">
            <CardHeader>
              <CardTitle>
                <h6 className="text-sm font-semibold">Overview</h6>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <BarChart accessibilityLayer data={monthlyOverview}>
                  <CartesianGrid vertical={false} />
                  <YAxis tickLine={true} axisLine={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                  <Bar
                    dataKey="expenses"
                    fill="var(--color-expense)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="w-[30%]">
            <CardHeader>
              <CardTitle>
                <h6 className="text-sm font-semibold">Recent Transaction</h6>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.map((item , index) => (
                <div
                  className="flex flex-row justify-between border-b py-2"
                  key={index}
                >
                  <div className="flex flex-col gap-2">
                    <h1 className="text-sm font-medium">{item.date}</h1>
                    <h1 className="text-sm font-semibold">
                      {item.description}
                    </h1>
                    <p className="text-sm font-medium">{item.allocationName}</p>
                  </div>
                  <h4 className="text-sm font-semibold">
                    Rp. {item.amount.toLocaleString("id-ID")}
                  </h4>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
