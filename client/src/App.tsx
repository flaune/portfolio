import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Desktop } from "@/components/os/Desktop";
import { BootSequence } from "@/components/os/BootSequence";
import { AudioProvider } from "@/components/AudioProvider";
import { useState } from "react";

function Router() {
  const [booted, setBooted] = useState(false);
  const [showMewBoot, setShowMewBoot] = useState(false);

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  if (showMewBoot) {
    return <BootSequence variant="mew" onComplete={() => setShowMewBoot(false)} />;
  }

  const handleEasterEgg = () => {
    setShowMewBoot(true);
  };

  return (
    <Switch>
      <Route path="/">
        <Desktop onEasterEgg={handleEasterEgg} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;