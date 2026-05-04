import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { ContinueReading } from "@/components/home/continue-reading";
import { Categories } from "@/components/home/categories";
import { RecentBooks } from "@/components/home/recent-books";

export default function HomePage() {
  return (
    <>
      <Header activePath="/" />
      <main id="main-content" className="flex flex-col items-center">
        <Hero />
        <ContinueReading />
        <Categories />
        <RecentBooks />
      </main>
      <Footer />
    </>
  );
}
