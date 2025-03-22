"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { SparklesIcon } from "@/components/ui/Icons";

type UpgradeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userTier?: string;
};

export function UpgradeDialog({
  isOpen,
  onClose,
  onUpgrade,
  userTier,
}: UpgradeDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <SparklesIcon className="h-6 w-6 text-primary-600" />
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="mt-4 text-center text-lg font-medium leading-6 text-gray-900"
                >
                  {userTier === "waitlist" ? "You're on the Premium Waitlist" : "Join Premium Waitlist"}
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-center text-sm text-gray-500">
                    {userTier === "waitlist" 
                      ? "Thank you for joining our premium waitlist! We'll notify you when premium access becomes available."
                      : "You've reached the limit of 2 projects on the free tier. Join our premium waitlist to be notified when premium access becomes available."}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-900">Premium Benefits:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited negotiation projects
                      </li>
                      <li className="flex items-center">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced negotiation analytics
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-500 italic">
                      We're currently in beta and will notify you when premium access becomes available.
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3">
                    {userTier !== "waitlist" ? (
                      <Button
                        onClick={onUpgrade}
                        className="w-full"
                        icon={<SparklesIcon size={16} />}
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={onClose}
                        className="w-full"
                      >
                        Got It
                      </Button>
                    )}
                    {userTier !== "waitlist" && (
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full"
                      >
                        Maybe Later
                      </Button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}