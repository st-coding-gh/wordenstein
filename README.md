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

## 📘 plan

- [x] edit cards
- [x] markdown in all card sections
- [x] training mode with russian words only
- [x] training mode with words from the end of the list
- [ ] replace images
- [ ] stats on size of the database and size of images
- [ ] check duplicates in vocabulary

## 📝 notes

money before: 688
monet after: 421
spent: 267
cards generated: 212
money per card: 267 / 212 = 1.26
