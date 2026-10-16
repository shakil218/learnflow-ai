import { IQuizQuestion } from "../types/models";

export class AiQuizService {
  /**
   * Generates dynamic assessment questions tailored to the roadmap/module topic.
   */
  static generateQuizQuestions(topic: string): IQuizQuestion[] {
    const cleanTopic = topic.trim();

    return [
      {
        id: "q1",
        question: `What is the primary advantage of adopting best practices in ${cleanTopic}?`,
        options: [
          `Increased maintainability, predictability, and fewer production errors.`,
          `It completely eliminates the need for testing.`,
          `It restricts the team to only single-threaded execution.`,
          `It makes code run on outdated operating systems without updates.`,
        ],
        correctOptionIndex: 0,
        explanation: `Adopting best practices in ${cleanTopic} ensures cleaner architecture, higher code quality, and maintainability across team members.`,
      },
      {
        id: "q2",
        question: `When designing components or modules for ${cleanTopic}, which principle is recommended?`,
        options: [
          `Place all state and business logic in a single monolith function.`,
          `Separation of concerns and single responsibility.`,
          `Avoid documenting interfaces or typing schemas.`,
          `Hardcode credentials directly in the client bundle.`,
        ],
        correctOptionIndex: 1,
        explanation: `Separation of concerns ensures that each component or module handles a distinct piece of business logic or UI rendering.`,
      },
      {
        id: "q3",
        question: `How should errors and async rejections be managed in a ${cleanTopic} project?`,
        options: [
          `Ignore errors silently and suppress console output.`,
          `Crash the server on any input mismatch.`,
          `Gracefully capture exceptions with try/catch, log diagnostic messages, and return user-friendly error states.`,
          `Retry the failing network call infinitely without backoff.`,
        ],
        correctOptionIndex: 2,
        explanation: `Graceful exception handling with user feedback prevents unhandled promise rejections and gives clear UX.`,
      },
      {
        id: "q4",
        question: `Why is schema validation (e.g. Zod) crucial when handling inputs in ${cleanTopic}?`,
        options: [
          `It validates runtime data types before reaching database and business logic, preventing malformed state or injection.`,
          `It speeds up internet connection bandwidth.`,
          `It replaces CSS styling requirements.`,
          `It is strictly required by web browsers to load HTML.`,
        ],
        correctOptionIndex: 0,
        explanation: `Schema validation acts as an explicit gatekeeper verifying payload shapes and preventing security/type defects.`,
      },
    ];
  }
}
