{
  /* Generated with SnapComponent - snapcomponent.com */
}
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Clock, TrendingUp, Award } from "lucide-react";

const PerformanceTracking = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="bg-blue-800 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Tracking</h1>
          <p>Week-by-week analysis for</p>
        </div>
        <Button className="bg-blue-600 text-white rounded-full px-4 py-2">
          2025 Season
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardContent className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500">Total Clips</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Clock className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500">Average Grade</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="flex items-center space-x-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500">Performance Trend</p>
              <p className="text-2xl font-bold">+0%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="flex items-center space-x-4">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Award className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500">Graded Clips</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardContent>
            <h2 className="text-lg font-bold">Weekly Performance Trend</h2>
            <div className="mt-4 bg-gray-100 p-6 rounded-lg text-center text-gray-500">
              No graded clips yet
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent>
            <h2 className="text-lg font-bold">Clips Per Week</h2>
            <div className="mt-4">
              <div className="h-32 bg-purple-200 flex items-end justify-center">
                <div className="bg-purple-500 w-8 h-24"></div>
              </div>
              <p className="text-center mt-2">Week 12</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTracking;
