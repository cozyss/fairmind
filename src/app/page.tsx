"use client";

import Link from "next/link";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AnalysisIcon, 
  HandshakeIcon, 
  LightbulbIcon, 
  SparklesIcon, 
  ChartIcon 
} from "@/components/ui/Icons";
import { ScoreIndicator } from "@/components/ui/ScoreIndicator";
import { PrinciplesSection } from "@/components/PrinciplesSection";
import { Header } from "@/components/ui/Header";

export default function Home() {
  const router = useRouter();
  const [cookies] = useCookies(["authToken"]);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if (cookies.authToken) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [cookies.authToken, router]);

  // Don't render anything if user is authenticated or still loading
  if (cookies.authToken || isLoading) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header showAuthButtons={true} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-600 py-16 text-white md:py-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary-400"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-800"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fadeIn">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Better Negotiations with <span className="text-primary-300">Fair Mind</span>
              </h1>
              <p className="mb-8 text-xl text-primary-100">
                Analyze interests, generate creative options, and improve negotiation outcomes with AI-powered insights based on the principles from "Getting to Yes."
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-primary-600 sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-lg bg-white p-6 shadow-xl">
                <div className="absolute -right-3 -top-3 rounded-full bg-primary-500 p-3">
                  <SparklesIcon size={24} className="text-white" />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Interest Analysis</h3>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <ScoreIndicator score={75} size="md" />
                    <div>
                      <h4 className="font-medium text-gray-700">Interest Statement Completeness</h4>
                    </div>
                  </div>
                </div>
                <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                  <h4 className="mb-2 font-medium text-gray-700">Analysis</h4>
                  <p className="whitespace-pre-line">Good job separating people from problems and focusing on interests rather than positions. Consider adding more specific objective criteria to strengthen your statement.</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Score</span>
                  <span className="text-sm font-medium text-primary-600">75/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <PrinciplesSection />

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Fair Mind
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our platform helps negotiators identify interests, analyze positions, and generate creative options for mutual gain.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary-100 p-3 text-primary-600">
                  <AnalysisIcon size={24} />
                </div>
                <CardTitle className="mb-3">Interest Analysis</CardTitle>
                <p className="text-gray-600">
                  Identify and evaluate the quality of interest statements to ensure they follow principled negotiation best practices.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-green-100 p-3 text-green-600">
                  <LightbulbIcon size={24} />
                </div>
                <CardTitle className="mb-3">Option Generation</CardTitle>
                <p className="text-gray-600">
                  Generate creative options based on the interests of both parties to find solutions for mutual gain.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-purple-100 p-3 text-purple-600">
                  <SparklesIcon size={24} />
                </div>
                <CardTitle className="mb-3">AI-Powered Enhancement</CardTitle>
                <p className="text-gray-600">
                  Enhance your interest statements with AI-guided questions that help uncover deeper interests and improve outcomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              How Fair Mind Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              A simple process to improve your negotiation outcomes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Create a Project</h3>
              <p className="text-gray-600">
                Enter the negotiation topic and interest statements for both parties involved.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Analyze & Enhance</h3>
              <p className="text-gray-600">
                Get scores and feedback on your interest statements, then enhance them with AI guidance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Generate Options</h3>
              <p className="text-gray-600">
                Discover creative negotiation options that address the interests of both parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Fair Mind</h2>
            <p className="mt-2">Negotiation Analysis Tool</p>
          </div>
          <div className="text-center text-sm">
            <p className="mb-2">Based on principles from "Getting to Yes" by Roger Fisher and William Ury</p>
            <p>&copy; {new Date().getFullYear()} Fair Mind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}