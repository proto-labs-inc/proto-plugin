import { AdvisorSection } from "./advisor-section";
import { ConnectSection } from "./connect-section";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import { TopSection } from "./top-section";

export default function ProjectOverviewStarterScreen() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-dash-sidebar">
      <ProjectHeader />

      <div className="flex flex-1 w-full overflow-y-hidden min-h-0">
        <ProductSidebar />

        <div className="flex flex-1 min-w-0 overflow-y-auto">
          <div className="w-full h-full">
            <div className="mx-auto w-full max-w-[1200px] px-6 pt-8">
              <TopSection />
            </div>

            <div className="mx-auto w-full max-w-[1200px] px-6 pb-32 pt-12 flex flex-col gap-12">
              <ConnectSection />
              <AdvisorSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
