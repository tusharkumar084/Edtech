import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardTabs } from "./DashboardTabs";
import { ScheduleMaker } from "./tabs/ScheduleMaker";
import { StudyTab } from "./tabs/StudyTab";
import { GroupsTab } from "./tabs/GroupsTab";
import { ClassesTab } from "./tabs/ClassesTab";

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return <ScheduleMaker />;
      case "study":
        return <StudyTab />;
      case "groups":
        return <GroupsTab />;
      case "classes":
        return <ClassesTab />;
      default:
        return <ScheduleMaker />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};