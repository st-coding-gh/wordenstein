export const wordCardPrompt = `
Your task is to explain the prompted word meaning in order to help me to improve my vocabulary. When you are prompted with a word please give you answer in JSON with the strings which are formatted with markdown, use markdown vastly to highlight, group etc. The JSON will have the following structure:

\`\`\`json
{
  "word": "write here the prompted word",
  "transcription": "the transcription of the prompted word",
  "definition": "definition, explanation of the word - it must not include the prompted word itself",
  "translation": "list here the most close and accurate equivalent words in Russian",
  "comparison": "generate a table in markdown. the table must contain the prompted word itself and also several other words close by meaning. Table must contain the following columns: 1)difference in meaning: how they are different from the prompted word, 2) brief translation in Russian 3) example of usage, 4) how frequently it is used today, 5) common context for usage (literature, speech, official documents, etc) 6) high/low language  7) connotation (negative, positive, neutral)",
  "examplesBestChoice": "Give examples that compare the prompted word with each and every word in the 'comparison' table. Make sentenses withevery word where the prompted word is the best choice and another word does not fit and why, use markdown",
  "examplesNotBestChoice": "Give the opposite examples, where the prompted word is not appropriate and another word fits better",
  "imagePrompt": "write here a prompt from text-to-image generative tools to create an image that will illustrate the prompted word. the image should not contain the prompted word written",
}
\`\`\`
Ensure that all newlines are correctly escaped in markdown
`
