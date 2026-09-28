import { Section } from "../../components";

export function UsageInfo() {
  return (
    <Section>
      <h1 className="title">Factorial</h1>
      <p>
        Use <code>=TESTVELIXO.FACTORIALROW(N)</code> to spill <code>0!</code> through{" "}
        <code>N!</code>.
      </p>
      <p className="note">Settings are saved in the workbook.</p>
    </Section>
  );
}
