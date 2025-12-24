"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PricingCard: React.FC = () => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <span className="bg-yellow-500 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          Starter
        </span>
      </div>
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-2xl font-bold">Starter</h2>
        <span className="text-xl">$10/mo</span>
      </div>
      <ul className="mb-6">
        <li className="flex items-center mb-2">
          <svg
            className="w-4 h-4 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Basic image generation
        </li>
        <li className="flex items-center mb-2">
          <svg
            className="w-4 h-4 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Access to templates
        </li>
        <li className="flex items-center mb-2 text-gray-400">
          <svg
            className="w-4 h-4 text-gray-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="blur-sm">Feature 3</span>
        </li>
        <li className="flex items-center mb-2 text-gray-400">
          <svg
            className="w-4 h-4 text-gray-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="blur-sm">Feature 4</span>
        </li>
      </ul>
      <Button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Subscribe
      </Button>
    </div>
  );
};

export default PricingCard;
