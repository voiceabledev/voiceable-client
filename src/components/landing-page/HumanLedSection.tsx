import { Users, Voicemail, FlaskConical } from "lucide-react";

const HumanLedSection = () => {
  return (
    <section id="human" className="pb-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="feature-pill mb-8 inline-flex">
            <Users className="w-4 h-4" />
            <span>Human Controlled</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-gradient-amber">AI</span> meets{" "}
            <span className="text-gradient-purple">human</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            <span className="text-primary">Voiceable</span> is designed to enhance team productivity by
            eliminating the manual and repetitive tasks, so you can
            focus on providing a more personal high-touch
            experience.
          </p>
        </div>

        {/* Feature blocks */}
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">AI</div>
            <h3 className="text-xl font-semibold mb-2">Safeguards & Guardrails</h3>
            <p className="text-muted-foreground">
              When Voiceable encounters uncertainty, it proactively flags the issue and waits for
              human guidance.
            </p>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">HUMAN</div>
            <h3 className="text-xl font-semibold mb-2">User Powered</h3>
            <p className="text-muted-foreground">
              Voiceable identifies the optimal next steps and waits for user approval before executing
              irreversible actions.
            </p>
          </div>
        </div>

        {/* Bottom features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Voicemail className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Call Recording</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Every conversation is
              automatically captured,
              transcribed, and indexed so
              you can search, audit, &
              iterate.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Test Before Launch</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Run real-world simulations
              to stress-test workflows and
              fix gaps before tenants ever
              pick up the phone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanLedSection;

