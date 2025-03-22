"use client";

import { useState } from "react";
import { EnhanceInterestSection } from "@/components/EnhanceInterestSection";
import { ScoreIndicator } from "@/components/ui/ScoreIndicator";
import { Button } from "@/components/ui/Button";
import { SparklesIcon, LoaderIcon, ChartIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { HoverDisclosure } from "@/components/ui/HoverDisclosure";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

type InterestStatementCardProps = {
  projectId: number;
  partyType: "A" | "B";
  partyName: string;
  statement: string;
  score: number | null;
  scoreReasoning: string | null;
  authToken: string;
  onStatementUpdated: () => void;
  isYou?: boolean;
};

export function InterestStatementCard({
  projectId,
  partyType,
  partyName,
  statement,
  score,
  scoreReasoning,
  authToken,
  onStatementUpdated,
  isYou = false,
}: InterestStatementCardProps) {
  const [triggerEnhance, setTriggerEnhance] = useState(false);
  
  const generateScoreMutation = api.generatePartyScore.useMutation({
    onSuccess: () => {
      onStatementUpdated();
      toast.success("Score generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const borderColor = isYou ? "border-blue-100" : "border-purple-100";
  const bgColor = isYou ? "bg-blue-50" : "bg-purple-50";
  const badgeVariant = isYou ? "primary" : "secondary";
  const badgeText = isYou ? "You" : "The other Party";

  return (
    <Card className={`overflow-hidden border ${borderColor} shadow-sm transition-all duration-200 hover:shadow-md`}>
      <CardHeader className={`border-b ${borderColor} ${bgColor} p-3 sm:p-4`}>
        <Badge variant={badgeVariant} className="mb-1 w-fit">
          {badgeText}
        </Badge>
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span>{partyName || (isYou ? "Your" : "The other Party's")} Interest Statement</span>
          {score !== null && (
            <HoverDisclosure
              trigger={
                <div className="flex cursor-help items-center">
                  <ScoreIndicator score={score} size="sm" />
                </div>
              }
              contentClassName="w-72"
            >
              <div className="p-1">
                <h5 className="mb-1 font-medium">Interest Statement Completeness</h5>
                <p className="text-sm text-gray-600">{scoreReasoning}</p>
              </div>
            </HoverDisclosure>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-3 sm:p-4">
          <div className="mb-4">
            <EnhanceInterestSection
              projectId={projectId}
              partyType={partyType}
              currentStatement={statement}
              authToken={authToken}
              onStatementUpdated={onStatementUpdated}
              showButton={false}
              externalTrigger={triggerEnhance}
            />
          </div>

          <div className="rounded-md bg-white p-4 text-gray-700 shadow-inner">
            <p className="whitespace-pre-wrap">{statement}</p>
          </div>
          
          <div className="mt-4 flex justify-end">
            {score === null ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={() =>
                    generateScoreMutation.mutate({
                      authToken,
                      projectId,
                      partyType,
                    })
                  }
                  disabled={generateScoreMutation.isPending}
                  icon={
                    generateScoreMutation.isPending ? (
                      <LoaderIcon size={16} />
                    ) : (
                      <ChartIcon size={16} />
                    )
                  }
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {generateScoreMutation.isPending
                    ? "Generating..."
                    : "Generate Score"}
                </Button>
              </div>
            ) : null}
            <Button
              variant="success"
              onClick={() => setTriggerEnhance((prev) => !prev)}
              icon={<SparklesIcon size={16} />}
              className="w-full whitespace-nowrap sm:ml-2 sm:w-auto"
              size="sm"
            >
              Enhance
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}