import { test, expect } from "vitest";

// A minimal simulated end-to-end flow for the mobile pipeline
async function simulateMobilePipeline() {
  const submitRes = await fetch("http://localhost:3000/api/mobile/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Broken Bridge in Gumla",
      description: "The main concrete bridge connecting 3 villages has collapsed due to heavy rainfall.",
      district: "Gumla",
      location: "River Block 4",
      reporterId: "test-citizen-id",
    })
  });
  
  if (!submitRes.ok) return { success: false, step: "submit" };
  const submitData = await submitRes.json();
  
  const verifyRes = await fetch("http://localhost:3000/api/mobile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId: submitData.challengeId,
      sarpanchId: "test-sarpanch-id",
    })
  });
  
  if (!verifyRes.ok) return { success: false, step: "verify", status: verifyRes.status };
  return { success: true, ...submitData };
}

simulateMobilePipeline().then(console.log).catch(console.error);
