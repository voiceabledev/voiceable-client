import EscalationsList from '@/components/escalations/EscalationsList';

export default function Escalations() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escalations</h1>
        <p className="text-muted-foreground">
          Manage human handoff events and escalations
        </p>
      </div>
      <EscalationsList />
    </div>
  );
}

