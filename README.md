# Audio Weaver: Empowering Podcast Creation and Collaborative Learning

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Maintenance](https://img.shields.io/badge/Maintained-No-yellow.svg)](https://github.com/aliabidhasan/AudioWeaver)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

<img src="https://github.com/user-attachments/assets/88a53b04-999e-4bba-b137-1ba6ffe3b88a" width="100" height="100" alt="Logo">


**Audio Weaver** is a cutting-edge technological solution designed to streamline podcast creation and foster a deeper, more collaborative learning experience around audio content. Leveraging the power of Large Language Models (LLMs), Audio Weaver enables users to generate podcast episodes and engage with the content in meaningful ways.

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aliabidhasan/AudioWeaver)

## Key Affordances

Audio Weaver is designed to offer the following key functionalities:

* **Effortless Podcast Generation:** Quickly create podcast episodes based on your input, powered by advanced Gemini.
* **Guided Comprehension of Complex Information:** Navigate and understand dense topics through well-structured audio, potentially with segmented content and integrated summaries.
* **Active Engagement and Shared Understanding:** Interact with content through integrated note-taking, time-stamped comments, discussion forums, and self-assessment features.
* **Potential for Future Multilingual Content:** While currently English-only, the platform is designed with future multilingual capabilities in mind.
* **Seamless Sharing and Community Building:** Easily share podcast episodes or specific segments across various platforms and connect with others around the content.

## Limitations

Please be aware of the current limitations of Audio Weaver:

* **Podcast Output Quality Dependent on LLM:** The quality of the generated audio content is inherently tied to the capabilities and nuances of the underlying Large Language Model.
* **Limited Output Control Beyond System Prompts:** User control over the generated output is primarily managed through the system prompts provided to the application.
* **Potential for Users to Bypass Scaffolding:** While designed to guide learning, users may choose to interact with the content outside of the intended scaffolding features.
* **Emphasis on User Experience and Journey:** Continuous effort is being placed on refining the user experience and ensuring an intuitive user journey within the application.
* **English Outputs Only (Currently):** The current version of Audio Weaver exclusively supports the generation of podcast content in English.
* **LLM Performance in Other Languages:** While LLMs generally perform exceptionally well in English, performance in other languages is gradually improving and will be a focus for future development.

## Getting Started

### Prerequisites

Audio Weaver relies on external services for its AI-powered features. You will need to provide API keys for these services. While the application allows you to enter these keys through an in-app settings modal, it's recommended to configure them as environment variables for more robust backend functionality, especially in deployed environments.

-   **`GEMINI_API_KEY`**:
    *   **Purpose:** Used for generating summaries and other AI-driven content analysis via Google's Gemini models.
    *   **Setup:** Obtain your API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (or your Google Cloud project) and set it as an environment variable named `GEMINI_API_KEY`.
-   **`ELEVENLABS_API_KEY`**:
    *   **Purpose:** Used for converting the generated text summaries into high-quality audio using ElevenLabs' text-to-speech service.
    *   **Setup:** Obtain your API key from your [ElevenLabs account](https://elevenlabs.io/) and set it as an environment variable named `ELEVENLABS_API_KEY`.

**Fallback Behavior:**
*   The application's backend services (like document processing) will prioritize API keys set as environment variables.
*   If these environment variables are not set, the backend will attempt to use keys that you have saved through the in-app settings modal.
*   If no keys are found in either environment variables or the in-app settings, the backend will use placeholder demo keys. This allows the application to run, but the AI summarization and text-to-speech features will not function correctly.
*   The in-app settings modal (mentioned in the "Usage" section below) provides a user-friendly way to manage your API keys, especially for client-side operations or if you prefer not to set environment variables during local development.

- The app currently utilizies _Gemini 2.0 Flash Lite_ (or a similar model accessible via your API key) for improved performance on PDF parsing with lesser costs.
- The app also utilizes _Eleven Labs Flash v2.5_ (or a similar model accessible via your API key) for producing high quality TTS output.
- The app provides modal for user to reflect on the produced content.

### Installation

1. Use Replit or Netlify to host the application

### Database Setup

Audio Weaver requires a PostgreSQL database to store user data, podcast information, and other application data.

1.  **Set up a PostgreSQL Database:**
    *   You can use any PostgreSQL provider. Some popular choices include:
        *   [Neon](https://neon.tech/) (Serverless PostgreSQL, offers a free tier)
        *   AWS RDS for PostgreSQL
        *   Google Cloud SQL for PostgreSQL
        *   A local PostgreSQL instance for development.
2.  **Configure `DATABASE_URL`:**
    *   Once your database is provisioned, you will get a connection string (URL).
    *   Set this connection string as an environment variable named `DATABASE_URL` in your deployment environment (e.g., Replit Secrets, Netlify environment variables).
    *   The format typically looks like: `postgresql://user:password@host:port/database`

### Schema Management

The database schema is defined in `shared/schema.ts`. This project uses [Drizzle ORM](https://orm.drizzle.team/) and [Drizzle Kit](https://orm.drizzle.team/kit/overview) for schema management. The Drizzle Kit configuration is located in `drizzle.config.ts`.

There are two primary ways to manage and apply schema changes:

1.  **Generating SQL Migrations (Recommended for Production):**
    *   After making changes to `shared/schema.ts`, you can generate SQL migration files by running:
        ```bash
        npm run db:generate
        ```
    *   This command will create new migration files in the `./migrations` directory. These files contain the SQL statements to update your database schema.
    *   Review these files and commit them to your version control system.
    *   To apply these migrations to your database in a production environment, you would typically use a separate migration tool or script that executes the SQL in these files. (Note: This project does not currently include a built-in script for running these SQL migrations; `db:push` is used for development.)

2.  **Pushing Schema Changes Directly (Convenient for Development):**
    *   For development purposes, you can directly synchronize your database schema with the definitions in `shared/schema.ts` by running:
        ```bash
        npm run db:push
        ```
    *   This command will attempt to make the necessary changes to your database to match the schema.
    *   **Caution:** `db:push` is destructive and not recommended for production databases as it can lead to data loss if not used carefully. It's best suited for local development and prototyping.

### Usage

1.  The app will ask you for your API key that will be stored locally in your instance for connecting with the AI services (Gemini, ElevenLabs)

![image](https://github.com/user-attachments/assets/0b8510f0-8d77-49d6-b27c-5b4f22e79cc7)

2.  The app will ask you to upload relevant documents that you want to parse and analyze 

![image](https://github.com/user-attachments/assets/2a1df295-a5b5-416f-be30-c8af42ab5177)

3.  Before processing documents, the app will ask the user for additional context based on the following questions

![image](https://github.com/user-attachments/assets/6e95006b-a1d9-432b-8b39-97830c5477e5)

4.  The app works its magic to generate a summary and an audio output

![image](https://github.com/user-attachments/assets/2063b4f8-3a40-4904-8e28-f7c5c5616968)

![image](https://github.com/user-attachments/assets/1fc4e64f-887d-4956-9d0d-4c6de2463602)

5. The user will critically reflect on the output through a series of prompts to enhance the audio generation

![image](https://github.com/user-attachments/assets/d6c744f4-090d-48d5-abeb-41a2c8c122b7)


## Contributing

We welcome contributions to Audio Weaver! If you have ideas for improvements, bug reports, or would like to contribute code, please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your changes to your fork.
5.  Submit a pull request.

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). ## Support

For any questions, issues, or feedback, please [link to your support channel, e.g., GitHub Issues, a forum, or contact email].

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

* Powered by [Name of the LLM or API provider]
* Inspired by research in [relevant research areas]

## Future Enhancements

We are continuously working on improving Audio Weaver. Some planned future enhancements include:

* Expansion to support multiple languages for both prompting and output.
* Refinements to the audio output quality through advanced LLM techniques or post-processing options.
* More granular control over the generated audio (e.g., voice selection, music integration).
* Enhanced scaffolding features to further guide and support learning.
* Integration with other learning platforms and tools.
* Improved user interface and user experience based on user feedback.

---

**Stay tuned for updates and new features as we continue to weave the future of audio learning!**
