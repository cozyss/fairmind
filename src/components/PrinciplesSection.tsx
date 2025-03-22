"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/Card";

export function PrinciplesSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">Inspired by "Getting to Yes"</span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Principled Negotiation Framework
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Fair Mind is built on the four principles of negotiation from the bestselling book "Getting to Yes" by Roger Fisher and William Ury.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Principle 1 */}
          <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 text-blue-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">1</div>
              </div>
              <CardTitle className="mb-3">Separate People from the Problem</CardTitle>
              <p className="text-gray-600">
                Deal with relationship issues independently from substantive problems. Address emotions and perceptions directly without making them part of the negotiation substance.
              </p>
            </CardContent>
          </Card>

          {/* Principle 2 */}
          <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-full bg-purple-100 p-3 text-purple-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">2</div>
              </div>
              <CardTitle className="mb-3">Focus on Interests, Not Positions</CardTitle>
              <p className="text-gray-600">
                Look beyond stated positions to identify the underlying interests, needs, and concerns that motivate each party. Multiple positions can satisfy the same interest.
              </p>
            </CardContent>
          </Card>

          {/* Principle 3 */}
          <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3 text-amber-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white">3</div>
              </div>
              <CardTitle className="mb-3">Invent Options for Mutual Gain</CardTitle>
              <p className="text-gray-600">
                Generate a variety of possible solutions before deciding what to do. Look for shared interests and creative options that provide mutual benefit.
              </p>
            </CardContent>
          </Card>

          {/* Principle 4 */}
          <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-full bg-green-100 p-3 text-green-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">4</div>
              </div>
              <CardTitle className="mb-3">Insist on Objective Criteria</CardTitle>
              <p className="text-gray-600">
                Base agreements on fair standards, procedures, or principles rather than pressure or power. Use objective criteria that are independent of each side's will.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
