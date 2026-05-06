{
  /* Generated with SnapComponent - snapcomponent.com */
}
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Grid, Upload, Award, TrendingUp } from "lucide-react";

const DashboardHeader: React.FC = () => (
  <div className="bg-blue-800 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
    <div className="text-2xl font-bold">Welcome back, admin!</div>
    <div className="flex items-center space-x-4">
      <Button variant="outline" className="text-white border-white">
        <Badge className="bg-blue-600 text-white">2025 Season</Badge>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="text-white border-white">
            Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action 1</DropdownMenuItem>
          <DropdownMenuItem>Action 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="flex items-center space-x-2">
      <div className="text-3xl font-bold">1</div>
      <div>Total Clips</div>
      <div className="text-3xl font-bold">-</div>
      <div>Avg Grade</div>
    </div>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}> = ({ icon, title, value, color }) => (
  <Card className={`border-t-4 ${color} shadow-md`}>
    <CardHeader className="flex items-center justify-center">
      <div className="text-3xl">{icon}</div>
    </CardHeader>
    <CardContent className="text-center">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => (
  <div className="space-y-6">
    <DashboardHeader />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Grid />}
        title="Total Clips"
        value="1"
        color="border-blue-500"
      />
      <StatCard
        icon={<Upload />}
        title="This Month"
        value="0"
        color="border-green-500"
      />
      <StatCard
        icon={<Award />}
        title="Graded Clips"
        value="0"
        color="border-blue-500"
      />
      <StatCard
        icon={<TrendingUp />}
        title="Average Grade"
        value="N/A"
        color="border-orange-500"
      />
    </div>
  </div>
);

export default Dashboard;
