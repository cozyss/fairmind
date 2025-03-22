"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { createPortal } from "react-dom";

type HoverDisclosureProps = {
  children: ReactNode;
  trigger: ReactNode;
  className?: string;
  contentClassName?: string;
  position?: "top" | "right" | "bottom" | "left" | "auto";
};

export function HoverDisclosure({
  children,
  trigger,
  className = "",
  contentClassName = "",
  position = "auto",
}: HoverDisclosureProps) {
  const [isShowing, setIsShowing] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<"top" | "right" | "bottom" | "left">("bottom");
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Create portal container when component mounts
  useEffect(() => {
    // Only create the portal container in the browser
    if (typeof window !== "undefined") {
      // Check if portal container already exists
      let container = document.getElementById("hover-disclosure-portal");
      if (!container) {
        container = document.createElement("div");
        container.id = "hover-disclosure-portal";
        container.style.position = "fixed";
        container.style.zIndex = "9999";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "0";
        container.style.height = "0";
        container.style.overflow = "visible";
        document.body.appendChild(container);
      }
      setPortalContainer(container);
    }

    // Clean up portal container on unmount
    return () => {
      // We don't remove the container as other components might be using it
    };
  }, []);
  
  // Calculate the best position for the tooltip based on available space
  useEffect(() => {
    if (isShowing && triggerRef.current && contentRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        const contentRect = contentRef.current?.getBoundingClientRect();
        
        if (!triggerRect || !contentRect) return;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate content dimensions
        const contentWidth = contentRect.width;
        const contentHeight = contentRect.height;
        
        // Calculate trigger center point
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        
        // Calculate available space in each direction
        const spaceAbove = triggerRect.top;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewportWidth - triggerRect.right;
        
        // If position is specified and not "auto", use that position if possible
        if (position !== "auto") {
          // Check if the specified position has enough space
          const hasEnoughSpace = {
            top: spaceAbove >= contentHeight,
            bottom: spaceBelow >= contentHeight,
            left: spaceLeft >= contentWidth,
            right: spaceRight >= contentWidth
          };
          
          // If the specified position has enough space, use it
          if (hasEnoughSpace[position]) {
            setCalculatedPosition(position);
            return;
          }
          // Otherwise, fall back to auto positioning
        }
        
        // For auto positioning, check which directions have enough space
        const hasEnoughSpace = {
          top: spaceAbove >= contentHeight,
          bottom: spaceBelow >= contentHeight,
          left: spaceLeft >= contentWidth,
          right: spaceRight >= contentWidth
        };
        
        // Preferred order: bottom, top, right, left
        const preferredOrder: Array<"top" | "right" | "bottom" | "left"> = ["bottom", "top", "right", "left"];
        
        // Find the first position in the preferred order that has enough space
        const preferredPosition = preferredOrder.find(pos => hasEnoughSpace[pos]);
        
        if (preferredPosition) {
          setCalculatedPosition(preferredPosition);
          return;
        }
        
        // If no position has enough space, use the one with the most space
        const spaces = [
          { position: "bottom" as const, space: spaceBelow },
          { position: "top" as const, space: spaceAbove },
          { position: "right" as const, space: spaceRight },
          { position: "left" as const, space: spaceLeft }
        ];
        
        // Sort by available space (descending)
        spaces.sort((a, b) => b.space - a.space);
        
        // Use the position with the most space
        setCalculatedPosition(spaces[0].position);
      };
      
      updatePosition();
      
      // Update position on window resize
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isShowing, position]);
  
  // Get positioning styles based on calculated position
  const getPositionStyles = () => {
    if (!triggerRef.current) {
      return { top: 0, left: 0 };
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    // Calculate trigger center point
    const triggerCenterX = triggerRect.left;
    const triggerCenterY = triggerRect.top;
    
    switch (calculatedPosition) {
      case "top":
        return { 
          top: triggerCenterY - 8, 
          left: triggerCenterX + triggerRect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case "right":
        return { 
          top: triggerCenterY + triggerRect.height / 2, 
          left: triggerCenterX + triggerRect.width + 8,
          transform: 'translateY(-50%)'
        };
      case "bottom":
        return { 
          top: triggerCenterY + triggerRect.height + 8, 
          left: triggerCenterX + triggerRect.width / 2,
          transform: 'translateX(-50%)'
        };
      case "left":
        return { 
          top: triggerCenterY + triggerRect.height / 2, 
          left: triggerCenterX - 8,
          transform: 'translate(-100%, -50%)'
        };
      default:
        return { 
          top: triggerCenterY + triggerRect.height + 8, 
          left: triggerCenterX + triggerRect.width / 2,
          transform: 'translateX(-50%)'
        };
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsShowing(true)}
        onMouseLeave={() => setIsShowing(false)}
        onFocus={() => setIsShowing(true)}
        onBlur={() => setIsShowing(false)}
        tabIndex={0}
      >
        {trigger}
      </div>

      {portalContainer && createPortal(
        <Transition
          show={isShowing}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
          className={`fixed z-50 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 ${contentClassName}`}
          style={{
            ...getPositionStyles(),
            maxWidth: "90vw",
            width: contentClassName.includes("w-") ? undefined : "max-content",
            maxHeight: "80vh",
            overflowY: "auto"
          }}
          ref={contentRef}
        >
          {children}
        </Transition>,
        portalContainer
      )}
    </div>
  );
}