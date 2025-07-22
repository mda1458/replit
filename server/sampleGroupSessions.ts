import { storage } from "./storage";

// Create sample group sessions for demonstration
export async function createSampleGroupSessions() {
  try {
    // First, create sample facilitator users
    await storage.upsertUser({
      id: "facilitator_1",
      email: "sarah@forgiveness.world",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: "https://via.placeholder.com/100",
      codeName: "FacilitatorSarah"
    });

    await storage.upsertUser({
      id: "facilitator_2", 
      email: "michael@forgiveness.world",
      firstName: "Michael",
      lastName: "Chen",
      profileImageUrl: "https://via.placeholder.com/100",
      codeName: "FacilitatorMichael"
    });

    await storage.upsertUser({
      id: "facilitator_3",
      email: "elena@forgiveness.world",
      firstName: "Elena",
      lastName: "Rodriguez",
      profileImageUrl: "https://via.placeholder.com/100",
      codeName: "FacilitatorElena"
    });

    await storage.upsertUser({
      id: "facilitator_4",
      email: "david@forgiveness.world",
      firstName: "David",
      lastName: "Kim",
      profileImageUrl: "https://via.placeholder.com/100",
      codeName: "FacilitatorDavid"
    });

    await storage.upsertUser({
      id: "facilitator_5",
      email: "maria@forgiveness.world",
      firstName: "Maria",
      lastName: "Thompson",
      profileImageUrl: "https://via.placeholder.com/100",
      codeName: "FacilitatorMaria"
    });

    // Free Foundation Circle Sessions (included with Guided Journey subscription)
    await storage.createGroupSession({
      title: "Forgiveness Foundation Circle",
      description: "Weekly support group focusing on the fundamentals of forgiveness. Share your journey with others in a safe, confidential space using code names.",
      facilitatorId: "facilitator_1",
      scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maxParticipants: 8,
      currentParticipants: 3,
      sessionType: "forgiveness_foundation",
      status: "scheduled",
      sessionFee: "0.00",
      isRecurring: true,
      meetingLink: "https://meet.forgiveness.world/foundation-circle-1"
    });

    await storage.createGroupSession({
      title: "Forgiveness Foundation Circle",
      description: "Weekly support group focusing on the fundamentals of forgiveness. A recurring safe space for healing and growth.",
      facilitatorId: "facilitator_2", 
      scheduledTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      maxParticipants: 8,
      currentParticipants: 5,
      sessionType: "forgiveness_foundation",
      status: "scheduled",
      sessionFee: "0.00",
      isRecurring: true,
      meetingLink: "https://meet.forgiveness.world/foundation-circle-2"
    });

    // Paid Specialty Sessions
    await storage.createGroupSession({
      title: "Healing Meditation Workshop",
      description: "Advanced guided meditation sessions combining mindfulness with forgiveness practices. Experience deeper emotional release through specialized techniques.",
      facilitatorId: "facilitator_3",
      scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxParticipants: 6,
      currentParticipants: 2,
      sessionType: "healing_meditation",
      status: "scheduled",
      sessionFee: "45.00",
      isRecurring: false,
      meetingLink: "https://meet.forgiveness.world/healing-meditation-1"
    });

    await storage.createGroupSession({
      title: "Advanced RELEASE Workshop",
      description: "Intensive deep-dive into the RELEASE methodology. Advanced techniques for breaking through forgiveness barriers and emotional blocks.",
      facilitatorId: "facilitator_4",
      scheduledTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxParticipants: 6,
      currentParticipants: 1,
      sessionType: "advanced_release",
      status: "scheduled", 
      sessionFee: "65.00",
      isRecurring: false,
      meetingLink: "https://meet.forgiveness.world/advanced-release-1"
    });

    await storage.createGroupSession({
      title: "Trauma-Informed Forgiveness Circle",
      description: "Specialized support for those dealing with trauma while on their forgiveness journey. Led by trauma-informed therapy specialists.",
      facilitatorId: "facilitator_5",
      scheduledTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      maxParticipants: 6,
      currentParticipants: 4,
      sessionType: "trauma_informed",
      status: "scheduled",
      sessionFee: "75.00",
      isRecurring: false,
      meetingLink: "https://meet.forgiveness.world/trauma-informed-1"
    });

    console.log("✓ Sample group sessions created successfully");
  } catch (error) {
    console.log("Sample sessions might already exist or database not ready:", error.message);
  }
}