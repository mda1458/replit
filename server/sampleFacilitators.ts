import { storage } from "./storage";

async function createSampleFacilitators() {
  try {
    // Check if facilitators already exist
    const existingFacilitators = await storage.getFacilitators();
    if (existingFacilitators.length > 0) {
      console.log("✓ Sample facilitators already exist");
      return;
    }

    const sampleFacilitators = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@forgiveness.world",
        bio: "Licensed clinical psychologist specializing in trauma-informed forgiveness therapy. Over 15 years of experience helping individuals heal from deep emotional wounds through compassionate guidance.",
        specialties: ["Trauma-Informed Care", "PTSD Recovery", "Family Therapy", "Grief Counseling"]
      },
      {
        name: "Michael Chen",
        email: "michael.chen@forgiveness.world", 
        bio: "Certified meditation instructor and mindfulness coach. Specializes in healing meditation techniques that combine Eastern wisdom with Western therapeutic approaches.",
        specialties: ["Meditation", "Mindfulness", "Stress Reduction", "Emotional Regulation"]
      },
      {
        name: "Elena Rodriguez",
        email: "elena.rodriguez@forgiveness.world",
        bio: "Master's in Counseling Psychology with specialization in relationship healing. Helps individuals and couples navigate complex forgiveness journeys in intimate relationships.",
        specialties: ["Relationship Therapy", "Couples Counseling", "Communication Skills", "Attachment Healing"]
      },
      {
        name: "Dr. David Kim",
        email: "david.kim@forgiveness.world",
        bio: "Workplace wellness consultant and organizational psychologist. Expert in helping professionals address workplace trauma and build healthier work environments.",
        specialties: ["Workplace Wellness", "Organizational Psychology", "Conflict Resolution", "Leadership Development"]
      },
      {
        name: "Maria Thompson",
        email: "maria.thompson@forgiveness.world",
        bio: "Youth counselor and teen specialist with over 10 years working with adolescents. Creates safe spaces for young people to explore forgiveness and emotional healing.",
        specialties: ["Teen Counseling", "Youth Development", "School-Based Therapy", "Family Systems"]
      }
    ];

    for (const facilitatorData of sampleFacilitators) {
      await storage.createFacilitator(facilitatorData);
    }

    console.log("✓ Sample facilitators created successfully");
  } catch (error) {
    console.error("Error creating sample facilitators:", error);
  }
}

export { createSampleFacilitators };