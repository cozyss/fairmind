"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { api } from "@/trpc/react";
import { InterestStatementCard } from "@/components/InterestStatementCard";
import { ObjectiveCriterionCard } from "@/components/ObjectiveCriterionCard";
import { ResponseSuggestionCard } from "@/components/ResponseSuggestionCard";
import { NegotiationOptionCard } from "@/components/NegotiationOptionCard";
import { Tabs } from "@/components/ui/Tabs";
import { TabPanel } from "@/components/ui/TabPanel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProjectDetailsSkeleton } from "@/components/ui/Skeleton";
import {
  SparklesIcon,
  CalendarIcon,
  LoaderIcon,
  RefreshIcon,
  MessageSquareIcon,
  ImageIcon,
  ChartIcon,
  HandshakeIcon,
  LightbulbIcon,
  InfoIcon,
} from "@/components/ui/Icons";
import { ScoreIndicator } from "@/components/ui/ScoreIndicator";
import { Badge } from "@/components/ui/Badge";
import { HoverDisclosure } from "@/components/ui/HoverDisclosure";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

export default function ProjectDetailsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const [cookies] = useCookies(["authToken"]);
  const [responseSuggestions, setResponseSuggestions] = useState<Array<{
    title: string;
    content: string;
    reasoning: string;
  }> | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "screenshot">("text");
  const [shouldSearchCriteria, setShouldSearchCriteria] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<{
    otherPartyResponse: string;
  }>();

  const otherPartyResponse = watch("otherPartyResponse");

  const projectQuery = api.getProjectDetails.useQuery(
    {
      authToken: cookies.authToken,
      projectId: parseInt(params.projectId),
    },
    {
      enabled: !!cookies.authToken,
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/login");
        } else {
          toast.error(error.message);
        }
      },
    },
  );

  useEffect(() => {
    // If project data is loaded and has objective criteria, enable the criteria query
    if (projectQuery.data?.project.objectiveCriteria) {
      setShouldSearchCriteria(true);
    }
  }, [projectQuery.data]);

  const objectiveCriteriaQuery = api.getObjectiveCriteria.useQuery(
    {
      authToken: cookies.authToken,
      projectId: parseInt(params.projectId),
    },
    {
      enabled: !!cookies.authToken && shouldSearchCriteria,
      refetchOnWindowFocus: false,
      onError: (error) => {
        toast.error(`Failed to fetch objective criteria: ${error.message}`);
      },
    },
  );

  const generateOptionsMutation = api.generateProjectOptions.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateResponseSuggestionsMutation =
    api.generateResponseSuggestions.useMutation({
      onSuccess: (data) => {
        setResponseSuggestions(data.suggestions);
        toast.success("Response suggestions generated successfully!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read the image");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!cookies.authToken) {
    router.push("/login");
    return null;
  }

  const handleGenerateOptions = () => {
    generateOptionsMutation.mutate({
      authToken: cookies.authToken,
      projectId: parseInt(params.projectId),
    });
  };

  const onSubmitResponse = (data: { otherPartyResponse: string }) => {
    generateResponseSuggestionsMutation.mutate({
      authToken: cookies.authToken,
      projectId: parseInt(params.projectId),
      otherPartyResponse:
        inputMethod === "text" ? data.otherPartyResponse : undefined,
      screenshot:
        inputMethod === "screenshot" ? screenshot || undefined : undefined,
    });
  };

  // Define tabs for the interface
  const tabs = [
    {
      id: "interests",
      label: "Interests",
      icon: <LightbulbIcon size={18} />,
    },
    {
      id: "respond",
      label: "Responses",
      icon: <MessageSquareIcon size={18} />,
    },
    {
      id: "criteria",
      label: "Criteria",
      icon: <ChartIcon size={18} />,
    },
    {
      id: "options",
      label: "Options",
      icon: <HandshakeIcon size={18} />,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <HandshakeIcon size={24} />
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-xl font-bold capitalize text-gray-900 sm:text-2xl md:text-3xl">
                    {projectQuery.data?.project.name || "Project Details"}
                  </h1>
                  {projectQuery.data && (
                    <HoverDisclosure
                      trigger={
                        <div className="ml-2 cursor-help text-gray-400 hover:text-gray-600">
                          <InfoIcon size={18} />
                        </div>
                      }
                      contentClassName="w-80"
                    >
                      <div className="p-2">
                        <h5 className="mb-2 font-medium">
                          Project Information
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <CalendarIcon
                              size={14}
                              className="mr-2 text-gray-500"
                            />
                            <span>
                              Created:{" "}
                              {new Date(
                                projectQuery.data.project.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon
                              size={14}
                              className="mr-2 text-gray-500"
                            />
                            <span>
                              Updated:{" "}
                              {new Date(
                                projectQuery.data.project.updatedAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverDisclosure>
                  )}
                </div>
                {projectQuery.data && (
                  <div className="mt-1 flex items-center">
                    <p className="text-sm text-gray-500">
                      Negotiation between
                      <span className="mx-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                        {projectQuery.data.project.partyAName}
                      </span>
                      and
                      <span className="mx-1 rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">
                        {projectQuery.data.project.partyBName}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              size="sm"
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {projectQuery.isPending ? (
          <div className="animate-fadeIn">
            <ProjectDetailsSkeleton />
          </div>
        ) : projectQuery.error ? (
          <Card className="border border-red-100 bg-red-50 p-6">
            <div className="text-center text-red-600">
              <h3 className="mb-2 font-semibold">Error Loading Project</h3>
              <p className="text-sm">{projectQuery.error.message}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => projectQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : (
          <div className="animate-fadeIn">
            <Tabs
              tabs={tabs}
              sticky={true}
              stickyOffset="0"
              tabsClassName="px-4 py-1 rounded-t-lg"
            >
              {/* Interest Statements Tab */}
              <TabPanel className="pt-2">
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Your Interests (Party A) */}
                    <InterestStatementCard
                      projectId={parseInt(params.projectId)}
                      partyType="A"
                      partyName={projectQuery.data.project.partyAName || "Your"}
                      statement={projectQuery.data.project.partyA}
                      score={projectQuery.data.project.partyAScore}
                      scoreReasoning={
                        projectQuery.data.project.partyAScoreReasoning
                      }
                      authToken={cookies.authToken}
                      onStatementUpdated={() => projectQuery.refetch()}
                      isYou={true}
                    />

                    {/* Other Party's Interests (Party B) */}
                    <InterestStatementCard
                      projectId={parseInt(params.projectId)}
                      partyType="B"
                      partyName={
                        projectQuery.data.project.partyBName ||
                        "The other Party's"
                      }
                      statement={projectQuery.data.project.partyB}
                      score={projectQuery.data.project.partyBScore}
                      scoreReasoning={
                        projectQuery.data.project.partyBScoreReasoning
                      }
                      authToken={cookies.authToken}
                      onStatementUpdated={() => projectQuery.refetch()}
                    />
                  </div>

                  <Card className="border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start">
                      <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <InfoIcon size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Understanding Interest Statements
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Interest statements express what each party truly
                          needs, not just their positions. Strong statements
                          focus on underlying interests, separate people from
                          problems, and create opportunities for mutual gain.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              {/* Response Suggestions Tab */}
              <TabPanel className="pt-2">
                <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardHeader className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center">
                      <MessageSquareIcon
                        size={20}
                        className="mr-2 text-primary-500"
                      />
                      <div>
                        <CardTitle className="text-base sm:text-lg">
                          How to Respond
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Get AI-generated response suggestions based on{" "}
                          {projectQuery.data?.project.partyBName ||
                            "the other party's"}{" "}
                          latest message
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <form
                      onSubmit={handleSubmit(onSubmitResponse)}
                      className="space-y-4"
                    >
                      <div className="mb-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div
                            className={`flex-1 cursor-pointer rounded-md border p-4 transition-all duration-200 ${
                              inputMethod === "text"
                                ? "border-primary-500 bg-primary-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                            onClick={() => setInputMethod("text")}
                          >
                            <div className="flex items-center">
                              <div
                                className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ${
                                  inputMethod === "text"
                                    ? "border-primary-500"
                                    : "border-gray-400"
                                }`}
                              >
                                {inputMethod === "text" && (
                                  <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <MessageSquareIcon
                                  size={18}
                                  className={`mr-2 transition-colors duration-200 ${inputMethod === "text" ? "text-primary-500" : "text-gray-500"}`}
                                />
                                <span
                                  className={`font-medium transition-colors duration-200 ${inputMethod === "text" ? "text-primary-700" : "text-gray-700"}`}
                                >
                                  Enter text response
                                </span>
                              </div>
                            </div>
                            <p className="ml-8 mt-1 text-xs text-gray-500">
                              Type what{" "}
                              {projectQuery.data?.project.partyBName ||
                                "the other party"}{" "}
                              said
                            </p>
                          </div>

                          <div
                            className={`flex-1 cursor-pointer rounded-md border p-4 transition-all duration-200 ${
                              inputMethod === "screenshot"
                                ? "border-primary-500 bg-primary-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                            onClick={() => setInputMethod("screenshot")}
                          >
                            <div className="flex items-center">
                              <div
                                className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ${
                                  inputMethod === "screenshot"
                                    ? "border-primary-500"
                                    : "border-gray-400"
                                }`}
                              >
                                {inputMethod === "screenshot" && (
                                  <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <ImageIcon
                                  size={18}
                                  className={`mr-2 transition-colors duration-200 ${inputMethod === "screenshot" ? "text-primary-500" : "text-gray-500"}`}
                                />
                                <span
                                  className={`font-medium transition-colors duration-200 ${inputMethod === "screenshot" ? "text-primary-700" : "text-gray-700"}`}
                                >
                                  Upload screenshot
                                </span>
                              </div>
                            </div>
                            <p className="ml-8 mt-1 text-xs text-gray-500">
                              Upload an image of your conversation
                            </p>
                          </div>
                        </div>
                      </div>

                      {inputMethod === "text" && (
                        <div>
                          <label
                            htmlFor="otherPartyResponse"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            {projectQuery.data?.project.partyBName ||
                              "The other party's"}{" "}
                            latest response:
                          </label>
                          <textarea
                            id="otherPartyResponse"
                            rows={4}
                            className="w-full rounded-md border border-gray-300 p-3 text-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder={`Enter what ${projectQuery.data?.project.partyBName || "the other party"} said...`}
                            {...register("otherPartyResponse", {
                              required:
                                inputMethod === "text"
                                  ? "Please enter the other party's response"
                                  : false,
                            })}
                          ></textarea>
                          {errors.otherPartyResponse && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.otherPartyResponse.message}
                            </p>
                          )}
                        </div>
                      )}

                      {inputMethod === "screenshot" && (
                        <div>
                          <div className="flex items-center justify-between">
                            {screenshot && (
                              <button
                                type="button"
                                onClick={removeScreenshot}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <input
                            type="file"
                            id="screenshot"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {screenshot ? (
                            <div className="relative mt-2">
                              <div className="relative h-48 w-full overflow-hidden rounded-md border border-gray-300">
                                <Image
                                  src={screenshot}
                                  alt="Chat screenshot"
                                  fill
                                  style={{ objectFit: "contain" }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 flex justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="md"
                                icon={
                                  isUploading ? (
                                    <LoaderIcon size={16} />
                                  ) : (
                                    <ImageIcon size={16} />
                                  )
                                }
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-auto"
                              >
                                {isUploading
                                  ? "Uploading..."
                                  : "Upload Screenshot"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={
                          generateResponseSuggestionsMutation.isPending ||
                          (inputMethod === "text" && !otherPartyResponse) ||
                          (inputMethod === "screenshot" && !screenshot)
                        }
                        icon={
                          generateResponseSuggestionsMutation.isPending ? (
                            <LoaderIcon size={16} />
                          ) : (
                            <SparklesIcon size={16} />
                          )
                        }
                        className="w-full sm:w-auto"
                      >
                        {generateResponseSuggestionsMutation.isPending
                          ? "Generating Suggestions..."
                          : "Generate Response Suggestions"}
                      </Button>
                    </form>

                    {responseSuggestions && (
                      <div className="animate-fadeIn mt-6 space-y-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          Suggested Responses
                        </h3>
                        <div className="space-y-2">
                          {responseSuggestions.map((suggestion, index) => (
                            <ResponseSuggestionCard
                              key={index}
                              title={suggestion.title}
                              content={suggestion.content}
                              reasoning={suggestion.reasoning}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Objective Criteria Tab */}
              <TabPanel className="pt-2">
                <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardHeader className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChartIcon
                          size={20}
                          className="mr-2 text-primary-500"
                        />
                        <div>
                          <CardTitle className="text-base sm:text-lg">
                            Objective Criteria
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Standards, benchmarks, and precedents that can help
                            establish a fair agreement
                          </p>
                        </div>
                      </div>
                      <HoverDisclosure
                        trigger={
                          <div className="cursor-help text-gray-400 hover:text-gray-600">
                            <InfoIcon size={18} />
                          </div>
                        }
                        contentClassName="w-80"
                      >
                        <div className="p-2">
                          <h5 className="mb-2 font-medium">
                            About Objective Criteria
                          </h5>
                          <p className="text-sm text-gray-600">
                            Objective criteria are external standards that both
                            parties can use as a reference point for fair
                            negotiations. They help move beyond subjective
                            opinions to reach agreements based on legitimate
                            standards.
                          </p>
                        </div>
                      </HoverDisclosure>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    {!shouldSearchCriteria ? (
                      <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
                        <ChartIcon size={40} className="mb-4 text-gray-300" />
                        <p className="mb-6 text-center text-gray-600">
                          Find objective standards and benchmarks to support
                          your negotiation
                        </p>
                        <Button
                          onClick={() => setShouldSearchCriteria(true)}
                          icon={<SparklesIcon size={16} />}
                          size="lg"
                          className="w-full sm:w-auto"
                        >
                          Search for Objective Criteria
                        </Button>
                      </div>
                    ) : objectiveCriteriaQuery.isPending ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <LoaderIcon
                          size={32}
                          className="mb-4 text-primary-500"
                        />
                        <p className="text-center text-gray-600">
                          Searching for objective criteria...
                        </p>
                      </div>
                    ) : objectiveCriteriaQuery.error ? (
                      <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 py-12">
                        <div className="mb-4 text-center text-red-500">
                          <p className="font-medium">
                            Failed to fetch objective criteria
                          </p>
                          <p className="text-sm">
                            {objectiveCriteriaQuery.error.message}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => objectiveCriteriaQuery.refetch()}
                          icon={<RefreshIcon size={16} />}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                          <Button
                            onClick={() => objectiveCriteriaQuery.refetch()}
                            variant="outline"
                            size="sm"
                            icon={
                              objectiveCriteriaQuery.isFetching ? (
                                <LoaderIcon size={16} />
                              ) : (
                                <RefreshIcon size={16} />
                              )
                            }
                            disabled={objectiveCriteriaQuery.isFetching}
                            className="w-full sm:w-auto"
                          >
                            {objectiveCriteriaQuery.isFetching
                              ? "Refreshing..."
                              : "Refresh Criteria"}
                          </Button>
                        </div>

                        {objectiveCriteriaQuery.data?.criteria.length === 0 ? (
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800">
                            <p>
                              No objective criteria found for this negotiation
                              topic.
                            </p>
                            <p className="mt-2 text-sm">
                              Try refreshing or modifying the interest
                              statements to be more specific.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {objectiveCriteriaQuery.data?.criteria.map(
                              (criterion, index) => (
                                <ObjectiveCriterionCard
                                  key={index}
                                  title={criterion.title}
                                  description={criterion.description}
                                  source={criterion.source}
                                  relevance={criterion.relevance}
                                  index={index}
                                />
                              ),
                            )}
                          </div>
                        )}

                        {/* Display raw content as fallback if criteria parsing failed but we have content */}
                        {objectiveCriteriaQuery.data?.criteria.length === 0 &&
                          objectiveCriteriaQuery.data?.rawContent && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                              <h4 className="mb-2 font-medium text-gray-800">
                                Raw Criteria Data
                              </h4>
                              <div className="whitespace-pre-wrap text-sm text-gray-700">
                                {objectiveCriteriaQuery.data.rawContent}
                              </div>
                            </div>
                          )}

                        {objectiveCriteriaQuery.data?.citations &&
                          objectiveCriteriaQuery.data.citations.length > 0 && (
                            <div className="mt-6">
                              <CollapsibleSection
                                title="Sources"
                                defaultOpen={false}
                              >
                                <ul className="mt-1 list-inside space-y-1">
                                  {objectiveCriteriaQuery.data.citations.map(
                                    (citation, index) => (
                                      <li
                                        key={index}
                                        className="overflow-hidden text-ellipsis"
                                      >
                                        <a
                                          href={citation}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                          {new URL(citation).hostname}:{" "}
                                          {citation.length > 60
                                            ? citation.substring(0, 60) + "..."
                                            : citation}
                                        </a>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </CollapsibleSection>
                            </div>
                          )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Negotiation Options Tab */}
              <TabPanel className="pt-2">
                <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardHeader className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HandshakeIcon
                          size={20}
                          className="mr-2 text-primary-500"
                        />
                        <div>
                          <CardTitle className="text-base sm:text-lg">
                            Negotiation Options
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {projectQuery.data?.project.options &&
                            projectQuery.data.project.options.length > 0
                              ? "Options based on both your and the other party's interests"
                              : "Generate potential options based on both your and the other party's interests"}
                          </p>
                        </div>
                      </div>
                      <HoverDisclosure
                        trigger={
                          <div className="cursor-help text-gray-400 hover:text-gray-600">
                            <InfoIcon size={18} />
                          </div>
                        }
                        contentClassName="w-80"
                      >
                        <div className="p-2">
                          <h5 className="mb-2 font-medium">
                            About Negotiation Options
                          </h5>
                          <p className="text-sm text-gray-600">
                            Negotiation options are creative solutions that
                            address the interests of both parties. The best
                            options create mutual gains where both sides benefit
                            more than they would from a simple compromise.
                          </p>
                        </div>
                      </HoverDisclosure>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    {projectQuery.data?.project.options &&
                    projectQuery.data.project.options.length > 0 &&
                    !generateOptionsMutation.data ? (
                      <>
                        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                          <h3 className="flex items-center text-base font-medium text-gray-800 sm:text-lg">
                            <SparklesIcon
                              size={18}
                              className="mr-2 text-primary-500"
                            />
                            Generated Options
                          </h3>
                          <Button
                            onClick={handleGenerateOptions}
                            variant="outline"
                            size="sm"
                            icon={<RefreshIcon size={16} />}
                            className="w-full sm:w-auto"
                          >
                            Regenerate
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {projectQuery.data.project.options.map(
                            (option, index) => (
                              <NegotiationOptionCard
                                key={index}
                                option={option}
                                index={index}
                              />
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
                          <HandshakeIcon
                            size={40}
                            className="mb-4 text-gray-300"
                          />
                          <p className="mb-6 text-center text-gray-600">
                            Generate creative options that could satisfy both
                            parties' interests
                          </p>
                          <Button
                            onClick={handleGenerateOptions}
                            disabled={generateOptionsMutation.isPending}
                            icon={
                              generateOptionsMutation.isPending ? (
                                <LoaderIcon size={16} />
                              ) : (
                                <SparklesIcon size={16} />
                              )
                            }
                            size="lg"
                            className="w-full sm:w-auto"
                          >
                            {generateOptionsMutation.isPending
                              ? "Generating Options..."
                              : "Generate Options"}
                          </Button>
                        </div>

                        {generateOptionsMutation.data && (
                          <div className="animate-fadeIn mt-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-800">
                              Generated Options
                            </h3>
                            <div className="space-y-2">
                              {generateOptionsMutation.data.options.map(
                                (option, index) => (
                                  <NegotiationOptionCard
                                    key={index}
                                    option={option}
                                    index={index}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </div>
    </main>
  );
}
