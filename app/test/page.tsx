"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
} from "lucide-react";

const PricingCard: React.FC = () => {
  return (
    <div className="max-w-sm p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <span className="px-2 py-1 text-sm font-semibold text-white bg-yellow-500 rounded-full">
          Starter
        </span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Starter</h2>
        <span className="text-xl">$10/mo</span>
      </div>
      <ul className="mb-6 space-y-2">
        <li className="flex items-center">
          <span className="text-green-500 mr-2">✔</span>
          Basic image generation
        </li>
        <li className="flex items-center">
          <span className="text-green-500 mr-2">✔</span>
          Access to templates
        </li>
        <li className="flex items-center text-gray-400">
          <span className="mr-2">✔</span>
          Feature 3
        </li>
        <li className="flex items-center text-gray-400">
          <span className="mr-2">✔</span>
          Feature 4
        </li>
      </ul>
      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
        Subscribe
      </Button>
    </div>
  );
};

export default PricingCard;
