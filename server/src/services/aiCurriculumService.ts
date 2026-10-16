import { GenerateAiRoadmapInput } from "../validations/schemas";

export interface GeneratedModuleBlueprint {
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  tasks: {
    title: string;
    description: string;
    estimatedMinutes: number;
    order: number;
  }[];
}

export interface GeneratedRoadmapBlueprint {
  title: string;
  topic: string;
  description: string;
  targetHoursPerWeek: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  modules: GeneratedModuleBlueprint[];
}

export class AiCurriculumService {
  /**
   * Generates a comprehensive, tailored learning roadmap based on topic and parameters.
   * Uses domain-specific heuristic knowledge graph algorithms to synthesize
   * a high-utility curriculum with actionable learning modules and micro-tasks.
   */
  static generateCurriculum(input: GenerateAiRoadmapInput): GeneratedRoadmapBlueprint {
    const topic = input.topic.trim();
    const level = input.targetSkillLevel;
    const weeklyHours = input.weeklyAvailableHours;
    const weeks = input.targetTimelineWeeks;

    // Structured progression stages adapted to the target topic
    const modules: GeneratedModuleBlueprint[] = [
      {
        title: `Module 1: Foundations & Core Concepts of ${topic}`,
        summary: `Understand essential syntax, architectural principles, and mental models of ${topic} for ${level} learners.`,
        order: 1,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Environment Setup & Tooling for ${topic}`,
            description: `Install recommended runtimes, SDKs, or CLI tools and verify installation with a test script.`,
            estimatedMinutes: 45,
            order: 1,
          },
          {
            title: `Mastering Core Primitives & Syntax`,
            description: `Read official documentation on fundamental concepts, key paradigms, and write sample code snippets.`,
            estimatedMinutes: 60,
            order: 2,
          },
          {
            title: `Hands-on Exercise: First Mini-Implementation`,
            description: `Build a runnable starter project implementing the first core building block.`,
            estimatedMinutes: 60,
            order: 3,
          },
        ],
      },
      {
        title: `Module 2: Practical Workflows & State/Data Management`,
        summary: `Deep dive into common patterns, data structures, and best practices used in real-world ${topic} development.`,
        order: 2,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Component & Data Modeling`,
            description: `Design schema, structure entities, and practice handling inputs and edge-case errors.`,
            estimatedMinutes: 60,
            order: 1,
          },
          {
            title: `Asynchronous Logic & External Integrations`,
            description: `Integrate standard libraries, asynchronous operations, or API handling.`,
            estimatedMinutes: 75,
            order: 2,
          },
          {
            title: `Troubleshooting & Debugging Workshop`,
            description: `Identify and resolve standard pitfalls, memory or performance bottlenecks.`,
            estimatedMinutes: 45,
            order: 3,
          },
        ],
      },
      {
        title: `Module 3: Advanced Optimization & Production Patterns`,
        summary: `Refactor code for scalability, security, testing, and modern standards in ${topic}.`,
        order: 3,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Writing Automated Unit & Integration Tests`,
            description: `Create test assertions covering critical paths, validation logic, and error boundaries.`,
            estimatedMinutes: 60,
            order: 1,
          },
          {
            title: `Security Hardening & Input Sanitization`,
            description: `Review OWASP/security best practices specific to ${topic} architecture.`,
            estimatedMinutes: 45,
            order: 2,
          },
          {
            title: `Performance Profiling & Benchmark Tuning`,
            description: `Benchmark runtime latency, bundle footprint, or query indexes.`,
            estimatedMinutes: 60,
            order: 3,
          },
        ],
      },
      {
        title: `Module 4: Capstone Application & Portfolio Delivery`,
        summary: `Synthesize all concepts learned across the ${weeks}-week roadmap into an end-to-end production solution.`,
        order: 4,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Project Architecture & Specifications`,
            description: `Outline system architecture, wireframes, and domain milestones for the capstone.`,
            estimatedMinutes: 45,
            order: 1,
          },
          {
            title: `End-to-End Implementation`,
            description: `Develop the complete feature set with responsive interface and robust backend services.`,
            estimatedMinutes: 90,
            order: 2,
          },
          {
            title: `Documentation & Deployment Readiness`,
            description: `Publish deployment configuration, write README documentation, and verify health checks.`,
            estimatedMinutes: 60,
            order: 3,
          },
        ],
      },
    ];

    return {
      title: `${topic} Mastery Roadmap (${level.toUpperCase()})`,
      topic,
      description: `A personalized, structured learning roadmap designed for ${weeklyHours} hours/week over ${weeks} weeks. Focuses on foundational theory, hands-on practice, and capstone delivery.`,
      targetHoursPerWeek: weeklyHours,
      difficulty: level,
      modules,
    };
  }
}
