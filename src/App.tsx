import { FreedomCalculator } from "@/components/freedom-calculator"
import { InvestmentCalculator } from "@/components/investment-calculator"
import { PagePager, type PagerPage } from "@/components/page-pager"

const PAGES: PagerPage[] = [
  {
    id: "investment",
    label: "Investment Calculator",
    content: <InvestmentCalculator />,
  },
  {
    id: "freedom",
    label: "Freedom Calculator",
    content: <FreedomCalculator />,
  },
]

export function App() {
  return <PagePager pages={PAGES} />
}

export default App
