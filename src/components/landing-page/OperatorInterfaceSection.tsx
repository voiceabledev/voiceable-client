import { useState, useEffect } from "react";
import { ShoppingBag, Phone, Sparkles, ArrowRight, Heart, Home, Play, Pause, CheckCircle2, FileText, AlertCircle, Meh, Smile, Frown, RotateCcw, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AudioWaveformIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"/>
  </svg>
);

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Segment {
  id: string;
  label: string;
  tabs: Tab[];
}

interface TabExample {
  user: {
    name: string;
    location: string;
    time: string;
    avatar: string;
    message: string;
  };
  ai: {
    audioDuration: string;
    message: string;
  };
  metadata: {
    status: string;
    statusColor: string;
    priority: string;
    sentiment: string;
    sentimentIcon: LucideIcon;
    actions: string[];
    documents: string[];
  };
}

interface OperatorInterfaceSectionProps {
  segments?: Segment[];
  tabExamples?: Record<string, TabExample>;
}

// Default segments structure
const defaultSegments: Segment[] = [
  {
    id: "customer-service",
    label: "Customer Service",
    tabs: [
      { id: "reception", label: "Reception", icon: Phone },
      { id: "product_inquiry", label: "Product Inquiry", icon: Home },
    ]
  },
  {
    id: "retail-ecommerce",
    label: "Retail & E-commerce",
    tabs: [
      { id: "orders", label: "Orders", icon: ShoppingBag },
    ]
  },
  {
    id: "operations",
    label: "Operations",
    tabs: [
      { id: "triage", label: "Triage", icon: Sparkles },
      { id: "dispatch", label: "Dispatch", icon: ArrowRight },
    ]
  },
  {
    id: "engagement",
    label: "Engagement",
    tabs: [
      { id: "feedback", label: "Feedback", icon: Heart },
    ]
  },
];

// Default tab examples
const defaultTabExamples: Record<string, TabExample> = {
  orders: {
    user: {
      name: "Sarah",
      location: "Online Store",
      time: "2:15 PM EST",
      avatar: "S",
      message: "Hi, I placed an order yesterday for a blue sweater, order #12345. Can you tell me when it will ship? I need it by Friday for a gift."
    },
    ai: {
      audioDuration: "00:42",
      message: "Hi Sarah! I can see your order #12345 for the blue sweater. It's currently being processed and will ship today via express delivery. You should receive it by Thursday, which gives you plenty of time before Friday. I'll send you a tracking number via email once it ships. Is there anything else I can help you with?"
    },
    metadata: {
      status: "Processing",
      statusColor: "bg-blue-500",
      priority: "Medium",
      sentiment: "Interested",
      sentimentIcon: Smile,
      actions: [
        "Action: Order Status Checked",
        "Tracking Number Sent"
      ],
      documents: [
        "Docs: Order Details",
        "Shipping_Info_12345.pdf"
      ]
    }
  },
  reception: {
    user: {
      name: "Emma",
      location: "Customer Service",
      time: "9:30 AM EST",
      avatar: "E",
      message: "Good morning! I need to update my shipping address for my account and also check the status of my recent order."
    },
    ai: {
      audioDuration: "00:58",
      message: "Good morning Emma! I can help with both. I can see your recent order is currently being prepared for shipment. For updating your shipping address, I'll need your new address details. I can update that in your account right now. What's the new address you'd like to use?"
    },
    metadata: {
      status: "In Progress",
      statusColor: "bg-blue-500",
      priority: "Low",
      sentiment: "Neutral",
      sentimentIcon: Meh,
      actions: [
        "Action: Order Status Checked",
        "Address Update Initiated"
      ],
      documents: [
        "Docs: Customer Records",
        "Order_History_2024.pdf"
      ]
    }
  },
  triage: {
    user: {
      name: "Sofia",
      location: "Customer Support",
      time: "8:44 AM EST",
      avatar: "S",
      message: "Hello, I received my order but the item I got is different from what I ordered. The package says it's the right item but the contents are wrong."
    },
    ai: {
      audioDuration: "01:05",
      message: "Hi Sofia, I'm sorry about the mix-up with your order! Let me help resolve this right away. I can see your order details and I'll need to verify what you received versus what you ordered. Can you check the packing slip or invoice that came with the package? I can process a replacement order immediately with express shipping at no additional cost. Would you like me to start that process now?"
    },
    metadata: {
      status: "New Issue",
      statusColor: "bg-blue-500",
      priority: "Medium",
      sentiment: "Indifferent",
      sentimentIcon: Meh,
      actions: [
        "Action: Issue Ticket Created",
        "Triage Attempted"
      ],
      documents: [
        "Docs: Order Management",
        "Return_Process_Guide.pdf"
      ]
    }
  },
  dispatch: {
    user: {
      name: "David",
      location: "E-commerce",
      time: "10:12 AM EST",
      avatar: "D",
      message: "I placed an order 3 days ago and it still hasn't arrived. Can you check where my package is? Order number is 67890."
    },
    ai: {
      audioDuration: "00:52",
      message: "Hi David! I can see your order #67890. It was shipped yesterday and is currently in transit with our carrier. According to the tracking, it's scheduled for delivery today between 2-5 PM. I've just sent you the tracking link via text. You should receive a notification when it's out for delivery. Is there anything else I can help you with?"
    },
    metadata: {
      status: "In Transit",
      statusColor: "bg-yellow-500",
      priority: "Medium",
      sentiment: "Neutral",
      sentimentIcon: Meh,
      actions: [
        "Action: Tracking Provided",
        "Delivery Confirmed"
      ],
      documents: [
        "Docs: Shipping Records",
        "Order_67890_Tracking.pdf"
      ]
    }
  },
  feedback: {
    user: {
      name: "Lisa",
      location: "Online Store",
      time: "4:45 PM EST",
      avatar: "L",
      message: "I just received my order and I'm absolutely thrilled! The quality is even better than I expected, and the shipping was super fast. The packaging was also really nice. I'll definitely be ordering from you again!"
    },
    ai: {
      audioDuration: "00:38",
      message: "Thank you so much for that wonderful feedback, Lisa! I'm thrilled to hear about your positive experience with your order. I'll make sure to pass this along to our fulfillment team and management. Positive feedback like this really helps us recognize great work and motivates our team. We'd love to have you shop with us again soon! Is there anything else I can help you with today?"
    },
    metadata: {
      status: "Resolved",
      statusColor: "bg-green-500",
      priority: "Low",
      sentiment: "Positive",
      sentimentIcon: Smile,
      actions: [
        "Action: Feedback Logged",
        "Team Notified"
      ],
      documents: [
        "Docs: Customer Feedback",
        "Customer_Reviews_2024.pdf"
      ]
    }
  },
  product_inquiry: {
    user: {
      name: "Robert",
      location: "Online Store",
      time: "1:20 PM EST",
      avatar: "R",
      message: "I'm interested in the winter jacket you have. Can you tell me what sizes are available and if it's waterproof?"
    },
    ai: {
      audioDuration: "00:52",
      message: "Hi Robert! Great choice on the winter jacket. It's available in sizes small through XXL, and yes, it's fully waterproof with a breathable membrane. The jacket also features insulated lining for temperatures down to -10°F, adjustable cuffs, and a detachable hood. We have it in black, navy, and charcoal. Which size and color are you interested in? I can check current availability right now."
    },
    metadata: {
      status: "Answered",
      statusColor: "bg-blue-500",
      priority: "Low",
      sentiment: "Interested",
      sentimentIcon: Smile,
      actions: [
        "Action: Product Info Provided",
        "Inventory Checked"
      ],
      documents: [
        "Docs: Product Catalog",
        "Winter_Collection_2024.pdf"
      ]
    }
  }
};

const OperatorInterfaceSection = ({ 
  segments = defaultSegments, 
  tabExamples = defaultTabExamples 
}: OperatorInterfaceSectionProps) => {
  const [activeTab, setActiveTab] = useState(segments[0]?.tabs[0]?.id || "triage");
  const [isPlaying, setIsPlaying] = useState(false);
  const currentExample = tabExamples[activeTab] || tabExamples[Object.keys(tabExamples)[0]];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsPlaying(false); // Reset audio when switching tabs
  };

  // Reset audio when tab changes
  useEffect(() => {
    setIsPlaying(false);
  }, [activeTab]);

  // Helper function to determine if status should be highlighted
  const isStatusHighlighted = (tabId: string, status: string) => {
    // Check if current example's status matches
    const example = tabExamples[tabId];
    if (example && example.metadata.status === status) {
      return true;
    }
    // Fallback to default map for backward compatibility
    const highlightMap: Record<string, string[]> = {
      triage: ["New Issue"],
      orders: ["Processing"],
      reception: ["In Progress"],
      dispatch: ["In Transit"],
      feedback: ["Resolved"],
      product_inquiry: ["Answered"],
    };
    return highlightMap[tabId]?.includes(status) || false;
  };

  // Helper function to determine if action should be highlighted
  const isActionHighlighted = (tabId: string, action: string) => {
    // Check if current example's actions include this action
    const example = tabExamples[tabId];
    if (example && example.metadata.actions.includes(action)) {
      return true;
    }
    // Fallback to default map for backward compatibility
    const highlightMap: Record<string, string[]> = {
      triage: ["Action: Issue Ticket Created", "Triage Attempted"],
      orders: ["Action: Order Status Checked", "Tracking Number Sent"],
      reception: ["Action: Order Status Checked", "Address Update Initiated"],
      dispatch: ["Action: Tracking Provided", "Delivery Confirmed"],
      feedback: ["Action: Feedback Logged", "Team Notified"],
      product_inquiry: ["Action: Product Info Provided", "Inventory Checked"],
    };
    return highlightMap[tabId]?.includes(action) || false;
  };

  // Helper function to determine if document should be highlighted
  const isDocumentHighlighted = (tabId: string, doc: string) => {
    // Check if current example's documents include this document
    const example = tabExamples[tabId];
    if (example && example.metadata.documents.some(d => d.includes(doc) || doc.includes(d.replace("Docs: ", "").replace(".pdf", "")))) {
      return true;
    }
    // Fallback to default map for backward compatibility
    const highlightMap: Record<string, string[]> = {
      triage: ["Return_Process_Guide.pdf"],
      orders: ["Shipping_Info_12345.pdf"],
      reception: ["Order_History_2024.pdf"],
      dispatch: ["Order_67890_Tracking.pdf"],
      feedback: ["Customer_Reviews_2024.pdf"],
      product_inquiry: ["Winter_Collection_2024.pdf"],
    };
    return highlightMap[tabId]?.includes(doc) || false;
  };

  return (
    <section className="relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Interface Container */}
          <div className="border border-border bg-card overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="p-3 md:p-4 border-b border-border overflow-x-auto bg-muted/30 scrollbar-hide">
              <div className="flex items-center gap-3 md:gap-4 min-w-max">
                {segments.map((segment, segmentIndex) => (
                  <div key={segment.id} className="flex items-center gap-2 md:gap-3">
                    {segmentIndex > 0 && (
                      <div className="w-px h-8 bg-border/50 mx-1" />
                    )}
                    <div className="flex items-center gap-2">
                      {segment.tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                              relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-sm font-medium whitespace-nowrap
                              transition-all duration-200 flex-shrink-0
                              ${isActive 
                                ? "bg-secondary text-foreground shadow-sm border border-border" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                              }
                            `}
                            title={`${segment.label}: ${tab.label}`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                            <span className="font-medium">{tab.label}</span>
                            {isActive && (
                              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area - 50/50 Split */}
            <div className="grid grid-cols-12">
              {/* Left Side - Chat Area */}
              <div className="col-span-12 md:col-span-6 border-r border-border">
                <div className="flex flex-col min-h-[400px] md:min-h-[500px]">
                  {/* Audio Player - At Top */}
                  <div className="p-4 md:p-6 border-b border-border">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0"
                        aria-label={isPlaying ? "Pause audio" : "Play audio"}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-foreground fill-foreground" />
                        ) : (
                          <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: isPlaying ? '45%' : '0%' }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {currentExample.ai.audioDuration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-4 p-4 md:p-6 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* User Message */}
                        <div className="flex items-start gap-4 justify-end">
                          <div className="flex-1 flex flex-col items-end max-w-[80%]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">{currentExample.user.time}</span>
                              <span className="font-medium text-sm">
                                {currentExample.user.name} <span className="text-muted-foreground font-normal">| {currentExample.user.location}</span>
                              </span>
                            </div>
                            <div className="conversation-bubble-light w-full">
                              <p className="text-sm">
                                {currentExample.user.message}
                              </p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground text-xs font-medium">{currentExample.user.avatar}</span>
                          </div>
                        </div>

                        {/* Voice Agent Message */}
                        <div className="flex items-start gap-4 justify-start">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <AudioWaveformIcon />
                          </div>
                          <div className="flex-1 flex flex-col items-start max-w-[80%]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                Voice Agent
                              </span>
                              <span className="text-xs text-muted-foreground">| Audio {currentExample.ai.audioDuration}</span>
                            </div>
                            <div className="conversation-bubble w-full">
                              <p className="text-sm leading-relaxed">
                                {currentExample.ai.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Side - Metadata Content */}
              <div className="col-span-12 md:col-span-6 flex flex-col">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-[400px] md:min-h-[500px] flex flex-col justify-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Status, Priority, Sentiment - Same Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Status Button */}
                        <button className={`
                          flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-semibold
                          transition-all duration-200 relative
                          ${isStatusHighlighted(activeTab, currentExample.metadata.status)
                            ? "bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 text-primary border-2 border-primary/50 shadow-lg shadow-primary/20"
                            : "bg-muted/70 text-foreground border border-border hover:bg-muted"
                          }
                        `}>
                          {isStatusHighlighted(activeTab, currentExample.metadata.status) && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
                          )}
                          <RotateCcw className={`w-5 h-5 flex-shrink-0 ${isStatusHighlighted(activeTab, currentExample.metadata.status) ? "text-primary" : "text-foreground/70"}`} />
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-xs font-normal text-muted-foreground">Status</span>
                            <span className="text-sm font-semibold truncate w-full text-left">{currentExample.metadata.status}</span>
                          </div>
                        </button>

                        {/* Priority Button */}
                        <button className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-semibold bg-muted/70 text-foreground border border-border hover:bg-muted transition-all duration-200">
                          <AlertCircle className="w-5 h-5 text-foreground/70 flex-shrink-0" />
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-xs font-normal text-muted-foreground">Priority</span>
                            <span className="text-sm font-semibold truncate w-full text-left">{currentExample.metadata.priority}</span>
                          </div>
                        </button>

                        {/* Sentiment Button */}
                        <button className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-semibold bg-muted/70 text-foreground border border-border hover:bg-muted transition-all duration-200">
                          {(() => {
                            const SentimentIcon = currentExample.metadata.sentimentIcon;
                            return <SentimentIcon className="w-5 h-5 text-foreground/70 flex-shrink-0" />;
                          })()}
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-xs font-normal text-muted-foreground">Sentiment</span>
                            <span className="text-sm font-semibold truncate w-full text-left">{currentExample.metadata.sentiment}</span>
                          </div>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        {currentExample.metadata.actions.map((action, index) => {
                          const isChecked = isActionHighlighted(activeTab, action);
                          return (
                            <button
                              key={index}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200 relative
                                ${isChecked
                                  ? "bg-gradient-to-r from-green-500/30 via-green-500/20 to-green-500/10 text-green-600 dark:text-green-400 border-2 border-green-500/50 shadow-lg shadow-green-500/20"
                                  : "bg-muted/50 text-foreground border border-border hover:bg-muted"
                                }
                              `}
                            >
                              {isChecked && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg" />
                              )}
                              <CheckCircle2 className={`w-4 h-4 ${isChecked ? "text-green-600 dark:text-green-400 fill-green-500/30" : "text-muted-foreground"}`} />
                              <span className="text-left flex-1">
                                {action.includes("Action:") ? (
                                  <>
                                    Action: <span className="font-medium">{action.replace("Action: ", "")}</span>
                                  </>
                                ) : (
                                  action
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Documents */}
                      <div className="space-y-2 pt-2">
                        {currentExample.metadata.documents.map((doc, index) => {
                          const isChecked = isDocumentHighlighted(activeTab, doc);
                          return (
                            <button
                              key={index}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200 relative
                                ${isChecked
                                  ? "bg-gradient-to-r from-blue-500/30 via-blue-500/20 to-blue-500/10 text-blue-600 dark:text-blue-400 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                                  : "bg-muted/50 text-foreground border border-border hover:bg-muted"
                                }
                              `}
                            >
                              {isChecked && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                              )}
                              <FileText className={`w-4 h-4 ${isChecked ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
                              <span className="text-left flex-1">
                                {doc.includes("Docs:") ? (
                                  <>
                                    Docs: <span className="font-medium">{doc.replace("Docs: ", "")}</span>
                                  </>
                                ) : (
                                  <span className="font-medium">{doc}</span>
                                )}
                              </span>
                              {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-500/30" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OperatorInterfaceSection;

