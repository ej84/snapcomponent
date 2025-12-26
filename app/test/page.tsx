"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignUpForm: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold text-center mb-4">
          Sign up for Users
        </h2>
        <form>
          <label className="block mb-2 text-sm font-medium">
            Email Address:
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full mb-4"
          />
          <Button className="w-full mb-4 bg-blue-500 text-white">Submit</Button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Email added successfully!
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
