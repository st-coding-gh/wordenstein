# this is a project dedicated to learning English

## the main functionality will be related to learning vocabulary

## .env file at github

```bash
# .env file
DATABASE_URL="file:./prod.db"
```

## credentials dev

```bash
st-coding@yandex.ru
12345
```

## prompt

Your task is to explain the prompted word meaning in order to help me to improve my vocabulary. When you are prompted with a word please give you answer in JSON with the strings which are formatted with markdown, use markdown vastly to highlight, group etc. The JSON will have the following structure:

```json
{
  "word": "write here the prompted word",
  "transcription": "the transcription of the prompted word",
  "definition": "definition, explanation of the word",
  "translation": "list here the most close and accurate equivalent words in Russian",
  "comparison": "generate a table in markdown. the table will contain the prompted words and several other words close by meaning. Table must contain the following columns: 1)difference in meaning, 2) example of usage, 3) how frequently it is used today, 4) common context for usage (literature, speech, official documents, etc) 5) high/low language  6) connotation (negative, positive, neutral)",
  "examplesBestChoice": "Give examples that compare the prompted word with each and every of the table above in a way of a sentense where the prompted word is the best choice and another word does not fit and why, use markdown",
  "examplesNotBestChoice": "Give the opposite examples, where the prompted word is not appropriate and another word fits better",
  "imagePrompt": "write here a prompt from text-to-image generative tools to create an image that will illustrate the prompted word"
}
```

## examples

```json
{
  "word": "abomination",
  "transcription": "/əˌbɑː.məˈneɪ.ʃən/",
  "definition": "**Abomination** refers to something that is deeply offensive, detestable, or morally repugnant. It often conveys a strong sense of disgust or horror toward an act, object, or behavior.",
  "translation": "мерзость, отвратительное явление, гнусность",
  "comparison": "### Comparison of 'abomination' with similar words\n\n| Word            | Difference in Meaning | Example of Usage | Frequency of Use | Common Context | High/Low Language | Connotation |\n|----------------|----------------------|------------------|-----------------|----------------|----------------|-------------|\n| **Abomination** | Strong disgust, moral horror, and detestation | *The destruction of ancient temples was considered an abomination.* | Moderate | Literature, religious and moral discussions | High | Negative |\n| **Atrocity** | An act of extreme cruelty, especially in war or crime | *The genocide was one of the worst atrocities in history.* | High | News, historical discussions, legal contexts | High | Negative |\n| **Disgrace** | Something shameful that brings dishonor | *His betrayal of his friends was a disgrace.* | Common | Social discussions, reputation-related issues | Medium | Negative |\n| **Horror** | Extreme fear or shock, usually from something supernatural or terrifying | *The horror of the crime scene left everyone speechless.* | Common | Literature, movies, emotional reactions | Medium | Negative |\n| **Repulsion** | A strong feeling of disgust, often physical | *She felt repulsion at the sight of the rotten food.* | Common | Everyday speech, emotional descriptions | Low | Negative |\n",
  "examplesBestChoice": "### Examples where 'abomination' is the best choice\n- **The dictator’s actions were an *abomination* to the principles of democracy.** ('Atrocity' could work, but 'abomination' emphasizes moral disgust.)\n- **The church condemned the ritual as an *abomination*.** (Neither 'horror' nor 'disgrace' convey the same strong moral repulsion.)\n- **Their treatment of animals is an *abomination* to any civilized society.** ('Disgrace' would be too weak; 'atrocity' may not apply if there’s no extreme cruelty.)\n",
  "examplesNotBestChoice": "### Examples where 'abomination' is not the best choice\n- **The war crimes committed were a global *atrocity*.** ('Abomination' is too moralistic; 'atrocity' fits better.)\n- **The failed project was a complete *disgrace* to the company.** ('Abomination' would be too extreme; 'disgrace' is more suitable.)\n- **He recoiled in *horror* at the sight of the ghostly figure.** ('Abomination' doesn’t convey fear in this context.)\n",
  "imagePrompt": "A dark and eerie scene of a ruined temple with monstrous creatures emerging from the shadows, symbolizing something cursed and repugnant, evoking a sense of horror and moral corruption."
}
```

## test of deploy again
