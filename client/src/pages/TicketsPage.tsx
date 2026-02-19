import TicketsTable from "./TicketsTable";

export default function TicketsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
      </div>
      <TicketsTable />
    </div>
  );
}
