type AddSupplementRowProps = {
  name: string;
  dosage: string;
  setName: (value: string) => void;
  setDosage: (value: string) => void;
  addSupplement: () => void;
 };
 
 export default function AddSupplementRow({
  name,
  dosage,
  setName,
  setDosage,
  addSupplement,
 }: AddSupplementRowProps) {
  return (
    <div className="mt-5 grid gap-3 rounded-[18px] border border-[#DDD7CF] bg-[#F3E9DD]/70 p-4 md:grid-cols-[1.6fr_1fr_110px] md:items-center">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Supplement, e.g. Magnesium"
        className="w-full rounded-2xl border border-[#D6CCBF] bg-white/70 px-4 py-3 outline-none"
      />
 
      <input
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        placeholder="Dosage (optional)"
        className="w-full rounded-2xl border border-[#D6CCBF] bg-white/70 px-4 py-3 outline-none"
      />
 
      <button
        onClick={addSupplement}
        className="w-full rounded-full bg-[#081620] px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-white">
 
        Add
      </button>
    </div>
  );
 }