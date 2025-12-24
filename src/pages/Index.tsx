import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AssetBuckets } from "@/components/assets/AssetBuckets";
import { ThemeGenerator } from "@/components/generator/ThemeGenerator";
import { ContentPlanner } from "@/components/planner/ContentPlanner";
import { ExportPanel } from "@/components/export/ExportPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "assets":
        return <AssetBuckets />;
      case "generator":
        return <ThemeGenerator />;
      case "content":
        return <ContentPlanner />;
      case "export":
        return <ExportPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
