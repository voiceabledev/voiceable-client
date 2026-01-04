import { User, Clock } from "lucide-react";

const calls = [
  { type: "Customer", location: "in Ypsilanti", topic: "Order Status", status: "Resolved", time: "11 min ago", duration: "260 sec" },
  { type: "Diner", location: "in Portland", topic: "Reservation", status: "Unresolved", time: "26 min ago", duration: "205 sec" },
  { type: "Shopper", location: "in New York", topic: "Returns", status: "Unresolved", time: "14 min ago", duration: "339 sec" },
  { type: "Customer", location: "in Ann Arbor", topic: "Shipping", status: "Unresolved", time: "16 min ago", duration: "3518 sec" },
  { type: "Guest", location: "in New York", topic: "Menu Inquiry", status: "Resolved", time: "16 min ago", duration: "249 sec" },
  { type: "Customer", location: "in Ypsilanti", topic: "Product Inquiry", status: "Unresolved", time: "23 min ago", duration: "1807 sec" },
  { type: "Diner", location: "in Chicago", topic: "Delivery", status: "Resolved", time: "13 min ago", duration: "207 sec" },
  { type: "Shopper", location: "in Chicago", topic: "Payment Issue", status: "In Progress", time: "8 min ago", duration: "292 sec" },
];

const LiveCallsSection = () => {
  return (
    <section className="overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-muted-foreground">
          Real calls happening right now...
        </h2>
      </div>

      {/* Scrolling calls */}
      <div className="relative">
        <div className="flex gap-4 animate-scroll-left">
          {[...calls, ...calls].map((call, index) => (
            <div 
              key={index}
              className="flex-shrink-0 bg-card rounded-2xl border border-border p-4 min-w-[280px]"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{call.type} {call.location}</span>
                </div>
                <span className={`
                  text-xs px-2 py-1 rounded-full flex-shrink-0
                  ${call.status === "Resolved" ? "bg-green/20 text-green" : ""}
                  ${call.status === "Unresolved" ? "bg-pink/20 text-pink" : ""}
                  ${call.status === "In Progress" ? "bg-amber/20 text-amber" : ""}
                `}>
                  {call.status === "Resolved" && "✓ "}
                  {call.status === "Unresolved" && "✕ "}
                  {call.status === "In Progress" && "→ "}
                  {call.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Called about <span className="px-2 py-0.5 rounded bg-muted">{call.topic}</span></span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{call.time}</span>
                <span>·</span>
                <span>{call.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveCallsSection;

