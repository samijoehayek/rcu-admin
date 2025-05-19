/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import api from "../../axios/index"; // Import the API client we created
import { isAuthenticated, isAdmin } from "../../utils/authUtils"; // Import the auth utilities
import { useRouter } from "next/navigation";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Define interfaces for our data structure
interface DailyLoginData {
  date: string;
  count: number;
}

interface MonthlyLoginData {
  month: string;
  loginsPerMonth: number;
  totalUsers: number;
}

interface CurrentMonthData {
  month: string;
  loginsPerMonth: number;
  totalUsers: number;
}

interface TodayData {
  date: string;
  loginCount: number;
}

interface UserActivityData {
  today: TodayData;
  last30Days: DailyLoginData[];
  monthlyLogins: MonthlyLoginData[];
  currentMonthAverage: CurrentMonthData;
}

export default function UserActivityCharts() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [isMonthlyDropdownOpen, setIsMonthlyDropdownOpen] = useState(false);
  const [isDailyDropdownOpen, setIsDailyDropdownOpen] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    // Check admin role
    if (!isAdmin()) {
      router.push("/unauthorized");
      return;
    }

    const fetchUserActivity = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("https://backend-rcu.com/v1/analytics/user-activity");
        setActivityData(response.data);
      } catch (err: any) {
        console.error("Failed to fetch user activity data:", err);
        setError(err.message || "Failed to load user activity data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserActivity();
  }, [router]);

  // Monthly logins chart options
  const monthlyOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: activityData?.monthlyLogins
        ? activityData.monthlyLogins.map(item => {
            const [year, month] = item.month.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleString('default', { month: 'short' });
          }).reverse() // Reverse to show most recent last (right)
        : [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} logins`,
      },
    },
  };

  // Daily logins chart options
  const dailyOptions: ApexOptions = {
    colors: ["#22c55e"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 180,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: activityData?.last30Days
        ? activityData.last30Days.map(item => {
            const date = new Date(item.date);
            return date.getDate().toString(); // Just show day number
          })
        : [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      x: {
        format: "dd MMM",
      },
      y: {
        formatter: (val: number) => `${val} logins`,
      },
    },
  };

  // Prepare series data
  const monthlySeries = [
    {
      name: "Monthly Logins",
      data: activityData?.monthlyLogins
        ? activityData.monthlyLogins.map(item => item.loginsPerMonth).reverse() // Reverse to match categories
        : [],
    },
  ];

  const dailySeries = [
    {
      name: "Daily Logins",
      data: activityData?.last30Days
        ? activityData.last30Days.map(item => item.count)
        : [],
    },
  ];

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Monthly Logins Chart */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Logins
          </h3>

          <div className="relative inline-block">
            <button onClick={() => setIsMonthlyDropdownOpen(!isMonthlyDropdownOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isMonthlyDropdownOpen}
              onClose={() => setIsMonthlyDropdownOpen(false)}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => setIsMonthlyDropdownOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsMonthlyDropdownOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={monthlyOptions}
              series={monthlySeries}
              type="bar"
              height={180}
            />
          </div>
        </div>
      </div>

      {/* Daily Logins Chart */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Daily Logins (Last 30 Days)
          </h3>

          <div className="relative inline-block">
            <button onClick={() => setIsDailyDropdownOpen(!isDailyDropdownOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isDailyDropdownOpen}
              onClose={() => setIsDailyDropdownOpen(false)}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => setIsDailyDropdownOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsDailyDropdownOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="w-full">
          <div className="pt-2">
            <ReactApexChart
              options={dailyOptions}
              series={dailySeries}
              type="area"
              height={180}
              width="100%"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Login Count */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Today&apos;s Login Count
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {activityData.today.loginCount}
              </p>
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                on {new Date(activityData.today.date).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Number of users who logged in today
            </div>
          </div>
        </div>

        {/* Current Month Average */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Month Stats
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {activityData.currentMonthAverage.loginsPerMonth}
              </p>
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                total logins this month
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {activityData.currentMonthAverage.totalUsers} active users this month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}