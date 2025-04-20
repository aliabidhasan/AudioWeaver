# Audio Weaver: Empowering Podcast Creation and Collaborative Learning

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintenance](https://img.shields.io/badge/Maintained-No-yellow.svg)](https://github.com/aliabidhasan/AudioWeaver) 

**Audio Weaver** is a cutting-edge technological solution designed to streamline podcast creation and foster a deeper, more collaborative learning experience around audio content. Leveraging the power of Large Language Models (LLMs), Audio Weaver enables users to generate podcast episodes and engage with the content in meaningful ways.

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

- Bring your own API Key (for Eleven Labs and Gemini).
- The app currently utilizies _Gemini 2.0 Flash Lite_ for improved performance on PDF parsing with lesser costs.
- The app also utilizes _Eleven Labs Flash v2.5_ for producing high quality TTS output based on the system prompt for generating interactive podcast-style content.
- The app provides modal for user to reflect on the produced content. 

### Installation

1. Use Replit or Netlify to host the application

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
