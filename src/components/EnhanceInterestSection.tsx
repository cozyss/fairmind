"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import { SparklesIcon, LoaderIcon, InfoIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export function EnhanceInterestSection({
  projectId,
  partyType,
  currentStatement,
  authToken,
  onStatementUpdated,
  showButton = true,
  externalTrigger = false,
}: {
  projectId: number;
  partyType: "A" | "B";
  currentStatement: string;
  authToken: string;
  onStatementUpdated: () => void;
  showButton?: boolean;
  externalTrigger?: boolean;
}) {
  // State for the enhancement process
  const [enhancementState, setEnhancementState] = useState<
    "idle" | "generatingQuestion" | "waitingForAnswer" | "enhancing"
  >("idle");
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    explanation: string;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");

  // tRPC mutations
  const generateQuestionMutation = api.generateEnhancementQuestion.useMutation({
    onSuccess: (data) => {
      setCurrentQuestion(data);
      setEnhancementState("waitingForAnswer");
    },
    onError: (error) => {
      toast.error(`Failed to generate question: ${error.message}`);
      setEnhancementState("idle");
    },
  });

  const enhanceStatementMutation = api.enhanceInterestStatement.useMutation({
    onSuccess: () => {
      toast.success("Interest statement enhanced successfully!");
      setEnhancementState("idle");
      setCurrentQuestion(null);
      setUserAnswer("");
      onStatementUpdated(); // Refresh the parent component to show the updated statement
    },
    onError: (error) => {
      toast.error(`Failed to enhance statement: ${error.message}`);
      setEnhancementState("waitingForAnswer"); // Go back to waiting for answer state
    },
  });

  // Handle button click to start the enhancement process
  const handleEnhanceClick = () => {
    setEnhancementState("generatingQuestion");
    generateQuestionMutation.mutate({
      authToken,
      projectId,
      partyType,
    });
  };

  // Handle external trigger
  useEffect(() => {
    if (externalTrigger && enhancementState === "idle") {
      handleEnhanceClick();
    }
  }, [externalTrigger]);

  // Handle submission of the user's answer
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer to the question");
      return;
    }

    if (!currentQuestion) {
      toast.error("No question to answer");
      return;
    }

    setEnhancementState("enhancing");
    enhanceStatementMutation.mutate({
      authToken,
      projectId,
      partyType,
      originalStatement: currentStatement,
      question: currentQuestion.question,
      answer: userAnswer,
    });
  };

  return (
    <div className={enhancementState === "idle" ? "" : "mt-2"}>
      {enhancementState === "idle" && showButton && (
        <Button
          onClick={handleEnhanceClick}
          variant="success"
          icon={<SparklesIcon size={16} />}
          className="w-full sm:w-auto"
        >
          Enhance Interest Statement
        </Button>
      )}

      {enhancementState === "generatingQuestion" && (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-center">
            <LoaderIcon size={18} className="mr-3 text-blue-600" />
            <span className="font-medium">Analyzing the interest statement...</span>
          </div>
          <p className="mt-2 pl-8">
            We're identifying areas where the statement could be improved for better negotiation outcomes.
          </p>
        </div>
      )}

      {enhancementState === "waitingForAnswer" && currentQuestion && (
        <div className="animate-fadeIn overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-green-800">
                Enhance Your Interest Statement
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEnhancementState("idle");
                  setCurrentQuestion(null);
                  setUserAnswer("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="font-medium text-green-800">{currentQuestion.question}</p>
              <div className="mt-3 flex items-start">
                <InfoIcon size={16} className="mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                <p className="text-sm text-green-700">
                  <span className="font-medium">Why this matters: </span>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="answer" className="mb-1 block text-sm font-medium text-gray-700">
                Your Answer
              </label>
              <textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full rounded-md border border-gray-300 p-3 text-gray-700 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                variant="success"
                icon={<SparklesIcon size={16} />}
              >
                Enhance Statement
              </Button>
            </div>
          </div>
        </div>
      )}

      {enhancementState === "enhancing" && (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-center">
            <LoaderIcon size={18} className="mr-3 text-blue-600" />
            <span className="font-medium">Enhancing the interest statement...</span>
          </div>
          <p className="mt-2 pl-8">
            We're improving the statement based on your answer to create a more effective negotiation position.
          </p>
        </div>
      )}
    </div>
  );
}